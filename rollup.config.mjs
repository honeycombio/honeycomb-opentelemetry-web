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
const getExternalDeps = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return (id) => pattern.test(id);
};


const external = getExternalDeps([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ])

const input = './src/index.ts';
const plugins = [
  commonjs(),
  nodeResolve({ browser: true }),
  typescript(),
  babel({
    babelHelpers: 'bundled',
    extensions: [
      ...DEFAULT_EXTENSIONS,
      '.ts',
      '.tsx'
    ]
  }),
  analyze({
    hideDeps: true,
    limit: 0,
    summaryOnly: true,
  })
]

const config = [
  {
    input,
    external,
    output: { file: 'dist/cjs/index.js', format: 'cjs' },
    plugins
  },
  {
    input,
    external,
    output: { file: 'dist/esm/index.js', format: 'esm' },
    plugins
  },
  {
    input,
    external,
    output: { file: 'dist/umd/index.js', format: 'umd', name: 'hny', globals: {
        "@opentelemetry/api": "api",
        "@opentelemetry/core": "core",
        "@opentelemetry/exporter-trace-otlp-http": "exporterTraceOtlpHttp",
        "@opentelemetry/instrumentation": "instrumentation",
        "@opentelemetry/opentelemetry-browser-detector": "opentelemetryBrowserDetector",
        "@opentelemetry/resources": "resources",
        "@opentelemetry/sdk-trace-base": "sdkTraceBase",
        "@opentelemetry/sdk-trace-web": "sdkTraceWeb",
        "@opentelemetry/semantic-conventions": "semanticConventions",
        "shimmer": "shimmer",
        "ua-parser-js": "UAParser",
        "web-vitals/attribution": "attribution",
      }},
    plugins: [...plugins, terser()]
  },
  {
    input,
    external,
    output: { file: 'dist/types/index.d.ts', format: 'esm' },
    plugins: [dts()]
  }
  ];

export default config;



// // -----
// import alias from '@rollup/plugin-alias';
// // import babel from '@rollup/plugin-babel';
// import commonjs from '@rollup/plugin-commonjs';
// import { createRequire } from 'node:module';
// import { fileURLToPath } from 'node:url';
// import analyze from 'rollup-plugin-analyzer';
// import dts from 'rollup-plugin-dts';
// import nodeResolve from '@rollup/plugin-node-resolve';
// // import preserveDirectives from 'rollup-plugin-preserve-directives';
// import terser from '@rollup/plugin-terser';
// import typescript from 'rollup-plugin-typescript2';

// const require = createRequire(import.meta.url);
// const pkg = require('./package.json');


// const makeExternalPredicate = (externalArr) => {
//   if (externalArr.length === 0) {
//     return () => false;
//   }
//   const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
//   return (id) => pattern.test(id);
// };

// const commonOpts = {
//   preserveModules:true
// }

// const plugins = [
//   typescript(),
//     // terser(),
// ]

// export default {
//   input:'./src/index.ts',
//     external: makeExternalPredicate([
//     // Handles both dependencies and peer dependencies so we don't have to manually maintain a list
//     ...Object.keys(pkg.dependencies || {}),
//     ...Object.keys(pkg.peerDependencies || {}),
//   ]),
//   output: [
//     { file: 'dist/cjs/index.js', format: 'cjs', plugins},
//     { file: 'dist/esm/index.js', format: 'esm' , plugins},
//     { file: 'dist/umd/index.js', format: 'umd', name: 'HoneycombWebSDK', plugins},
//     { file: 'dist/types/index.d.ts', format: 'esm', plugins:[dts()] }
//   ],
//   plugins: [,
//     // terser(),
//     analyze({
//       hideDeps: true,
//       limit: 0,
//       summaryOnly: true,
//     }),
//   ]
// };
