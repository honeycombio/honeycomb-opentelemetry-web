const fs = require('fs');
const path = require('path');

/**
 * Jest does not apply the `browser` field from a dependency's package.json, so
 * this resolver does it.
 *
 * That matters here because the OpenTelemetry packages ship two platform
 * builds and select between them through `browser`. Without this, tests load
 * the Node build: `BatchLogRecordProcessor` would silently lose the
 * visibilitychange and pagehide listeners that flush telemetry on unload, and
 * nothing would fail loudly enough to notice.
 *
 * It maps the *resolved* path rather than the request. Jest 30 replaced its
 * resolver with unrs-resolver, and the `pathFilter` hook the previous
 * implementation relied on is no longer honoured, so the rewrite has to happen
 * after resolution. Doing it this way works on both Jest 29 and 30.
 */

const packageJsonCache = new Map();

/** Finds the package that owns a file, and returns its root and manifest. */
const owningPackage = (filePath) => {
  let dir = path.dirname(filePath);

  while (true) {
    if (packageJsonCache.has(dir)) {
      return packageJsonCache.get(dir);
    }

    const manifestPath = path.join(dir, 'package.json');
    if (fs.existsSync(manifestPath)) {
      let entry = null;
      try {
        entry = {
          root: dir,
          manifest: JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
        };
      } catch {
        entry = null;
      }
      packageJsonCache.set(dir, entry);
      return entry;
    }

    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
};

module.exports = (request, options) => {
  const resolved = options.defaultResolver(request, options);

  const owner = owningPackage(resolved);
  const browser = owner?.manifest?.browser;
  if (!browser || typeof browser !== 'object') {
    return resolved;
  }

  // The `browser` map is keyed by package-relative specifiers such as
  // "./build/src/platform/index.js".
  const relative = `./${path.relative(owner.root, resolved).split(path.sep).join('/')}`;
  const replacement = browser[relative];

  return typeof replacement === 'string'
    ? path.resolve(owner.root, replacement)
    : resolved;
};
