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
      /* The example apps carry their own toolchains and their own eslint
       * configuration, which flat config does not pick up. They are linted from
       * their own directories instead. */
      'examples/**',
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
    files: ['test/**/*.ts'],
    rules: {
      /* Several web vitals tests deliberately record the default
       * stringification of a PerformanceEntry list, which is what the browser
       * would send. */
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },
);
