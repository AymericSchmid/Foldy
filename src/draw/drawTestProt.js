import glsl from 'glslify';
import { loadOBJ } from '../loaders/loadOBJ';
import vert from '../shaders/testprot.vert?raw'
import frag from '../shaders/testprot.frag?raw'

// Creates a REGL draw command for rendering a protein from an obj file 
export async function createDrawTestProt(regl) {
    const model = await loadOBJ('/public/models/p53.obj');

    return regl({
        // Vertex and fragment shaders
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,

        // Geometry data: triangle vertices
        attributes: {
            position: model.positions,
            normal: model.normals,
        },

        // Uniforms passed from the draw call
        uniforms: {
            projection: regl.prop('projection'),
            model: regl.prop('model')
        },

        // Geometry indices for drawing triangles
        elements: model.elements,
    });
}