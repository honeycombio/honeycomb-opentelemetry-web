import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    /**
     * The OpenTelemetry packages ship two platform builds and select between
     * them with the legacy object-form `browser` map in package.json, which is
     * not consulted unless `browser` leads the main fields.
     *
     * Without this the Node builds load and nothing fails loudly:
     * BatchLogRecordProcessor quietly loses the visibilitychange and pagehide
     * listeners that flush telemetry on unload.
     */
    mainFields: ['browser', 'module', 'main'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      /* Several suites assert on page attributes derived from location, and
       * previously set this per file with an @jest-environment-options
       * docblock. Vitest takes it once, here. */
      jsdom: {
        url: 'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
      },
    },
    setupFiles: ['./setup-vitest.ts'],
    include: ['test/**/*.test.ts'],
    /* The example apps carry their own toolchains and their own test runners. */
    exclude: ['**/node_modules/**', 'examples/**'],
  },
});
