precision mediump float;

varying vec2 vUV;

uniform sampler2D src;
uniform vec2 resolution;
uniform bool horizontal;

// 5-tap normalized Gaussian weights
#define W0 0.227027
#define W1 0.1945946
#define W2 0.1216216
#define W3 0.054054
#define W4 0.016216


void main() {
    vec2 offset = 1.0 / resolution; // gets size of single texel
    vec2 dir = horizontal ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

    vec3 result = texture2D(src, vUV).rgb * W0;

    result += texture2D(src, vUV + 1.0 * dir * offset).rgb * W1;
    result += texture2D(src, vUV - 1.0 * dir * offset).rgb * W1;

    result += texture2D(src, vUV + 2.0 * dir * offset).rgb * W2;
    result += texture2D(src, vUV - 2.0 * dir * offset).rgb * W2;

    result += texture2D(src, vUV + 3.0 * dir * offset).rgb * W3;
    result += texture2D(src, vUV - 3.0 * dir * offset).rgb * W3;

    result += texture2D(src, vUV + 4.0 * dir * offset).rgb * W4;
    result += texture2D(src, vUV - 4.0 * dir * offset).rgb * W4;

    gl_FragColor = vec4(result, 1.0);
}