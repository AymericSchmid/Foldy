precision mediump float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 projection;
uniform mat4 model;

varying vec3 vNormal;

void main(){
    vec3 pos = position;

    vNormal = normalize(normal);
    gl_Position = projection * model * vec4(pos, 1.0);
}