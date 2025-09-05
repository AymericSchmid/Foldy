import { createDrawTubeChrome } from "./chrome";
import { createDrawTubePhong } from "./phong";

export function createStyleRegistry(regl: any, geo: any) {
    const phong = { name: 'phong',  draw: createDrawTubePhong(regl, geo.tubePositions, geo.tubeNormals, 8) };
    const chrome= { name: 'chrome', draw: createDrawTubeChrome(regl, geo.tubePositions, geo.tubeNormals) };
    const halftone = { name: 'halftone', draw: phong.draw }; // renders like phong; post overrides

    const map = new Map([['phong', phong], ['chrome', chrome], ['halftone', halftone]]);
    return { get: (k:string) => map.get(k) || phong };
}