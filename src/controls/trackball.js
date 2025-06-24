import mat4 from 'gl-mat4';

const ROTATION_FACTOR = 0.01;

// Create an object that transform the movement of the mouse to a rotation
export function createTrackball(canvas) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    const rotation = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    canvas.addEventListener('mouseup', (e) => {
        isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        rotation.y += dx * ROTATION_FACTOR;
        rotation.x += dy * ROTATION_FACTOR;
    });

    return rotation;
}