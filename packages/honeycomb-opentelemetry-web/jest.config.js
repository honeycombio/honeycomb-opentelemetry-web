/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['^.+\\.js$', './node_modules/*'],
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jest-fixed-jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  modulePathIgnorePatterns: [
    '<rootDir>/examples/',
  ],
};
