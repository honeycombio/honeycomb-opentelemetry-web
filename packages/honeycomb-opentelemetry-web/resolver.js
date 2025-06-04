// Jest doesn't normally support package.json's "browser" map, so this custom
// resolver implements that.
module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    pathFilter: (pkg, path, relativePath) => {
      // e.g. build/src/platform/index -> ./src/platform/index.ts
      if (pkg.browser) {
        let adjustedPath = relativePath.replace(/^build\//, './') + '.ts';
        if (pkg.browser[adjustedPath]) {
          // the reverse of the previous transformation
          let newPath =
            'build/' + pkg.browser[adjustedPath].replace(/\.ts$/, '.js');
          return newPath;
        }
      }
      return relativePath;
    },
  });
};
