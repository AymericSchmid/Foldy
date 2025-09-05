
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
        this.circleVertices = new Float32Array(this.radialSegment * 3 * this.numPoints);
        this.circleNormals = new Float32Array(this.radialSegment * 3 * this.numPoints);

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
            const { vertices, normals } = this.generateCircle(p, r, c);
            this.circleVertices.set(vertices, i * 3 * this.radialSegment);
            this.circleNormals.set(normals, i * 3 * this.radialSegment);
        }
    }

    // Generate a circle at a point using frame vectors
    generateCircle(point, r, c) {
        const vertices = new Float32Array(this.radialSegment * 3);
        const normals = new Float32Array(this.radialSegment * 3);

        for (let i = 0; i < this.radialSegment; i++) {
            const angle = (i / this.radialSegment) * 2 * Math.PI;
            const dx = Math.cos(angle) * this.radius;
            const dy = Math.sin(angle) * this.radius;

            const normal = [
                dx * r[0] + dy * c[0],
                dx * r[1] + dy * c[1],
                dx * r[2] + dy * c[2]
            ];
            const position = [
                point[0] + normal[0],
                point[1] + normal[1],
                point[2] + normal[2]
            ];

            vertices.set(position, i * 3);
            normals.set(normal, i * 3);
        }

        return { vertices, normals };
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
        const getCircle = (arr, i) => arr.slice(i * this.radialSegment * 3, i * this.radialSegment * 3 + this.radialSegment * 3); 

        let offset = 0;
        for (let i = 0; i < this.numPoints - 1; i++) {
            const ci0 = getCircle(this.circleVertices, i);
            const ci1 = getCircle(this.circleVertices, i + 1);
            const ni0 = getCircle(this.circleNormals, i);
            const ni1 = getCircle(this.circleNormals, i + 1);
            
            for (let j0 = 0; j0 < this.radialSegment; j0++) {
                const j1 = (j0 + 1) % this.radialSegment;

                const p0 = ci0.slice(j0 * 3, j0 * 3 + 3);
                const p1 = ci1.slice(j0 * 3, j0 * 3 + 3);
                const p2 = ci1.slice(j1 * 3, j1 * 3 + 3);
                const p3 = ci0.slice(j1 * 3, j1 * 3 + 3);
                const n0 = ni0.slice(j0 * 3, j0 * 3 + 3);
                const n1 = ni1.slice(j0 * 3, j0 * 3 + 3);
                const n2 = ni1.slice(j1 * 3, j1 * 3 + 3);
                const n3 = ni0.slice(j1 * 3, j1 * 3 + 3);

                // Triangle 1: p0 → p1 → p2
                this.tubeTriangles.set([...p0, ...p1, ...p2], offset);
                this.tubeNormals.set([...n0, ...n1, ...n2], offset);
                offset += 9;

                // Triangle 2: p0 → p2 → p3
                this.tubeTriangles.set([...p0, ...p2, ...p3], offset);
                this.tubeNormals.set([...n0, ...n2, ...n3], offset);
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