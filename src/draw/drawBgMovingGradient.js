import glsl from 'glslify';
import vert from '../shaders/post/blit.vert?raw'
import frag from '../shaders/gradient.frag?raw'

export function createDrawBgMovingGradient(regl) {
    return regl({
        attributes: { position: [ -4,-4,  4,-4,  0, 4 ] },
        count: 3,
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,
        uniforms: {
            resolution: regl.prop('resolution'),
            time: regl.prop('time')
        },
        depth: { enable: false }
    });
}