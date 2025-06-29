import createSphere from 'primitive-sphere'
import { loadPDB } from "../loaders/loadPDB";
import { catmullRomChain } from "../utils/geometry";
import { RMFFrameGenerator } from "../mesh/RMFFrameGenerator";
import { TubeMeshBuilder } from "../mesh/TubeMeshBuilder";
import { VIS, MESH } from '../config';


export async function setupProtein() {
    // Load and preprocess protein structure
    const sequence = await loadPDB('public/models/p53.pdb');
    sequence.sort((a, b) => a.residueSeqNumber - b.residueSeqNumber);
    const caPoints = new Float32Array(sequence.flatMap(a => [a.x, a.y, a.z]));
  
    // Smooth curve through C-alpha atoms
    const spline = catmullRomChain(caPoints, VIS.SPLINE_RES, { a: 1.0 });
    
    // Generate RMF coordinate frame at each spline point
    const frameGenerator = new RMFFrameGenerator(spline);
    frameGenerator.compute();
    const { t, r, c } = frameGenerator.getFrames();

    // Build tube geometry
    const tubeMeshBuilder = new TubeMeshBuilder(spline, { t, r, c }, { 
        radius: MESH.TUBE_RADIUS, radialSegment: MESH.TUBE_RADIAL_SEGMENTS 
    });
    tubeMeshBuilder.generateMesh();
    const tubeCaps = tubeMeshBuilder.tesselateTubeCaps();
    tubeMeshBuilder.tesselateTube();
    const tubePositions = tubeMeshBuilder.getTubeTriangles();
    const tubeNormals = tubeMeshBuilder.getTubeNormals();

    // Create a unit sphere geometry
    const sphere = createSphere(0.06, { segments: MESH.SPHERE_SEGMENTS, });

    return {
        sphere, 
        spline,
        caPoints, 
        tubePositions,
        tubeNormals,
        tubeCaps,
        vectors: { t, r, c },
    };
}