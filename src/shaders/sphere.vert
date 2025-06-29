precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 instancePosition;

uniform mat4 projection, model, view;
uniform float scale;

varying vec3 vNormal;

void main() {
    vNormal = normal;
    vec3 pos = position * scale + instancePosition;
    vec3 viewPos = (view * model * vec4(pos, 1.0)).xyz;
    gl_Position = projection * vec4(viewPos, 1.0);
}