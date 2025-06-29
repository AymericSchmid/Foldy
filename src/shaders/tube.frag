precision mediump float;

#define MAX_LIGHTS 2

varying vec3 vNormal;           // Surface normal in view space
varying vec3 vViewDirection;    // View direction in view space

// Light data
uniform int numLights;
uniform vec3 lightDirections[MAX_LIGHTS]; // In view space
uniform vec3 lightColors[MAX_LIGHTS];

// Material properties
const vec3 baseColor = vec3(1.0, 1.0, 1.0);
const vec3 ambientColor = vec3(0.2);
const float shininess = 128.0;

// --- Computes contribution of one light ---
vec3 computeLight(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir) {
    // Diffuse lighting 
    float diffuseStrength = max(0.0, dot(lightDir, normal));
    vec3 diffuse = diffuseStrength * lightColor;

    // Specular lighting
    vec3 reflectDir = reflect(-lightDir, normal);
    float specularStrength = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * lightColor;

    return diffuse + specular;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDirection);
    
    vec3 lighting = ambientColor;

    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (i >= numLights) break;
        vec3 lightDir = normalize(lightDirections[i]);
        vec3 lightColor = lightColors[i];
        lighting += computeLight(lightDir, lightColor, normal, viewDir); 
    }

    vec3 color = lighting * baseColor;
    gl_FragColor = vec4(color, 1.0);
}