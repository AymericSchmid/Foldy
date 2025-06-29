precision mediump float;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 projection, model, view;

varying vec3 vNormal;
varying vec3 vViewDirection;


void main() {
    vec3 viewPos = (view * model * vec4(position, 1.0)).xyz;
    vec3 viewNormal = mat3(view * model) * normal;

    vNormal = normalize(viewNormal);
    vViewDirection = normalize(-viewPos);

    gl_Position = projection * vec4(viewPos, 1.0);
}