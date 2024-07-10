import { createRequire } from 'node:module';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import { fileURLToPath } from 'node:url';
import analyze from 'rollup-plugin-analyzer';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

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
  external: getExternalDepsFromPackageJSON(),
  output: { file: 'dist/cjs/index.js', format: 'cjs' },
  plugins: [...modulePlugins],
};

const esmConfig = {
  input: entryPoint,
  external: getExternalDepsFromPackageJSON(),
  output: { file: 'dist/esm/index.js', format: 'esm' },
  plugins: [...modulePlugins],
};

const typesConfig = {
  input: entryPoint,
  external: getExternalDepsFromPackageJSON(),
  output: { file: 'dist/types/index.d.ts', format: 'esm' },
  plugins: [dts()],
};

const config = [cjsConfig, esmConfig, typesConfig];

export default config;
