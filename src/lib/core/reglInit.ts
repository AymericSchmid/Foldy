import createREGL from 'regl';

export function initRegl(canvas, dpr) {
    let DPR = Math.max(1, Math.min(dpr ?? (window.devicePixelRatio ?? 1), 2));

    // Create the REGL instance
    const regl = createREGL({
        canvas,
        extensions: ['ANGLE_instanced_arrays'],
        attributes: { antialias: true },
        profile: true,
    });

    const fboScene = regl.framebuffer({ depth: true, color: regl.texture() });
    const ping     = regl.framebuffer({ color: regl.texture() });
    const pong     = regl.framebuffer({ color: regl.texture() });

    function resize(w, h, newDpr?) {
        if (newDpr) DPR = newDpr;
        const fbW = Math.floor(w * DPR);
        const fbH = Math.floor(h * DPR);

        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width  = fbW;
        canvas.height = fbH;

        fboScene.resize(fbW, fbH);
        ping.resize(fbW, fbH);
        pong.resize(fbW, fbH);
    }
    
    resize(window.innerWidth, window.innerHeight, DPR);

    return { regl, DPR, fboScene, ping, pong, resize };
}