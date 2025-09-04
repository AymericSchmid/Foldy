import { initRegl } from "./regl-init";
import mat4 from 'gl-mat4';
import { createDrawSpheres } from "./draw/drawSpheres";
import { createDrawVectors } from "./draw/drawVectors";
import { createDrawCircleCaps } from "./draw/drawCircleCaps"
import { createDrawTubePhong } from "./draw/drawTubePhong";
import { createDrawTubeChrome } from "./draw/drawTubeChrome.js";
import { createTrackball } from "./controls/trackball";
import { createUiControls } from "./controls/uiControls";
import { buildVectorLines } from "./utils/geometry";
import { extractMat3FromMat4, transformVec3WithMat3 } from "./utils/math3d";
import { PHONG, CHROME, HALFTONE, VIS, POST_PROC, } from "./config";
import { setupProtein } from "./scene/setupProtein";
import { createDrawToScreen } from "./draw/drawToScreen";
import { createDrawFxaa } from "./draw/drawFxaa";
import { createDrawBrightRegions } from "./draw/drawBrightRegions";
import { createDrawGaussianBlur } from "./draw/drawGaussianBlur";
import { createDrawBloom } from "./draw/drawBloom";
import { createDrawHalftone } from "./draw/drawHalftone.js";
import { createDrawBgMovingGradient } from "./draw/drawBgMovingGradient.js";
import { loadCubeMap } from "./loaders/loadCubeMap";

const { regl, canvas, DPR, fboScene, ping, pong } = initRegl();
const trackball = createTrackball(canvas);   // Interactive rotation controller
const ui = createUiControls();           // UI toggles (spheres, vectors, etc.)

const cameraPosition = [0, 0, 1.7];
const target = [0, 0, 0.0];
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
const viewLightDirections = PHONG.DIRECTIONS.map((dir) => transformVec3WithMat3(dir, viewRotMat3));

// Scene setup
(async() => {
  const geo = await setupProtein();
  const chromeEnvMap = await loadCubeMap({
    px: 'public/skybox/blue/px.jpg',
    nx: 'public/skybox/blue/nx.jpg',
    py: 'public/skybox/blue/py.jpg',
    ny: 'public/skybox/blue/ny.jpg',
    pz: 'public/skybox/blue/pz.jpg',
    nz: 'public/skybox/blue/nz.jpg',
  }, regl);

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
  const drawTubePhong = createDrawTubePhong(regl, geo.tubePositions, geo.tubeNormals, PHONG.MAX);
  const drawTubeChrome = createDrawTubeChrome(regl, geo.tubePositions, geo.tubeNormals);
  const drawToScreen = createDrawToScreen(regl);
  const drawFxaa = createDrawFxaa(regl);
  const drawBrightRegions = createDrawBrightRegions(regl);
  const drawGaussianBlur = createDrawGaussianBlur(regl);
  const drawBloom = createDrawBloom(regl);
  const drawHalftone = createDrawHalftone(regl);
  const drawBgMovingGradient = createDrawBgMovingGradient(regl);

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
    if (ui.showTube) {
      switch (ui.style) {
        case 'halftone':    // Share the same pipeline as phong
        case 'phong':
          drawTubePhong({ 
            ...common, 
            lightDirections: viewLightDirections, 
            lightColors: PHONG.COLORS, 
            numLights: PHONG.DIRECTIONS.length 
          });
          break;
        case 'chrome':
          drawTubeChrome({...common, 
            cameraPos: cameraPosition, 
            envMap: chromeEnvMap,
            intensity: CHROME.INTENSITY,
            chromeSparkle: CHROME.SPARKLE
          });
          break;
      }
    }
  }

  // Render loop
  regl.frame(() => {
    // Build shared model matrix with interactive rotation
    const model = mat4.create();
    mat4.rotateX(model, model, trackball.x);
    mat4.rotateY(model, model, trackball.y);

    // Scene pass
    fboScene.use(() => {
      regl.clear({ color: [0.7,0.7,0.7, 1.0], depth: 1});
      if (ui.style == 'phong') drawBgMovingGradient({ resolution: [ping.width, ping.height], time: regl.now() });
      renderScene({projection, view, model });
    });

    let compositeFbo = fboScene; // default fallback if bloom is off

    // Halftone style is done in post-processing
    if (ui.style == 'halftone'){
      // Halftone: scene -> ping
      pong.use(() => {
        drawHalftone({ src: fboScene, 
          resolution: [ping.width, ping.height], 
          angle: HALFTONE.ANGLE,
          cell: HALFTONE.CELL,
          thickness: HALFTONE.THICKNESS,
          colorOn: HALFTONE.COLOR_ON,
          colorOff: HALFTONE.COLOR_OFF
        })
      });

      compositeFbo = pong;
    }

    if(ui.bloomEnabled) {
      // Bright regions: scene -> ping
      ping.use(() => {
        drawBrightRegions({ src: fboScene, threshold: POST_PROC.BLOOM_THRESHOLD });
      });

      // Gaussian blur: ping-pong N passes
      let src = ping;
      let dst = pong;
      let horizontal = true;
      const passes = 10;

      for(var i = 0; i < passes; i++){
        dst.use(() => {
          drawGaussianBlur({
            src,
            horizontal,
            resolution: [dst.width, dst.height],
          });
        });
        // swap
        const tmp = src; src = dst; dst = tmp;
        horizontal = !horizontal;
      }

      // After the loop, the blurred image is in `src`
      const blurred = src;

      // Composite: original + blurred -> pong
      pong.use(() => {
        drawBloom({
          src:   fboScene, // original scene
          bloom: blurred,  // blurred brights
          intensity: POST_PROC.BLOOM_INTENSITY
        });
      });

      compositeFbo = pong; // The composed result
    }

    if (ui.fxaaEnabled){
      // FXAA: composite -> ping
      ping.use(() => {
        drawFxaa({
          src: compositeFbo,
          resolution: [ping.width, ping.height],
        });
      });
      compositeFbo = ping;
    }
    
    // Present to screen
    drawToScreen({ src: compositeFbo });
  });
})();