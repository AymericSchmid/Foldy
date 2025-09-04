// Visualization configuration
export const VIS = { SPLINE_RES: 10, VECTORS_SCALE: 0.02 };
export const MESH = { SPHERE_SEGMENTS: 16, TUBE_RADIUS: 0.01, TUBE_RADIAL_SEGMENTS: 15 };
export const PHONG = {
    MAX: 2,             // Must be the same as in tube.frag, can be bigger or equal than numLights tho
    DIRECTIONS: [
        [  0.3,  0.6,  0.5 ], 
        [ -0.5, -0.3, -0.1 ]
    ],
    COLORS: [
        [46.0/255.0, 29.0/255.0, 113.0/255.0],
        [150.0/255.0, 84.0/255.0, 36.0/255.0]
    ]
};
export const CHROME = {
    INTENSITY: 1.2,
    SPARKLE: 10.0
};
export const HALFTONE ={
    ANGLE: 0.3,
    CELL: 12.0,
    THICKNESS: 8.0,
    COLOR_ON: [ 1.0, 1.0, 1.0 ],
    COLOR_OFF: [ 0.58, 0.3, 0.3 ],
};
export const POST_PROC = {
    //BLOOM_INTENSITY: 15, BLOOM_THRESHOLD: 0.55
    BLOOM_INTENSITY: 15, BLOOM_THRESHOLD: 0.9
};