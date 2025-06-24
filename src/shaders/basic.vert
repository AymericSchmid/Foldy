precision mediump float;
attribute vec3 position;

uniform mat4 projection, model;

void main() {
    gl_Position = projection * model * vec4(position, 1.0);
}