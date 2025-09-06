const ROTATION_FACTOR = 0.01;

export type Rotation = {
  x: number;
  y: number;
};

export type OnChange = (x: number, y: number) => void;

// Create an object that transform the movement of the mouse to a rotation
export function createTrackball(canvas: HTMLCanvasElement, onChange: OnChange): Rotation {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    const rotation: Rotation = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent): void => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    };

    const onMouseUp  = (_e: MouseEvent): void => {
        isDragging = false;
    };

    const onMouseMove  = (e: MouseEvent): void => {
        if (!isDragging) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        rotation.y += dx * ROTATION_FACTOR;
        rotation.x += dy * ROTATION_FACTOR;

        onChange(rotation.x, rotation.y);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);

    return rotation;
}