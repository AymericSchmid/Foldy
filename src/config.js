// Visualization configuration
export const VIS = { SPLINE_RES: 10, VECTORS_SCALE: 0.02 };
export const MESH = { SPHERE_SEGMENTS: 16, TUBE_RADIUS: 0.01, TUBE_RADIAL_SEGMENTS: 15 };
export const LIGTH = {
    MAX: 2,             // Must be the same as in tube.frag, can be bigger or equal than numLights tho
    DIRECTIONS: [
        [  0.3,  0.7, -0.4 ],
        [ -0.4, -0.2,  0.9 ]
    ],
    COLORS: [
        [  1.0, 1.0, 1.0 ],
        [  0.4, 0.7, 1.0 ]
    ]
};