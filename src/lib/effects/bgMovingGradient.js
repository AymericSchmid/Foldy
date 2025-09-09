import glsl from 'glslify';
import vert from '../shaders/post/blit.vert';
import frag from '../shaders/gradient.frag';

export function createDrawBgMovingGradient(regl) {
    return regl({
        attributes: { position: [ -4,-4,  4,-4,  0, 4 ] },
        count: 3,
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,
        uniforms: {
            resolution: regl.prop('resolution'),
            time: regl.prop('time'),
            speed: regl.prop('speed'),
            noiseStrength: regl.prop('noiseStrength'),
            baseFirst: regl.prop('baseFirst'),
            accent: regl.prop('accent'),
            baseSecond: regl.prop('baseSecond')
        },
        depth: { enable: false }
    });
}