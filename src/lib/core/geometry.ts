export type Vec3 = [number, number, number];
export type Points = Float32Array | number[];

// Normalize a model's vertex positions to fit inside a unit cube centered at origin.
// This helps ensure consistent sizing across different molecule files.
export function normalizeModel(positions: Points): Float32Array {
    const n = positions.length;
    if (n === 0) return new Float32Array();
    if (n % 3 !== 0) {
        throw new Error("normalizeModel: positions length must be a multiple of 3");
    }

    const min: Vec3 = [Infinity, Infinity, Infinity];
    const max: Vec3 = [-Infinity, -Infinity, -Infinity];

    // Compute bounding box
    for (let i = 0; i < positions.length; i += 3) {
        for (let j = 0; j < 3; j++){
            const val = positions[i + j];
            if (val < min[j]) min[j] = val;
            if (val > max[j]) max[j] = val;
        }
    }

    // Compute center and scale
    const center: Vec3 = [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
    ];
    const size = Math.max(
        max[0] - min[0],
        max[1] - min[1],
        max[2] - min[2],
    )
    const scale = size > 0 ? 1 / size : 1;

    // Apply transform
    const result = new Float32Array(n);
    for (let i = 0; i < n; i += 3) {
        result[i + 0] = (positions[i + 0] - center[0]) * scale;
        result[i + 1] = (positions[i + 1] - center[1]) * scale;
        result[i + 2] = (positions[i + 2] - center[2]) * scale;
    }

    return result;
}


// Generate interpolated points on a Catmull-Rom spline segment.
// P1 and P2 are the main segment, P0 and P3 are used for tangents.
function catmullRomSpline(P0: Vec3, P1: Vec3, P2: Vec3, P3: Vec3, numPoints: number, a: number, { includeP1 = false } = {}): Float32Array {
    const computeCoefficients = (i): [number,number,number] => ([
        0.5 * (-a * P0[i] + a * P2[i]),
        0.5 * (2 * a * P0[i] + (a - 6) * P1[i] + -2 * (a - 3) * P2[i] - a * P3[i]),
        0.5 * (-a * P0[i] + (4 - a) * P1[i] + (a - 4) * P2[i] + a * P3[i])
    ]);

    // Precompute polynomial coefficients for x, y, z
    const [ax, ay, az] = [0, 1, 2].map(i => computeCoefficients(i as 0 | 1 | 2)) as [
        [number, number, number],
        [number, number, number],
        [number, number, number]
    ];
    const len = (numPoints - 1 + (includeP1 ? 1 : 0)) * 3;       // -1 because we skip the last point
    const result = new Float32Array(len);       
    
    for (let i = 1 - (includeP1 ? 1 : 0); i < numPoints; i++){
        const t = numPoints > 1 ? i / (numPoints - 1) : 0;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = P1[0] + ax[0] * t + ax[1] * t2 + ax[2] * t3;
        const y = P1[1] + ay[0] * t + ay[1] * t2 + ay[2] * t3;
        const z = P1[2] + az[0] * t + az[1] * t2 + az[2] * t3;  

        const offset = (i - (1 - (includeP1 ? 1 : 0))) * 3;
        result.set([x, y, z], offset);
    }
    
    return result;
}

/**
 * Clamp endpoints by duplicating the first and last control points.
 * This ensures continuity for the start and end of the spline.
 */
function duplicateEndPoints(points: Points): Float32Array {
    if (points.length < 3) return new Float32Array(points);
    const first: Vec3 = [points[0]!, points[1]!, points[2]!];;
    const last: Vec3 = [
        points[points.length - 3]!,
        points[points.length - 2]!,
        points[points.length - 1]!,
    ];
    return new Float32Array([...first, ...points, ...last]);  
}

// Connect multiple Catmull-Rom segments into a smooth chain.
export function catmullRomChain(points: Points, numPointsPerSegment: number, { a = 1 } = {}): Float32Array {
    if (points.length < 6) return new Float32Array(points);
    if (points.length % 3 !== 0) {
        throw new Error("catmullRomChain: points length must be a multiple of 3");
    }
    if (numPointsPerSegment < 1) {
        throw new Error("catmullRomChain: numPointsPerSegment must be >= 1");
    }

    const paddedPoints = duplicateEndPoints(points);
    const totalSegments = paddedPoints.length / 3 - 3;

    const pointsInFirstSegment = numPointsPerSegment;
    const pointsInOtherSegments = (numPointsPerSegment - 1) * (totalSegments - 1);
    const totalNumInterpolatedPoints = pointsInFirstSegment + pointsInOtherSegments;
    const result = new Float32Array(totalNumInterpolatedPoints * 3);

    let offset = 0;
    const slice = (j: number): Vec3 => [
        paddedPoints[j * 3 + 0]!,
        paddedPoints[j * 3 + 1]!,
        paddedPoints[j * 3 + 2]!,
    ];

    for (let i = 0; i < totalSegments; i++){
        const segment = catmullRomSpline(
            slice(i),
            slice(i + 1),
            slice(i + 2),
            slice(i + 3),
            numPointsPerSegment,
            a,
            { includeP1: i === 0 }
        );

        result.set(segment, offset);
        offset += segment.length;
    }

    return result;
}


// Build line segments representing vectors (e.g., tangent, binormal, normal)
// This is used to visualize frames.
export function buildVectorLines(points: Points, vectors: Points, scale: number = 0.2): Float32Array {
    const n = points.length;
    if (n !== vectors.length) {
        throw new Error("buildVectorLines: points and vectors must have the same length");
    }
    if (n % 3 !== 0) {
        throw new Error("buildVectorLines: inputs must be multiples of 3");
    }

    const lines = new Float32Array(n * 2);  // Two points per line

    for (let i = 0; i < n; i += 3) {
        const px = points[i + 0]!;
        const py = points[i + 1]!;
        const pz = points[i + 2]!;
        const vx = vectors[i + 0]!;
        const vy = vectors[i + 1]!;
        const vz = vectors[i + 2]!;

        const endX = px + vx * scale;
        const endY = py + vy * scale;
        const endZ = pz + vz * scale;

        const offset = (i / 3) * 6;
        lines.set([px, py, pz], offset);       // start
        lines.set([endX, endY, endZ], offset + 3); // end
    }

    return lines;
}