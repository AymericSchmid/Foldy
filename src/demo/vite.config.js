import glsl from 'vite-plugin-glsl';

export default {
    build: {
        outDir: '../dist'
    },
    plugins: [
        glsl({
            include: ['**/*.vert', '**/*.frag', '**/*.glsl', '**/*.wgsl'], // which files to load as strings
            warnDuplicatedImports: false,
            defaultExtension: 'glsl'
        })
    ]
};