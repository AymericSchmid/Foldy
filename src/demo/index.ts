import { createTrackball } from "./controls/trackball";
import { createProteinViewer, Params } from "../lib";
const container = document.getElementById('viewer')!;
const styleSelect = document.getElementById('styleSelect') as HTMLSelectElement | null;
const toggleFXAA  = document.getElementById('toggleFXAA') as HTMLInputElement | null;
const toggleBloom = document.getElementById('toggleBloom') as HTMLInputElement | null;

const initialParams = {'bloom': {'threshold': 0.4, 'intensity': 100} };
const viewer = createProteinViewer(container, { style:'phong', bloom:false, fxaa:false, background: 'movingGradient', params: initialParams });
viewer.setCamera([0,0,0],[0,0,0])
viewer.setPosition([0.4,0,-1]);

viewer.loadPDB('/AF-A0JP26-F1-model_v4.pdb');
const skybox = '/skybox/blue/'
viewer.setEnvMap({ px:skybox+'px.jpg', nx:skybox+'nx.jpg', py:skybox+'py.jpg', ny:skybox+'ny.jpg', pz:skybox+'pz.jpg', nz:skybox+'nz.jpg' });

if (styleSelect) {
    styleSelect.onchange = e => viewer.setStyle((e.target as HTMLSelectElement).value as any);
    viewer.setStyle(styleSelect.value as any);
}
if (toggleBloom) {
    toggleBloom.onchange = e => viewer.setBloom((e.target as HTMLInputElement).checked);
    viewer.setBloom(toggleBloom.checked)
}
if (toggleFXAA) {
    toggleFXAA.onchange  = e => viewer.setFxaa((e.target as HTMLInputElement).checked);
    viewer.setFxaa(toggleFXAA.checked)
}

window.addEventListener('resize', () =>
  viewer.resize(window.innerWidth, window.innerHeight)
);

createTrackball(viewer.canvas, (x,y) => viewer.setRotation(x,y));