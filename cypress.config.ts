import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 10000, // default is 4000
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:1234',
  },
});
