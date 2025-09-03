precision mediump float;

varying vec2 vUV;

uniform sampler2D src;
uniform vec2 resolution;
uniform float angle;
uniform float cell;
uniform float thickness;
uniform vec3 colorOn;
uniform vec3 colorOff;

vec3 toLinear(vec3 c){ return pow(c, vec3(2.2)); }

void main() {

    vec3 srcSRGB = texture2D(src, vUV).rgb;
    vec3 srcLin  = toLinear(srcSRGB);

    // Brightness
    float v = dot(srcLin, vec3(0.2126, 0.7152, 0.0722));

    // Rotate screen-space UV by angle
    vec2 pixel = (vUV * resolution);
    float s = sin(angle), c = cos(angle);
    vec2 pr = mat2(c, -s, s, c) * (pixel - 0.5 * resolution);

    // Distance to nearest line center along the axis perpendicular to the line
    // Lines repeat every "cell" pixels along pr.y
    float d = abs(mod(pr.y + 0.5*cell, cell) - 0.5*cell);

    float th = thickness * (v - 0.05);

    // Smooth step
    float mask = 1.0 - smoothstep(th - 1.0, th + 1.0, d);

    // Colors
    vec3 halftone = mix(colorOff, colorOn, mask);

    gl_FragColor = vec4(halftone, 1.0);
}