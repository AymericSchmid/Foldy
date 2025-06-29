import glsl from 'glslify';
import vert from '../shaders/tube.vert?raw';
import frag from '../shaders/tube.frag?raw';

function makeLightUniforms(regl, maxLights) {
  const uniforms = {
    // common uniforms
    projection : regl.prop('projection'),
    view       : regl.prop('view'),
    model      : regl.prop('model'),
    numLights  : regl.prop('numLights')
  };

  // one vec3 + one color per light
  for (let i = 0; i < maxLights; ++i) {
    uniforms[`lightDirections[${i}]`] = (_, props) => props.lightDirections[i];
    uniforms[`lightColors[${i}]`]     = (_, props) => props.lightColors[i];
  }
  return uniforms;
}

// Creates a REGL draw command for rendering a tube defined with triangles
export function createDrawTube(regl, positions, normals, maxLights) {
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
        uniforms: makeLightUniforms(regl, maxLights),

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