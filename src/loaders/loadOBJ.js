import { OBJ } from "webgl-obj-loader";
import normals from 'angle-normals';
import { normalizeModel } from "../utils/geometry";

// Load and parse an OBJ file, optionally normalize its geometry
export async function loadOBJ(url, { normalize = true } = {}) {
    // Load OBJ file as text
    const res = await fetch(url);
    const text = await res.text();

    // Parse OBJ file into mesh data
    const mesh = new OBJ.Mesh(text);

    // If normals are missing or contain NaNs, compute them using angle-weighted method
    if (!mesh.vertexNormals || mesh.vertexNormals.some(isNaN)) {
        const positionsFlat = mesh.vertices;

        // Convert flat array to array of vec3
        const positions = Array.from({ length: positionsFlat.length / 3}, (_, i) => 
            positionsFlat.slice(i * 3, i * 3 + 3)
        );

        const indicesFlat = mesh.indices;
        const indices = Array.from({ length: indicesFlat.length / 3 }, (_, i) =>
            indicesFlat.slice(i * 3, i * 3 + 3)
        );

        // Compute angle-weighted normals
        mesh.vertexNormals = normals(indices, positions);
    }

    // Construct the mesh object
    const model = {
        positions: mesh.vertices,
        normals: mesh.vertexNormals,
        elements: mesh.indices,
    }

    // Optionally normalize the model (centered and scaled to unit size)
    if (normalize) {
        // normalize so the whole model has a size of one
        model.positions = normalizeModel(model.positions);
    }

    return model;
}