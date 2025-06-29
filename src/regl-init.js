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

    const colorTex = regl.texture({
        width: fbWidth,
        height: fbHeight,
        format: 'rgba',
        type: 'uint8'
    })

    // Build framebuffers
    const sceneFbo = regl.framebuffer({ depth: true, color: colorTex });

    return { regl, canvas, DPR, sceneFbo };
}