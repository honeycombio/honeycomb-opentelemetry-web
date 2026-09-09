/**
 * Loads the built non-browser entry point in this process, which has no DOM.
 *
 * Runs as part of `npm run build`. The test suite cannot catch this: it runs in
 * jsdom, where `window` exists, so a module-scope browser global never fails
 * there. 1.5.0 shipped exactly that way — green suite, unimportable in Node.
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const targets = [
  ['cjs', () => require(resolve('dist/cjs/node.js'))],
  ['esm', () => import(pathToFileURL(resolve('dist/esm/node.js')).href)],
];

const REQUIRED = [
  'HoneycombWebSDK',
  'WebSDK',
  'WebVitalsInstrumentation',
  'GlobalErrorsInstrumentation',
  'UserInteractionInstrumentation',
  'BaggageSpanProcessor',
  'recordException',
];

if (typeof window !== 'undefined') {
  console.error(
    'verify-node-entry: expected a DOM-free process, found a window',
  );
  process.exit(1);
}

for (const [label, load] of targets) {
  let mod;
  try {
    mod = await load();
  } catch (err) {
    console.error(
      `verify-node-entry: dist/${label}/node.js failed to load outside a browser`,
    );
    console.error(err);
    process.exit(1);
  }

  const missing = REQUIRED.filter((name) => mod[name] === undefined);
  if (missing.length) {
    console.error(
      `verify-node-entry: dist/${label}/node.js is missing ${missing.join(', ')}`,
    );
    process.exit(1);
  }

  try {
    new mod.HoneycombWebSDK({
      apiKey: 'x'.repeat(32),
      serviceName: 'verify',
    }).start();
    mod.recordException(new Error('verify'));
  } catch (err) {
    console.error(`verify-node-entry: dist/${label}/node.js is not inert`);
    console.error(err);
    process.exit(1);
  }
}

console.log('verify-node-entry: cjs and esm load and no-op outside a browser');
