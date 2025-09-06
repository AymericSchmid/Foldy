export type Vec3 = [number, number, number];
export type Mat3 = [
    number, number, number,
    number, number, number,
    number, number, number
];
export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
];

export function subtract(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function normalize(v: Vec3): Vec3 {
    const len = Math.hypot(v[0], v[1], v[2]);
    if (len > 0) {
        return [v[0] / len, v[1] / len, v[2] / len];
    }
    return [0, 0, 0];
}

export function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function scale(v: Vec3, s: number): Vec3 {
    return [v[0] * s, v[1] * s, v[2] * s];
}

export function orthogonalize(r0: Vec3, t0: Vec3): Vec3 {
    const dotProd = dot(r0, t0);
    const projection = scale(t0, dotProd);
    const orthogonal = subtract(r0, projection);
    return normalize(orthogonal);
}

export function cross(a: Vec3, b: Vec3): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

// Extract the upper-left 3x3 from a 4x4 matrix (column-major order).
export function extractMat3FromMat4(m4: Mat4): Mat3 {
  return [
    m4[0], m4[1], m4[2],
    m4[4], m4[5], m4[6],
    m4[8], m4[9], m4[10]
  ];
}

// Multiply a 3D vector by a 3x3 matrix (column-major).
export function transformVec3WithMat3(v: Vec3, m3: Mat3): Vec3 {
    return [
        m3[0] * v[0] + m3[3] * v[1] + m3[6] * v[2],
        m3[1] * v[0] + m3[4] * v[1] + m3[7] * v[2],
        m3[2] * v[0] + m3[5] * v[1] + m3[8] * v[2],
    ];
}