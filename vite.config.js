import glsl from 'vite-plugin-glsl';

export default {
    build: {
        outDir: '../dist'
    },
    plugins: [glsl()],
};