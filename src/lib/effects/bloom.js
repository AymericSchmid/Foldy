import glsl from 'glslify';
import vert from '../shaders/post/blit.vert'
import fragBloom from '../shaders/post/bloom.frag'
import fragBright from '../shaders/post/bright.frag'
import fragBlur from '../shaders/post/gaussianBlur.frag'

export function createDrawBrightRegions(regl) {
    return regl({
        attributes: { position: [ -4,-4,  4,-4,  0, 4 ] },
        count: 3,
        vert: glsl`${vert}`,
        frag: glsl`${fragBright}`,
        uniforms: { 
            src: regl.prop('src'),
            threshold: regl.prop('threshold')
        },
        depth: { enable: false }
    });
}

export function createDrawGaussianBlur(regl) {
    return regl({
        attributes: { position: [ -4,-4,  4,-4,  0, 4 ] },
        count: 3,
        vert: glsl`${vert}`,
        frag: glsl`${fragBlur}`,
        uniforms: { 
            src: regl.prop('src'),
            resolution: regl.prop('resolution'),
            horizontal: regl.prop('horizontal')
        },
        depth: { enable: false }
    });
}

export function createDrawBloom(regl) {
    return regl({
        attributes: { position: [ -4,-4,  4,-4,  0, 4 ] },
        count: 3,
        vert: glsl`${vert}`,
        frag: glsl`${fragBloom}`,
        uniforms: { 
            src: regl.prop('src'),
            bloom: regl.prop('bloom'),
            intensity: regl.prop('intensity')
        },
        depth: { enable: false }
    });
}