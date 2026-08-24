const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const importX = require('eslint-plugin-import-x');
const prettier = require('eslint-config-prettier');

/**
 * ESLint 10 only reads flat config, so this replaces .eslintrc.js and
 * .eslintignore. The rules are carried over unchanged.
 *
 * eslint-plugin-import has no ESLint 10 support, so linting imports uses
 * eslint-plugin-import-x, its maintained fork.
 */
module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.cache/**',
      /* Both React examples configure eslint through .eslintrc.json extending
       * `react-app`, which is eslintrc-only and unsupported on ESLint 10. They
       * are linted by their own react-scripts toolchain instead. */
      'examples/hello-world-react-create-app/**',
      'examples/experimental/user-interaction-instrumentation/**',
    ],
  },

  js.configs.recommended,
  importX.flatConfigs.recommended,
  prettier,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      /* Without this, CommonJS-typed packages such as shimmer resolve to an
       * empty namespace and every member access is reported as missing. */
      'import-x/resolver': { typescript: true },
    },
    rules: {
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
    },
  },

  {
    files: ['**/*.ts'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json', './tsconfig.json'],
      },
    },
    // Noisy rules, left off deliberately.
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      /* TypeScript already reports missing members on a namespace import, and
       * the rule cannot see through CommonJS type declarations such as
       * shimmer's. */
      'import-x/namespace': 'off',
    },
  },

  {
    /* Example TypeScript is outside the package tsconfigs, so the
     * type-checked rules above cannot resolve it. Lint it untyped. */
    files: ['examples/**/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    files: ['test/**/*.ts'],
    rules: {
      /* Several web vitals tests deliberately record the default
       * stringification of a PerformanceEntry list, which is what the browser
       * would send. */
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },
);
