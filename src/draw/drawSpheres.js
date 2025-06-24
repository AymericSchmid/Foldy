import glsl from 'glslify';
import { loadOBJ } from '../loaders/loadOBJ';
import vert from '../shaders/sphere.vert?raw'
import frag from '../shaders/sphere.frag?raw'

// Creates a REGL draw command for rendering instanced spheres (e.g. atoms).
export async function createDrawSpheres(regl, sphere, spherePositions, { scale = 0.05 } = {}) {
    return regl({
        // Vertex and fragment shaders
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,

        // Per-vertex attributes
        attributes: {
            position: sphere.positions,
            normal: sphere.normals,

            // Per-instance attribute: sphere center position
            instancePosition: {
                buffer: regl.buffer(spherePositions),
                divisor: 1 // tells REGL to update this per instance (not per vertex)
            }
        },

        // Uniforms passed in during draw call
        uniforms: {
            projection: regl.prop('projection'),
            model: regl.prop('model'),
            scale: scale
        },

        // Geometry indices for drawing triangles
        elements: sphere.cells,

        // Number of instances to draw
        instances: spherePositions.length / 3,
    });
}