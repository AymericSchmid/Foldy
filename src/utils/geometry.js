import multiply from "gl-mat4/multiply";
import { subtract, normalize, dot, scale, orthogonalize, cross } from './math3d'

/**
 * Normalize a model's vertex positions to fit inside a unit cube centered at origin.
 * This helps ensure consistent sizing across different molecule files.
 */
export function normalizeModel(positions) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];

    // Compute bounding box of the model
    for (let i = 0; i < positions.length; i += 3) {
        for (let j = 0; j < 3; j++){
            const val = positions[i + j];
            if (val < min[j]) min[j] = val;
            if (val > max[j]) max[j] = val;
        }
    }

    // Compute center and scale
    const center = [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
    ];
    const size = Math.max(
        max[0] - min[0],
        max[1] - min[1],
        max[2] - min[2],
    )
    const scale = 1 / size;

    // Apply normalization transform
    const result = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
        result[i + 0] = (positions[i + 0] - center[0]) * scale;
        result[i + 1] = (positions[i + 1] - center[1]) * scale;
        result[i + 2] = (positions[i + 2] - center[2]) * scale;
    }

    return result;
}

/**
 * Generate interpolated points on a Catmull-Rom spline segment.
 * P1 and P2 are the main segment, P0 and P3 are used for tangents.
 * https://andrewhungblog.wordpress.com/2017/03/03/catmull-rom-splines-in-plain-english/ 
 */
function catmullRomSpline(P0, P1, P2, P3, numPoints, a, { includeP1 = false } = {}){
    const computeCoefficients = (i) => ([
        0.5 * (-a * P0[i] + a * P2[i]),
        0.5 * (2 * a * P0[i] + (a - 6) * P1[i] + -2 * (a - 3) * P2[i] - a * P3[i]),
        0.5 * (-a * P0[i] + (4 - a) * P1[i] + (a - 4) * P2[i] + a * P3[i])
    ]);

    // Precompute polynomial coefficients for x, y, z
    const [ax, ay, az] = [0, 1, 2].map(computeCoefficients);
    const result = new Float32Array((numPoints - 1 + includeP1) * 3);       // -1 because we skip the last point
    
    for (let i = 1 - includeP1; i < numPoints; i++){
        const t = i/ (numPoints - 1);
        const t2 = t * t;
        const t3 = t2 * t;

        const x = P1[0] + ax[0] * t + ax[1] * t2 + ax[2] * t3;
        const y = P1[1] + ay[0] * t + ay[1] * t2 + ay[2] * t3;
        const z = P1[2] + az[0] * t + az[1] * t2 + az[2] * t3;  

        const offset = (i - (1 - includeP1)) * 3;
        result.set([x, y, z], offset);
    }
    
    return result;
}

/**
 * Clamp endpoints by duplicating the first and last control points.
 * This ensures continuity for the start and end of the spline.
 */
function duplicateEndPoints(points) {
    const first = points.slice(0, 3);
    const last = points.slice(points.length - 3);
    return new Float32Array([...first, ...points, ...last]);
}

// Connect multiple Catmull-Rom segments into a smooth chain.
export function catmullRomChain(points, numPointsPerSegment, { a = 1 } = {}){
    const paddedPoints = duplicateEndPoints(points);
    const totalSegments = (paddedPoints.length / 3) - 3;

    const pointsInFirstSegment = numPointsPerSegment;
    const pointsInOtherSegments = (numPointsPerSegment - 1) * (totalSegments - 1);
    const totalNumInterpolatedPoints = pointsInFirstSegment + pointsInOtherSegments;
    const result = new Float32Array(totalNumInterpolatedPoints * 3);

    let offset = 0;
    for (let i = 0; i < totalSegments; i++){
        const slice = (j) => paddedPoints.slice(j * 3, j * 3 + 3);
        const segment = catmullRomSpline(
            slice(i),
            slice(i + 1),
            slice(i + 2),
            slice(i + 3),
            numPointsPerSegment, 
            a, 
            { includeP1: i === 0 });

        result.set(segment, offset);
        offset += segment.length;
    }

    return result;
}

/**
 * Build line segments representing vectors (e.g., tangent, binormal, normal)
 * This is used to visualize frames.
 */
export function buildVectorLines(points, vectors, scale = 0.2) {
    const lines = new Float32Array(points.length * 2);  // Two points per line

    for (let i = 0; i < points.length; i += 3) {
        const pi = [points[i], points[i + 1], points[i + 2]];
        const vi = [vectors[i], vectors[i + 1], vectors[i + 2]];

        const end = [
            pi[0] + vi[0] * scale,
            pi[1] + vi[1] * scale,
            pi[2] + vi[2] * scale
        ]

        const offset = (i / 3) * 6;
        lines.set(pi, offset);          // Start of the line
        lines.set(end, offset + 3);     // End of the line
    }

    return lines;
}