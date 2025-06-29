import glsl from 'glslify';
import vert from '../shaders/basic.vert?raw'
import frag from '../shaders/vector.frag?raw'

// Creates a REGL draw command for rendering a line defined by two points
export function createDrawVectors(regl, lines){
    return regl({
        // Vertex and fragment shaders
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,

        // Geometry data: vector vertices
        attributes: {
            position: lines,
        },

        // Uniforms passed from the draw call
        uniforms: {
            color: regl.prop('color'),
            projection: regl.prop('projection'),
            model: regl.prop('model'),
            view: regl.prop('view')
        },

        // Number of vertices (each 3D vertex has 3 components)
        count: lines.length / 3,
        primitive: 'lines',
    });
}