import glsl from 'glslify';
import vert from '../shaders/tubeChrome.vert?raw';
import frag from '../shaders/tubeChrome.frag?raw';

// Creates a REGL draw command for rendering a tube defined with triangles
export function createDrawTubeChrome(regl, positions, normals) {
    return regl({
        // Vertex and fragment shaders
        vert: glsl`${vert}`,
        frag: glsl`${frag}`,

        // Geometry data: triangle vertices
        attributes: {
            position: positions,
            normal: normals,
        },

        uniforms: {
            projection: regl.prop('projection'),
            model: regl.prop('model'),
            view: regl.prop('view'),
            cameraPos: regl.prop('cameraPos'),
            envMap: regl.prop('envMap'),
            intensity: regl.prop('intensity'),
            chromeSparkle: regl.prop('chromeSparkle')
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