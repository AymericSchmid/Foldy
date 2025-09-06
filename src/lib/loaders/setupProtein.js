import { loadPDB } from "./loadPDB";
import { catmullRomChain } from "../core/geometry";
import { RMFFrameGenerator } from "../mesh/RMFFrameGenerator";
import { TubeMeshBuilder } from "../mesh/TubeMeshBuilder";

export async function setupProtein(url = 'public/models/p53.pdb', splineResolution = 10, meshRadialSegments = 15, meshTubeRadius = 0.005) {
    // Load and preprocess protein structure
    const sequence = await loadPDB(url);
    sequence.sort((a, b) => a.residueSeqNumber - b.residueSeqNumber);
    const caPoints = new Float32Array(sequence.flatMap(a => [a.x, a.y, a.z]));
  
    // Smooth curve through C-alpha atoms
    const spline = catmullRomChain(caPoints, splineResolution, { a: 1.0 });
    
    // Generate RMF coordinate frame at each spline point
    const frameGenerator = new RMFFrameGenerator(spline);
    frameGenerator.compute();
    const { t, r, c } = frameGenerator.getFrames();

    // Build tube geometry
    const tubeMeshBuilder = new TubeMeshBuilder(spline, { t, r, c }, { 
        radius: meshTubeRadius, radialSegment: meshRadialSegments
    });
    tubeMeshBuilder.generateMesh();
    const tubeCaps = tubeMeshBuilder.tesselateTubeCaps();
    tubeMeshBuilder.tesselateTube();
    const tubePositions = tubeMeshBuilder.getTubeTriangles();
    const tubeNormals = tubeMeshBuilder.getTubeNormals();

    return { 
        spline,
        caPoints, 
        tubePositions,
        tubeNormals,
        tubeCaps,
        vectors: { t, r, c },
    };
}