
import mat4 from 'gl-mat4';
import { initRegl } from './core/reglInit';
import { extractMat3FromMat4, transformVec3WithMat3 } from './core/math3d';
import type { Options, Viewer, EnvMap, Params, DeepPartial, Vec3, RGB } from './index';
import { setupProtein } from './loaders/setupProtein';
import { loadCubeMap } from './loaders/loadCubeMap';
import { createDrawToScreen } from './effects/toScreen';
import { createDrawFxaa } from './effects/fxaa';
import { createDrawBloom, createDrawBrightRegions, createDrawGaussianBlur } from './effects/bloom';
import { createDrawHalftone } from './effects/halftone';
import { createDrawBgMovingGradient } from './effects/bgMovingGradient';
import { createStyleRegistry } from './styles';

export function createProteinViewer(container: HTMLElement, opts: Options = {}): Viewer {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const { regl, DPR, fboScene, ping, pong, resize } = initRegl(canvas, opts.dpr);

    // state
    let style: Options['style'] = opts.style ?? 'phong';
    let bloom = opts.bloom ?? true;
    let fxaa  = opts.fxaa ?? true;
    let background: Options['background'] = opts.background ?? 'none';
    let envTex: any = null;
    let rotationX: number = 0;
    let rotationY: number = 0;

    let params: Params = {
        bloom: { threshold: 0.1, intensity: 15, passes: 8, },
        halftone: { angle: Math.PI / 4, cell: 12, thickness: 3.5, colorOn: [0, 0, 0], colorOff: [1, 1, 1], },
        chrome: { intensity: 1.2, sparkle: 10.0, },
        light: { 
            colors: [[46.0/255.0, 29.0/255.0, 113.0/255.0],[150.0/255.0, 84.0/255.0, 36.0/255.0]],
            directions: [[0.3,0.6,0.2],[-0.5,-0.3,0]]
        }
    };
    // Apply initial overrides
    if (opts.params) deepMerge(params, opts.params);

    const listeners = new Map<string, Set<Function>>();
    const emit = (e:string, ...a:any[]) => listeners.get(e)?.forEach(fn => fn(...a));

    // camera
    const eye = opts.camera?.eye ?? [0,0,1.0] as Vec3;
    const target = opts.camera?.target ?? [0,0,0] as Vec3;
    const up: Vec3 = [0,1,0];
    const view = mat4.lookAt([], eye, target, up);
    const projection = mat4.perspective([], Math.PI/4, canvas.width/canvas.height, 0.01, 1000);

    // style registry will be built once geometry is known
    let styles: ReturnType<typeof createStyleRegistry> | null = null;

    // post commands
    const drawToScreen        = createDrawToScreen(regl);
    const drawFxaa            = createDrawFxaa(regl);
    const drawBrightRegions   = createDrawBrightRegions(regl);
    const drawGaussianBlur    = createDrawGaussianBlur(regl);
    const drawBloom           = createDrawBloom(regl);
    const drawHalftone        = createDrawHalftone(regl);
    const drawBgMovingGradient= createDrawBgMovingGradient(regl);
    
    // geometry (loaded later)
    let geo: any = null;

    async function setEnvMap(env: EnvMap){
        try {
            envTex = await loadCubeMap(env, regl);
        } catch (err) {
            console.error("Failed to load cube map", err);
            emit("error", err);
        }
    }

    async function loadPDB(url: string){
        try {
            geo = await setupProtein(url);
            styles = createStyleRegistry(regl, geo);
            emit('loaded', geo);
        } catch (e) {
            emit('error', e);
        }
    }

    if (opts.envMap) setEnvMap(opts.envMap);

    // draw scene (no UI here)
    function renderScene(model: number[]) {
        if (!styles) return;

        const common = { projection, view, model, cameraPos: eye };

        if (background === 'movingGradient') {
            drawBgMovingGradient({ resolution: [ping.width, ping.height], time: regl.now() });
        }

        // pick style and set its uniforms
        const mat = styles.get(style);

        if (mat.name === 'chrome') {
            mat.draw({ ...common, envMap: envTex, intensity: params.chrome.intensity, chromeSparkle: params.chrome.sparkle });
        }
        else if (mat.name === 'phong') {
            const viewRot = extractMat3FromMat4(view);
            const viewLightDirs = params.light.directions.map(d => transformVec3WithMat3(d, viewRot));
            mat.draw({ ...common, lightDirections: viewLightDirs, lightColors: params.light.colors, numLights: params.light.directions.length });
        }
        else if (mat.name === 'halftone') {
            // material pass can still be phong, but post will override (handled below)
            const ph = styles.get('phong');
            ph.draw({ ...common, lightDirections: [[0,0,1], [0,0,0]], lightColors: [[1,1,1],[0,0,0]], numLights: 1 });
        }
    }

    // frame loop
    let running = true;
    regl.frame(() => {
        if (!running) return;

        const model = mat4.create();
        mat4.rotateX(model, model, rotationX);
        mat4.rotateY(model, model, rotationY);

        // scene
        fboScene.use(() => {
            regl.clear({ color: [0.0,0,0,0.0], depth: 1 });
            renderScene(model);
        });

        // pipeline selected by style
        let composite = fboScene;

        if (style === 'halftone') {
            pong.use(() => drawHalftone({
                src: fboScene,
                resolution: [pong.width, pong.height],
                angle: params.halftone.angle, cell: params.halftone.cell, thickness: params.halftone.thickness,
                colorOn: params.halftone.colorOn, colorOff: params.halftone.colorOff
            }));
            composite = pong;
        }
        
        if (bloom && style !== 'halftone') {
            // bright
            ping.use(() => drawBrightRegions({ src: composite, threshold: params.bloom.threshold }));
            // blur ping-pong
            let src = ping, dst = pong, horiz = true;
            for (let i=0;i<params.bloom.passes;i++){
                dst.use(() => drawGaussianBlur({ src, horizontal: horiz, resolution: [dst.width, dst.height] }));
                [src, dst] = [dst, src];
                horiz = !horiz;
            }
            // compose
            pong.use(() => drawBloom({ src: composite, bloom: src, intensity: params.bloom.intensity }));
            composite = pong;
        }

        if (fxaa) {
            ping.use(() => drawFxaa({ src: composite, resolution: [ping.width, ping.height] }));
            composite = ping;
        }

        drawToScreen({ src: composite });

        emit('frame');
    });

    // API
    function setStyle(s:any){ style = s; }
    function setBloom(b:boolean){ bloom = b; }
    function setFxaa(b:boolean){ fxaa = b; }
    function setBackground(kind:any){ background = kind; }
    function setCamera(eye3:Vec3, target3:Vec3){
        mat4.lookAt(view, eye3, target3, up);
    }
    function setRotation(x:number,y:number){
        rotationX = x;
        rotationY = y;
    }
    function resizeViewer(w:number,h:number,dpr?:number){
        resize(w, h, dpr);  // update canvas + FBOs
        mat4.perspective(projection, Math.PI/4, w/h, 0.01, 1000);
    }
    function on(e:string, cb:Function){ const s = listeners.get(e) ?? new Set(); s.add(cb); listeners.set(e,s); return () => s.delete(cb); }
    function destroy(){ running = false; listeners.clear(); regl.destroy(); canvas.remove(); }
    function setParams(patch: DeepPartial<Params>) {
        deepMerge(params, patch); // write a tiny deepMerge or use a library
    }
    function setParam(group, key, value) {
        (params as any)[group][key] = value;
    }
    function getParam() {
        return params;
    }

    // bootstrap convenience
    if (!opts.camera) setCamera(eye, target);

    return { canvas, setStyle, setBloom, setFxaa, setBackground, setEnvMap, setCamera, setRotation, loadPDB, on, resize: resizeViewer, destroy, setParams, setParam, getParam };
}

function deepMerge<T>(dst: T, src: DeepPartial<T>): T {
    for (const k in src) {
        const sv = (src as any)[k];
        if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
            (dst as any)[k] = deepMerge((dst as any)[k] ?? {}, sv);
        } else if (sv !== undefined) {
            (dst as any)[k] = sv;
        }
    }
    return dst;
}
