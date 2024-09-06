import { createRequire } from 'node:module';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import analyze from 'rollup-plugin-analyzer';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// get dependencies and peer dependencies as declared in package.json
const getExternalDepsFromPackageJSON = () => {
  const externalArr = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ];

  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return (id) => pattern.test(id);
};

const entryPoint = './src/index.ts';

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
  output: { file: 'dist/cjs/index.js', format: 'cjs' },
  plugins: [...modulePlugins],
};

const esmConfig = {
  input: entryPoint,
  output: { file: 'dist/esm/index.js', format: 'esm' },
  plugins: [...modulePlugins],
};

const IGNORE_WARNINGS = new Set([
  'THIS_IS_UNDEFINED',
  'CIRCULAR_DEPENDENCY',
  'EVAL',
]);
const cdnConfig = {
  onwarn(warning, defaultHandler) {
    if (IGNORE_WARNINGS.has(warning.code)) {
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
  output: { file: 'dist/types/index.d.ts', format: 'esm' },
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
