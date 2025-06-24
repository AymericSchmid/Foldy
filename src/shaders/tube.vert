precision mediump float;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 projection, model;

varying vec3 vNormal;

void main() {
    vNormal = normal;
    gl_Position = projection * model * vec4(position, 1.0);
}