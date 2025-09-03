precision mediump float;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 projection, model, view;
uniform vec3 cameraPos;

varying vec3 vReflect;
varying float vNoV;

void main() {
    vec4 worldPos = model * vec4(position, 1.0);
    vec3 N = normalize(mat3(model) * normal);
    vec3 V = normalize(worldPos.xyz - cameraPos);
    vReflect = reflect(V, N); // reflection direction in world space
    vNoV = max(dot(N, V), 0.0);
    gl_Position = projection * view * worldPos;
}