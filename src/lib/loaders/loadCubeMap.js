
export function loadCubeMap(urls, regl){
  return new Promise((resolve, reject) => {
    const faces = ['px','nx','py','ny','pz','nz'];
    const imgs = {};
    let left = 6;
    faces.forEach(face => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgs[face] = img;
        if (--left === 0) {
          const tex = regl.cube({
            faces: [
              imgs.px, imgs.nx,
              imgs.py, imgs.ny,
              imgs.pz, imgs.nz
            ]
          });
          resolve(tex);
        }
      };
      img.onerror = reject;
      img.src = urls[face];
    });
  });
}