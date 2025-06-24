import { computeTriangleNormal } from '../utils/math3d' 

export class TubeMeshBuilder {
    constructor(splinePoints, frames, { radius = 0.02, radialSegment = 5} = {}){
        this.splinePoints = splinePoints;
        this.t = frames.t;
        this.r = frames.r;
        this.c = frames.c;
        this.radius = radius;
        this.radialSegment = radialSegment;

        this.numPoints = splinePoints.length / 3;
        
        // Circle vertices for each spline point
        this.circleVertices = new Float32Array(radialSegment * 3 * this.numPoints);

        // Tube geometry: 2 triangles per segment per slice
        this.numTriangles = (this.numPoints - 1) * this.radialSegment * 2;
        this.tubeTriangles = new Float32Array(this.numTriangles * 9);   // 3 vertices × 3 components
        this.tubeNormals = new Float32Array(this.numTriangles * 9);     // One normal per vertex (flat shading)
    }

    // Generate ring vertices at each spline point using local RMF frame
    generateMesh(){
        const getVec = (i, arr) => [arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]];

        for (let i = 0; i < this.numPoints; i++) {
            const p = getVec(i, this.splinePoints);
            const r = getVec(i, this.r);
            const c = getVec(i, this.c);
            const vertices = this.generateCircle(p, r, c);
            this.circleVertices.set(vertices, i * 3 * this.radialSegment);
        }
    }

    // Generate a circle at a point using frame vectors
    generateCircle(point, r, c) {
        const vertices = new Float32Array(this.radialSegment * 3);

        for (let i = 0; i < this.radialSegment; i++) {
            const angle = (i / this.radialSegment) * 2 * Math.PI;
            const dx = Math.cos(angle) * this.radius;
            const dy = Math.sin(angle) * this.radius;

            // Position = center + dx * r + dy * c
            const x = point[0] + r[0] * dx + c[0] * dy;
            const y = point[1] + r[1] * dx + c[1] * dy;
            const z = point[2] + r[2] * dx + c[2] * dy;

            vertices.set([x, y, z], i * 3);
        }

        return vertices;
    }

    // Generate flat caps at each ring (optional)
    tesselateTubeCaps() {
        // Each ring becomes a fan of triangles connecting the center to the edges
        const positions = new Float32Array(this.numPoints * this.radialSegment * 3 * 3);

        for (let i = 0; i < this.numPoints; i++) {
            const centerIndex = i * this.radialSegment * 3;
            const center = this.splinePoints.slice(i * 3, i * 3 + 3);

            for (let j = 0; j < this.radialSegment; j++) {
                const j0 = (j % this.radialSegment);
                const j1 = ((j + 1) % this.radialSegment);

                const p0Offset = centerIndex + j0 * 3;
                const p1Offset = centerIndex + j1 * 3;

                const p0 = this.circleVertices.slice(p0Offset, p0Offset + 3);
                const p1 = this.circleVertices.slice(p1Offset, p1Offset + 3);

                const triangle = [...center, ...p0, ...p1];
                const triIndex = i * this.radialSegment + j;
                positions.set(triangle, triIndex * 9);
            }
        }

        return positions;
    }

    // Tesselate the tube by connecting adjacent rings with quads split into triangles
    tesselateTube() {
        const getCircle = (i) => this.circleVertices.slice(i * this.radialSegment * 3, i * this.radialSegment * 3 + this.radialSegment * 3); 

        let offset = 0;
        for (let i = 0; i < this.numPoints - 1; i++) {
            const ci0 = getCircle(i);
            const ci1 = getCircle(i + 1);
            
            for (let j0 = 0; j0 < this.radialSegment; j0++) {
                const j1 = (j0 + 1) % this.radialSegment;

                const p0 = ci0.slice(j0 * 3, j0 * 3 + 3);
                const p1 = ci1.slice(j0 * 3, j0 * 3 + 3);
                const p2 = ci1.slice(j1 * 3, j1 * 3 + 3);
                const p3 = ci0.slice(j1 * 3, j1 * 3 + 3);

                // Triangle 1: p0 → p1 → p2
                this.tubeTriangles.set([...p0, ...p1, ...p2], offset);
                const n1 = computeTriangleNormal(p0, p1, p2);
                this.tubeNormals.set([...n1, ...n1, ...n1], offset);
                offset += 9;

                // Triangle 2: p0 → p2 → p3
                this.tubeTriangles.set([...p0, ...p2, ...p3], offset);
                const n2 = computeTriangleNormal(p0, p2, p3);
                this.tubeNormals.set([...n2, ...n2, ...n2], offset);
                offset += 9;
            }
        }
    }

    // Accessors for geometry data
    getTubeTriangles() {
        return this.tubeTriangles;
    }

    getTubeNormals() {
        return this.tubeNormals;
    }
}