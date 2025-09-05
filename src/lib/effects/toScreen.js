import glsl from 'glslify';
import vert from '../shaders/post/blit.vert?raw'
import frag from '../shaders/post/blit.frag?raw'

// Creates a REGL draw command to render a texture on the screen
export function createDrawToScreen(regl) {
    return regl({
        attributes: { position: [ -4,-4,  4,-4,  0, 4 ] },
        count: 3,
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,
        uniforms: { src: regl.prop('src') },
        depth: { enable: false }
    });
}