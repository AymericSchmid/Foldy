precision mediump float;

varying vec3 vN_WS;      // world-space normal
varying vec3 vV_WS;      // world-space view dir (surface -> camera)

uniform samplerCube envMap;
uniform float intensity;
uniform float chromeSparkle;

void main() {
    vec3 reflect = reflect(vV_WS, vN_WS);
    vec3 R = normalize(reflect);
    vec3 env = textureCube(envMap, R).rgb;

    float glint = pow(max(dot(R, normalize(vec3(0.0,1.0,0.3))),0.0), 64.0);
    env += glint * chromeSparkle;

    gl_FragColor = vec4(env * intensity, 1.0);
}