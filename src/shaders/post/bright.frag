precision mediump float;

varying vec2 vUV;

uniform sampler2D src;
uniform float threshold;

void main() {
    vec3 color = texture2D(src, vUV).rgb;
    float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > threshold)
        gl_FragColor = vec4(color.rgb, 1.0);
    else
        gl_FragColor = vec4(0);
}