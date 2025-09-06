import glsl from 'glslify';
import vert from '../shaders/post/blit.vert'
import frag from '../shaders/post/halftone.frag'

// Creates a REGL draw command to render a texture on the screen
export function createDrawHalftone(regl) {
    return regl({
        attributes: { position: [ -4,-4,  4,-4,  0, 4 ] },
        count: 3,
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,
        uniforms: { 
            src: regl.prop('src'),
            resolution: regl.prop('resolution'),
            angle: regl.prop('angle'),
            cell: regl.prop('cell'),
            thickness: regl.prop('thickness'),
            colorOn: regl.prop('colorOn'),
            colorOff: regl.prop('colorOff'),
        },
        depth: { enable: false }
    });
}