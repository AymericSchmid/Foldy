import createREGL from 'regl';

export const regl = createREGL({
    extensions: ['ANGLE_instanced_arrays'],
    attributes: {
        antialias: true,
    },
    profile: true,
    onDone: (err, reglInstance) => {
        if(err) throw err;
    },
    canvas: document.getElementById('canvas'),
});