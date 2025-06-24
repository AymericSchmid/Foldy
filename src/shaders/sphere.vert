precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 instancePosition;

uniform mat4 projection;
uniform mat4 model;
uniform float scale;

varying vec3 vNormal;

void main() {
    vec3 pos = position * scale + instancePosition;
    gl_Position = projection * model * vec4(pos, 1.0);
    vNormal = normal;
}