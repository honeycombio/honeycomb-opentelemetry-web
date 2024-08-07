/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['^.+\\.js$'],
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: [
    '<rootDir>/examples/hello-world-react-create-app/',
  ],
};
