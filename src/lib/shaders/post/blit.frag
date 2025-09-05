precision mediump float;

varying vec2 vUV;

uniform sampler2D src;

void main() {
    gl_FragColor = texture2D(src, vUV);
}