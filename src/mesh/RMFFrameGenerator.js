import { subtract, normalize, dot, scale, orthogonalize, cross } from '../utils/math3d'

/**
 * Generates a Rotation Minimizing Frame (RMF) using the double reflection method.
 * This is commonly used to construct smoothly varying local coordinate frames
 * along a curve (e.g., a backbone or spline) to avoid twisting artifacts.
 */
export class RMFFrameGenerator {

    constructor(points){
        this.points = points;
        this.t = new Float32Array(points.length);   // Tangents
        this.r = new Float32Array(points.length);   // Reference (right) vectors
        this.c = new Float32Array(points.length);   // Binormals (cross products)
    }

    // Computes the RMF using double reflection between each segment of the curve
    compute() {
        const numPoints = this.points.length / 3;

        const getVec = (i, arr) => [arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]];
        const setVec = (i, vec, arr) => arr.set(vec, i * 3);

        // --- Initialization for the first frame ---
        const P0 = getVec(0, this.points);
        const P1 = getVec(1, this.points);
        const t0 = normalize(subtract(P1, P0));
        const r0 = orthogonalize([0, 1, 0], t0);
        const c0 = cross(t0, r0);

        setVec(0, t0, this.t);
        setVec(0, r0, this.r);
        setVec(0, c0, this.c);

        // --- Iteratively compute RMF for each subsequent point ---
        for (let i = 1; i < numPoints - 1; i++){
            const pi_1 = getVec(i - 1, this.points);
            const pi = getVec(i, this.points);
            const pi1 = getVec(i + 1, this.points);
            const ri_1 = getVec(i - 1, this.r);

            // Compute segment directions
            const v1 = subtract(pi, pi_1);
            const v2 = subtract(pi1, pi);

            // First reflection: reflect ri_1 about v1
            const refl1 = subtract(ri_1, scale(v1, 2 * dot(v1, ri_1) / dot(v1, v1)));

            // Second reflection: reflect refl1 about v2
            const refl2 = subtract(refl1, scale(v2, 2 * dot(v2, refl1) / dot(v2, v2)));

            // Final frame vectors
            const ti = normalize(v2);
            const ri = normalize(refl2);
            const ci = cross(ti, ri);
            
            setVec(i, ti, this.t);
            setVec(i, ri, this.r);
            setVec(i, ci, this.c);
        }
    }

    getFrames() {
        return { t: this.t, r: this.r, c: this.c }
    }
}