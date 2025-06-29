import { initRegl } from "./regl-init";
import mat4 from 'gl-mat4';
import { createDrawSpheres } from "./draw/drawSpheres";
import { createDrawVectors } from "./draw/drawVectors";
import { createDrawCircleCaps } from "./draw/drawCircleCaps"
import { createDrawTube } from "./draw/drawTube";
import { createTrackball } from "./controls/trackball";
import { createUiControls } from "./controls/uiControls";
import { buildVectorLines } from "./utils/geometry";
import { extractMat3FromMat4, transformVec3WithMat3 } from "./utils/math3d";
import { LIGTH, VIS } from "./config";
import { setupProtein } from "./scene/setupProtein";
import { createDrawToScreen } from "./draw/drawToScreen";

const { regl, canvas, DPR, sceneFbo } = initRegl();
const trackball = createTrackball(canvas);   // Interactive rotation controller
const ui = createUiControls();           // UI toggles (spheres, vectors, etc.)

const cameraPosition = [0, 0, 2];
const target = [0, 0, 0];
const up = [0, 1, 0];
const view = mat4.lookAt([], cameraPosition, target, up);
const projection = mat4.perspective([],
  Math.PI / 4,    // fov
  canvas.width / canvas.height, // aspect
  0.01,           // near
  1000            // far
);

// transform lights once in view-space
const viewRotMat3 = extractMat3FromMat4(view);
const viewLightDirections = LIGTH.DIRECTIONS.map((dir) => transformVec3WithMat3(dir, viewRotMat3));

// Scene setup
(async() => {
  const geo = await setupProtein();

  // Generate 3D vector lines (tangent, normal, binormal)
  const tangeantLines = buildVectorLines(geo.spline, geo.vectors.t, VIS.VECTORS_SCALE);
  const refLines = buildVectorLines(geo.spline, geo.vectors.r, VIS.VECTORS_SCALE);
  const binormalLines = buildVectorLines(geo.spline, geo.vectors.c, VIS.VECTORS_SCALE);

  // Draw commands
  const drawSpline = await createDrawSpheres(regl, geo.sphere, geo.spline);
  const drawCA = await createDrawSpheres(regl, geo.sphere, geo.caPoints);
  const drawTangent = createDrawVectors(regl, tangeantLines);
  const drawReference = createDrawVectors(regl, refLines);
  const drawBinormal = createDrawVectors(regl, binormalLines);
  const drawCaps = createDrawCircleCaps(regl, geo.tubeCaps);
  const drawTube = createDrawTube(regl, geo.tubePositions, geo.tubeNormals, LIGTH.MAX);
  const drawToScreen = createDrawToScreen(regl);

  function renderScene({ projection, view, model }) {
    const common = { projection, model, view };

    // Conditional rendering based on UI state
    if (ui.showSplines) drawSpline(common);
    if (ui.showAminoAcids) drawCA(common);
    if (ui.showVectors) {
      drawTangent({ ...common, color: [1, 0, 0] });
      drawReference({ ...common, color: [0, 1, 0] });
      drawBinormal({ ...common, color: [0, 0, 1] });
    } 
    if (ui.showTubeCaps) drawCaps({ ...common, color: [0.8, 0.1, 0.5], alpha: 0.8 });
    if (ui.showTube) drawTube({ 
      ...common, 
      lightDirections: viewLightDirections, 
      lightColors: LIGTH.COLORS, 
      numLights: LIGTH.DIRECTIONS.length 
    });
  }

  // Render loop
  regl.frame(() => {
    // Build shared model matrix with interactive rotation
    const model = mat4.create();
    mat4.rotateX(model, model, trackball.x);
    mat4.rotateY(model, model, trackball.y);
    
    // First pass, render the scene into the offscreen BFO
    regl({framebuffer: sceneFbo})(() => {
      regl.clear({ color: [0,0,0.2, 1], depth: 1});
      renderScene({projection, view, model });
    });

    // Render the buffer to the screen
    drawToScreen({ src: sceneFbo });
    
  });
})();