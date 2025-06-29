export function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  return len > 0 ? v.map(x => x / len) : [0, 0, 0];
}

export function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function scale(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

export function orthogonalize(r0, t0) {
    const dotProd = dot(r0, t0);
    const projection = scale(t0, dotProd);
    const orthogonal = subtract(r0, projection);
    return normalize(orthogonal);
}

export function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]]
}

export function extractMat3FromMat4(m4) {
  return [
    m4[0], m4[1], m4[2],
    m4[4], m4[5], m4[6],
    m4[8], m4[9], m4[10]
  ];
}

export function transformVec3WithMat3(v, m3) {
  return [
    m3[0] * v[0] + m3[3] * v[1] + m3[6] * v[2],
    m3[1] * v[0] + m3[4] * v[1] + m3[7] * v[2],
    m3[2] * v[0] + m3[5] * v[1] + m3[8] * v[2],
  ];
}