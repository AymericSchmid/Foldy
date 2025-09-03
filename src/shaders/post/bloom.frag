precision mediump float;

varying vec2 vUV;

uniform sampler2D src;
uniform sampler2D bloom;
uniform float intensity;

// quick approximate gamma helpers
vec3 toLinear(vec3 c)  { return pow(c, vec3(2.2)); }
vec3 toSRGB (vec3 c)   { return pow(c, vec3(1.0/2.2)); }

void main() {
    vec3 base = toLinear(texture2D(src, vUV).rgb);
    vec3 glow = toLinear(texture2D(bloom, vUV).rgb) * intensity;

    vec3 result = base + glow; 

    gl_FragColor = vec4(toSRGB(result), 1.0);
}