precision mediump float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 projection, view, model;
uniform vec3 cameraPos;  // pass it always

varying vec3 vN_WS;      // world-space normal
varying vec3 vV_WS;      // world-space view dir (surface -> camera)
varying float vNoV_WS;   // N·V in world space

varying vec3 vN_VS;      // view-space normal
varying vec3 vV_VS;      // view-space view dir (surface -> camera)

void main() {
  // World space
  vec4 worldPos = model * vec4(position, 1.0);
  vec3 Nw = normalize(mat3(model) * normal);
  vec3 Vw = normalize(cameraPos - worldPos.xyz);

  vN_WS  = Nw;
  vV_WS  = Vw;
  vNoV_WS = max(dot(Nw, Vw), 0.0);

  // View space
  vec3 viewPos = (view * worldPos).xyz;
  vec3 Nv = normalize(mat3(view * model) * normal);
  vec3 Vv = normalize(-viewPos);

  vN_VS = Nv;
  vV_VS = Vv;

  gl_Position = projection * vec4(viewPos, 1.0);
}