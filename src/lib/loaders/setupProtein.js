import { loadPDB } from "./loadPDB";
import { catmullRomChain } from "../core/geometry";
import { RMFFrameGenerator } from "../mesh/RMFFrameGenerator";
import { TubeMeshBuilder } from "../mesh/TubeMeshBuilder";

// more optimized than concatenating with ...
function concatFloat32(chunks) {
    const total = chunks.reduce((n, a) => n + a.length, 0);
    const out = new Float32Array(total);
    let offset = 0;
    for (const a of chunks) {
        out.set(a, offset);
        offset += a.length;
    }
    return out;
}

export async function setupProtein(url, splineResolution = 10, meshRadialSegments = 10, meshTubeRadius = 0.005) {
    // Load and preprocess protein structure
    const sequence = await loadPDB(url);
    const chainIds = Array.from(new Set(sequence.map(a => a.chainId)));

    let allCaPoints = [];
    let allSplinePoints = [];
    let allTubePositions = [];
    let allTubeNormals = [];
    let allTubeCaps = [];
    let allT = [];
    let allR = [];
    let allC = [];

    for (const id of chainIds) {
        console.log(id)
        const chainSeq = sequence
                            .filter(a => a.chainId === id)
                            .sort((a, b) => a.residueSeqNumber - b.residueSeqNumber);
        const caPoints = new Float32Array(chainSeq.flatMap(a => [a.x, a.y, a.z]));
        allCaPoints.push(caPoints);
    
        // Smooth curve through C-alpha atoms
        const spline = catmullRomChain(caPoints, splineResolution, { a: 1.0 });
        
        // Generate RMF coordinate frame at each spline point
        const frameGenerator = new RMFFrameGenerator(spline);
        frameGenerator.compute();
        const { t, r, c } = frameGenerator.getFrames();
        allT.push(t)
        allR.push(r)
        allC.push(c)

        // Build tube geometry
        const tubeMeshBuilder = new TubeMeshBuilder(spline, { t, r, c }, { 
            radius: meshTubeRadius, radialSegment: meshRadialSegments
        });
        tubeMeshBuilder.generateMesh();
        tubeMeshBuilder.tesselateTubeCaps();
        tubeMeshBuilder.tesselateTube();
        
        allTubePositions.push(tubeMeshBuilder.getTubeTriangles());
        allTubeNormals.push(tubeMeshBuilder.getTubeNormals());
        allTubeCaps.push(tubeMeshBuilder.getTubeCaps());
    }

    return {
        'caPoints': concatFloat32(allCaPoints),
        'splinePoints': concatFloat32(allSplinePoints),
        'tubePositions': concatFloat32(allTubePositions),
        'tubeNormals': concatFloat32(allTubeNormals),
        'tubeCaps': concatFloat32(allTubeCaps),
        't': concatFloat32(allT),
        'r': concatFloat32(allR),
        'c': concatFloat32(allC)
    }
}