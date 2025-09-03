precision mediump float;
varying vec3 vReflect;
varying float vNoV;

uniform samplerCube envMap;
uniform float intensity;
uniform float chromeSparkle;

void main() {
    vec3 R = normalize(vReflect);
    vec3 env = textureCube(envMap, R).rgb;

    float glint = pow(max(dot(R, normalize(vec3(0.0,1.0,0.3))),0.0), 64.0);
    env += glint * chromeSparkle;

    gl_FragColor = vec4(env * intensity, 1.0);
}