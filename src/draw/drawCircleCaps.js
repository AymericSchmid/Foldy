import glsl from 'glslify';
import vert from '../shaders/basic.vert?raw'
import frag from '../shaders/basic.frag?raw'

// Creates a REGL draw command to render filled circle caps as translucent triangles.
export function createDrawCircleCaps(regl, positions){
    return regl({
        // Vertex and fragment shaders
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,

        // Geometry data: triangle vertices
        attributes: {
            position: positions,
        },

        // Uniforms passed from the draw call
        uniforms: {
            color: regl.prop('color'),
            alpha: regl.prop('alpha'),
            projection: regl.prop('projection'),
            model: regl.prop('model'),
        },

        // Number of vertices (each 3D vertex has 3 components)
        count: positions.length / 3,
        primitive: 'triangles',

        // Enable alpha blending for transparency
        blend: {
            enable: true,
            func: {
                src: 'src alpha',
                dst: 'one minus src alpha'
            }
        },
    });
}