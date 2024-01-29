# Local Development

## Prerequisites

**Required:**

- Node.js (minimum version declared in package.json)

**Recommended:**

- VSCode Plugins:
  - ESLint (dbaeumer.vscode-eslint)
  - Prettier (esbenp.prettier-vscode)
  - Prettier ESLint (rvest.vs-code-prettier-eslint)
- Docker & Docker Compose - Required for running smoke-tests.
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

Smoke tests use Cypress and Docker with `docker-compose`, exporting telemetry to a local collector.
They can be run with either `npm` scripts or with `make` targets (the latter works better in CI).

```sh
# run smoke tests with cypress and docker
npm run test:smoke

# alternative using make: run smoke tests with cypress and docker (used in CI)
make smoke
```

The results of both the tests themselves and the telemetry collected by the collector are in a file `data.json` in the `smoke-tests` directory.
These artifacts are also uploaded to Circle when run in CI.

After smoke tests are done, tear down docker containers:

```sh
npm run test:unsmoke

# alternative using make
make unsmoke
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
