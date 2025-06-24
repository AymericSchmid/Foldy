import { regl } from "./regl-init";
import mat4 from 'gl-mat4';
import createSphere from 'primitive-sphere'
import { loadPDB } from "./loaders/loadPDB";
import { createDrawTestProt } from "./draw/drawTestProt";
import { createDrawSpheres } from "./draw/drawSpheres";
import { createDrawVectors } from "./draw/drawVectors";
import { createDrawCircleCaps } from "./draw/drawCircleCaps"
import { createDrawTube } from "./draw/drawTube";
import { createTrackball } from "./controls/trackball";
import { createUiControls } from "./controls/uiControls";
import { RMFFrameGenerator } from "./mesh/RMFFrameGenerator";
import { TubeMeshBuilder } from "./mesh/TubeMeshBuilder";
import { catmullRomChain, buildVectorLines } from "./utils/geometry";

// Visualization configuration
const SPLINE_RESOLUTION = 6;
const VECTORS_SCALE = 0.02;
const SPHERE_SEGMENTS = 16;
const TUBE_RADIUS = 0.004;
const TUBE_RADIAL_SEGMENTS = 8;
const CATMULL_ROM_ALPHA = 1.0;

// Canvas and camera setup
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rotation = createTrackball(canvas);   // Interactive rotation controller
const state = createUiControls();           // UI toggles (spheres, vectors, etc.)

const projection = mat4.perspective([],
  Math.PI / 4,    // fov
  canvas.width / canvas.height, // aspect
  0.01,           // near
  1000            // far
);

// Async initialization
(async() => {
  // Load and preprocess protein structure
  const sequence = await loadPDB('public/models/p53.pdb');
  sequence.sort((a, b) => a.residueSeqNumber - b.residueSeqNumber);

  const aminoAcidsPoints = new Float32Array(sequence.flatMap(a => [a.x, a.y, a.z]));

  // Smooth curve through C-alpha atoms
  const splinePoints = catmullRomChain(aminoAcidsPoints, SPLINE_RESOLUTION, { a: CATMULL_ROM_ALPHA });

  // Generate RMF coordinate frame at each spline point
  const frameGenerator = new RMFFrameGenerator(splinePoints);
  frameGenerator.compute();
  const { t, r, c } = frameGenerator.getFrames();

  // Generate 3D vector lines (tangent, normal, binormal)
  const tangeantLines = buildVectorLines(splinePoints, t, VECTORS_SCALE);
  const refLines = buildVectorLines(splinePoints, r, VECTORS_SCALE);
  const binormalLines = buildVectorLines(splinePoints, c, VECTORS_SCALE);

   // Build tube geometry
  const tubeMeshBuilder = new TubeMeshBuilder(splinePoints, { t, r, c }, { 
    radius: TUBE_RADIUS, radialSegment: TUBE_RADIAL_SEGMENTS 
  });
  tubeMeshBuilder.generateMesh();
  const tubeCaps = tubeMeshBuilder.tesselateTubeCaps();
  tubeMeshBuilder.tesselateTube();
  const tubePositions = tubeMeshBuilder.getTubeTriangles();
  const tubeNormals = tubeMeshBuilder.getTubeNormals();

  // Create a unit sphere geometry
  const sphere = createSphere(0.06, { segments: SPHERE_SEGMENTS, });

  // Draw commands
  const drawTestProt = await createDrawTestProt(regl);
  const drawSplinePoints = await createDrawSpheres(regl, sphere, splinePoints);
  const drawAminoAcids = await createDrawSpheres(regl, sphere, aminoAcidsPoints);
  const drawTangent = createDrawVectors(regl, tangeantLines);
  const drawReference = createDrawVectors(regl, refLines);
  const drawBinormal = createDrawVectors(regl, binormalLines);
  const drawCircleCaps = createDrawCircleCaps(regl, tubeCaps);
  const drawTube = createDrawTube(regl, tubePositions, tubeNormals);

  // Animation loop
  regl.frame(() => {
    regl.clear({ color: [0,0,0.2, 1], depth: 1});

    // Build shared model matrix with interactive rotation
    const sharedModel = mat4.create();
    mat4.translate(sharedModel, sharedModel, [0, 0, -1.5]);
    mat4.rotateX(sharedModel, sharedModel, rotation.x);
    mat4.rotateY(sharedModel, sharedModel, rotation.y);

    // Conditional rendering based on UI state
    if (state.showSplines)
      drawSplinePoints({ projection, model: sharedModel });

    if (state.showAminoAcids)
      drawAminoAcids({ projection, model: sharedModel });

    if (state.showVectors) {
      drawTangent({ projection, model: sharedModel, color: [1, 0, 0] });
      drawReference({ projection, model: sharedModel, color: [0, 1, 0] });
      drawBinormal({ projection, model: sharedModel, color: [0, 0, 1] });
    } 

    if (state.showTubeCaps)
      drawCircleCaps({ projection, model: sharedModel, color: [0.8, 0.1, 0.5], alpha: 0.8 });
    
    if (state.showTube)
      drawTube({ projection, model: sharedModel, color: [1, 0, 0], alpha: 1.0 });
  })
})();