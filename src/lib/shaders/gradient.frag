precision mediump float;

varying vec2 vUV;

uniform float time;
uniform float speed;
uniform float noiseStrength;
uniform vec3 baseFirst;
uniform vec3 accent;
uniform vec3 baseSecond;

float lines(vec2 uv, float offset){
    return smoothstep(
        0., 0.5 + offset*0.5,
        abs(0.5*(sin(uv.x*10.) + offset*2.))
    );
}

mat2 rotate2D(float angle){
    return mat2(
        cos(angle),-sin(angle),
        sin(angle),cos(angle)
    );
}

vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {
    float t = time * speed;
    vec2 p = vUV;
    vec2 warp = vec2(
        noise(vec3(p*2.0,          t*0.15)),
        noise(vec3(p*2.0 + 17.2,   t*0.15))
    ) * 2.0 - 1.0;
    float angle = noiseStrength * 0.35 * (noise(vec3(p*1.9 + 1.1*warp, t*0.1)) * 2.0 - 1.0);

    vec2 uv = vUV*rotate2D(angle + 0.5);

    float basePattern = lines(uv, 0.2);
    float secondPattern = lines(uv, 0.1);

    vec3 baseColor = mix(baseSecond, baseFirst, basePattern);
    vec3 secondBaseColor = mix(baseColor, accent, secondPattern);

    gl_FragColor = vec4(vec3(secondBaseColor), 1.);
}