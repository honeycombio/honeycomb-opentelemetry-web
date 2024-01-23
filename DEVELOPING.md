# Local Development

## Prerequisites

**Required:**

- Node.js (minimum version declared in package.json)

**Recommended:**

- VSCode Plugins:
  - ESLint (dbaeumer.vscode-eslint)
  - Prettier (esbenp.prettier-vscode)
  - Prettier ESLint (rvest.vs-code-prettier-eslint)
- Docker - Required for running smoke-tests.
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) is a reliable choice if you don't have your own preference.

## Main Commands

```shell
# install all dependencies from package.json
npm install

# compile the typescript source to javascript in a dist directory
npm run build

# prettier will specify files that need formatting changes
npm run check-format

# eslint will specify files that have linting errors
npm run lint

# run unit tests with jest
npm run test
```

## Smoke Tests

Smoke tests currently use Cypress and Docker, and rely on console output.

```sh
# run smoke tests with cypress and docker
npm run test:smoke
```

If it doesn't clean up properly afterward, manually tear it down:

```sh
npm run clean:smoke-test-example
```

## Example Application

The example app uses a local install of the root directory's code, so make sure that is built first.

```sh
# navigate to example app
cd ./examples/hello-world-web

# install dependencies, including local source package
npm install

# add api key into index.js

# bundle and run example in watch mode to update when source changes
npm run dev
```

To see output in the console in the browser, be sure to enable the console level Verbose in Console Dev Tools.
