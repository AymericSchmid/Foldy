import typescript from '@rollup/plugin-typescript';
import { string } from 'rollup-plugin-string';
import dts from 'rollup-plugin-dts';

const external = ['regl', 'glslify', 'tslib'];

export default [
  // JS bundles (ESM + CJS)
  {
    input: 'src/lib/index.ts',
    output: [
      { file: 'dist/index.mjs', format: 'es', sourcemap: true },
      { file: 'dist/index.cjs', format: 'cjs', sourcemap: true }
    ],
    external,
    plugins: [
      // Inline GLSL files as strings
      string({
        include: ['**/*.frag', '**/*.vert']
      }),
      // Compile TS (and include JS that you import)
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },

  // Type declarations
  {
    input: 'src/lib/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
    external
  }
];