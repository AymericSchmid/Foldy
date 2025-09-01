import createREGL from 'regl';

export function initRegl() {
    const canvas = document.getElementById('canvas');
    const DPR    = Math.min(window.devicePixelRatio || 1, 2);
    const fbWidth = Math.floor(window.innerWidth * DPR);
    const fbHeight = Math.floor(window.innerHeight * DPR);

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

    // Create the REGL instance
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

    // Build framebuffers
    const fbo1 = regl.framebuffer({ 
        depth: true, 
        color: regl.texture({
            width: fbWidth,
            height: fbHeight,
            format: 'rgba',
            type: 'uint8'
        })
    });

    const fbo2 = regl.framebuffer({ 
        depth: true, 
        color: regl.texture({
            width: fbWidth,
            height: fbHeight,
            format: 'rgba',
            type: 'uint8'
        })
    });

    return { regl, canvas, DPR, fbo1, fbo2 };
}