precision mediump float;

attribute vec2 position;

varying vec2 vUV;
varying vec2 vPosition;

void main() { 
    vUV = 0.5 * (position + 1.0);
    vPosition = position;
    gl_Position = vec4(position, 0, 1);
}