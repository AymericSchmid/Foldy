precision mediump float;

attribute vec3 position;

uniform mat4 projection, model, view;

void main() {
    vec3 viewPos = (view * model * vec4(position, 1.0)).xyz;
    gl_Position = projection * vec4(viewPos, 1.0);
}