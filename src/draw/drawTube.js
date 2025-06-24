import glsl from 'glslify';
import vert from '../shaders/tube.vert?raw';
import frag from '../shaders/tube.frag?raw';

// Creates a REGL draw command for rendering a tube defined with triangles
export function createDrawTube(regl, positions, normals) {
    return regl({
        // Vertex and fragment shaders
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,

        // Geometry data: triangle vertices
        attributes: {
            position: positions,
            normal: normals,
        },

        // Uniforms passed from the draw call
        uniforms: {
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
        depth: {
            enable: true
        }
    });
}