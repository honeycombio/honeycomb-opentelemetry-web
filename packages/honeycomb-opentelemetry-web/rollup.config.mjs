import { DEFAULT_EXTENSIONS } from '@babel/core';
import analyze from 'rollup-plugin-analyzer';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';

const entryPoint = {
  index: './src/index.ts',
  'experimental/index': './src/experimental/index.ts',
};

const modulePlugins = [
  autoExternal(),
  commonjs(),
  nodeResolve({ browser: true }),
  typescript(),
  babel({
    babelHelpers: 'bundled',
    extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
  }),
  analyze({
    hideDeps: true,
    limit: 0,
    summaryOnly: true,
  }),
];

const cjsConfig = {
  input: entryPoint,
  output: { dir: 'dist/cjs', format: 'cjs' },
  plugins: [...modulePlugins],
};

const esmConfig = {
  input: entryPoint,
  output: { dir: 'dist/esm', format: 'esm' },
  plugins: [...modulePlugins],
};

const IGNORE_WARNINGS = ['THIS_IS_UNDEFINED', 'CIRCULAR_DEPENDENCY', 'EVAL'];
const printHeader = () => ({
  name: 'rollup-plugin-print-header',
  load(source) {
    if (this.getModuleInfo(source).isEntry) {
      console.log('⚠️ ignoring warnings: ', IGNORE_WARNINGS.join(', '));
    }
  },
});
const cdnConfig = {
  onwarn(warning, defaultHandler) {
    if (IGNORE_WARNINGS.includes(warning.code)) {
      return;
    }
    defaultHandler(warning);
  },
  input: './src/cdn.ts',
  output: {
    file: 'dist/umd/index.js',
    format: 'umd',
    name: 'HNY',
  },
  plugins: [
    printHeader(),
    commonjs({ sourceMap: false }),
    nodeResolve({ browser: true, sourceMap: false }),
    typescript(),
    babel({
      babelHelpers: 'bundled',
      extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
      sourceMaps: false,
    }),
    analyze({
      hideDeps: true,
      limit: 0,
      summaryOnly: true,
    }),
  ],
};

const typesConfig = {
  input: entryPoint,
  output: { dir: 'dist/types/', format: 'esm' },
  plugins: [
    autoExternal(),
    dts(),
    analyze({
      hideDeps: true,
      limit: 0,
      summaryOnly: true,
    }),
  ],
};

const config = [cjsConfig, esmConfig, typesConfig, cdnConfig];

export default config;
