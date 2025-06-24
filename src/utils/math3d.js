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

/**
 * Compute the surface normal of a triangle defined by 3 points.
 * Uses the cross product of two edge vectors and normalizes the result.
 */
export function computeTriangleNormal(p0, p1, p2) {
    const v1 = subtract(p1, p0);
    const v2 = subtract(p2, p0);
    return normalize(cross(v1, v2));
}