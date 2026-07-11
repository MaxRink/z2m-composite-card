import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/z2m-composite-card.ts',
  output: {
    file: 'dist/z2m-composite-card.js',
    format: 'es',
    sourcemap: false,
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json', noEmit: false }),
    terser(),
  ],
};
