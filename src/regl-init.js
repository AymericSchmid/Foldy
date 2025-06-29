import createREGL from 'regl';

export function initRegl() {
    const canvas = document.getElementById('canvas');
    const DPR    = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
        const cssW = window.innerWidth;
        const cssH = window.innerHeight;

        canvas.style.width  = cssW + 'px';
        canvas.style.height = cssH + 'px';
        canvas.width  = cssW * DPR;
        canvas.height = cssH * DPR;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);


    const regl = createREGL({
        extensions: ['ANGLE_instanced_arrays'],
        attributes: {
            antialias: true,
        },
        profile: true,
        onDone: (err, reglInstance) => {
            if(err) throw err;
        },
        canvas,
    });

    return { regl, canvas, DPR };
}