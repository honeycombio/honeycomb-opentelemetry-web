# Local Development

## Prerequisites

**Required:**

- Node.js, version pinned in `.nvmrc` (currently 24.19.0, the same version CI
  builds on). With `asdf`, install it from the repo root:

  ```sh
  asdf install nodejs
  ```

  This requires `legacy_version_file=yes` in `~/.asdfrc` so asdf reads `.nvmrc`.
  With `nvm`, `nvm use` reads it directly.

- npm >= 11.10.0, which the pinned Node bundles (11.17.0).

  `packages/honeycomb-opentelemetry-web/.npmrc` sets [`min-release-age`](https://docs.npmjs.com/cli/using-npm/config#min-release-age)
  to quarantine newly published dependency versions. npm only understands that
  key from 11.10.0 onward; older versions merely *warn* about an unknown key and
  install anyway, silently dropping the protection.

  Verify before installing dependencies. `npm config get min-release-age` echoes
  the value whether or not npm understands it, so check the **warning**, not the
  value -- this should print the quarantine window in days with no
  `Unknown project config` warning:

  ```sh
  cd packages/honeycomb-opentelemetry-web && npm config get min-release-age
  ```

  If you see the warning while on the pinned Node, a separately installed npm is
  probably taking precedence. `asdf-nodejs` wraps `npm` in a shim that searches
  `PATH` for an npm *outside* asdf first and only falls back to the bundled one,
  so a Homebrew npm wins even though asdf comes first on `PATH`. Compare:

  ```sh
  npm --version                        # what you actually get
  "$(asdf where nodejs)"/bin/npm --version   # what asdf bundles
  ```

  Removing the other install (`brew uninstall node`) is the durable fix. To
  override just for one command, set `ASDF_NODEJS_CANON_NPM_PATH`:

  ```sh
  ASDF_NODEJS_CANON_NPM_PATH="$(asdf where nodejs)/bin/npm" npm ci
  ```

  A consequence worth knowing: dependency versions published within that window
  cannot be installed yet. To take one deliberately sooner, prefer
  `min-release-age-exclude` for that package over removing the setting.

**Recommended:**

- VSCode Plugins:
  - ESLint (dbaeumer.vscode-eslint)
  - Prettier (esbenp.prettier-vscode)
  - Prettier ESLint (rvest.vs-code-prettier-eslint)
- Docker & Docker Compose - Required for running smoke tests.
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) is a reliable choice if you don't have your own preference.
- [`bats-core`](https://bats-core.readthedocs.io/en/stable/) and [`jq`](https://jqlang.github.io/jq/) - Required for running smoke tests

## Main Commands

```sh
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

Smoke tests use Cypress and Docker using `docker-compose`, exporting telemetry to a local collector.
Tests are run using `bats-core` and `jq`, bash tools to make assertions against the telemetry output.

Install `bats-core` and `jq` for local testing:

```sh
brew install bats-core
brew install jq
```

Smoke tests can be run with either `npm` scripts or with `make` targets (the latter works better in CI).

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

### Running with Docker-Compose

You can also use the docker-compose file to run in Docker.

```sh
docker-compose up --build app-hello-world-web
```

To run the app with a collector (also included in docker-compose here):

```sh
docker-compose up --build
```

When finished:

```sh
docker-compose down
```

## Building a Tarball for Local Development

To get a tarball to use as a local dependency:

```sh
npm run build
npm pack
```

This creates a file in the root directory like this: `honeycombio-opentelemetry-web-0.1.42.tgz`
To use as a dependency in another project, install it with `npm`:

`npm install honeycombio-opentelemetry-web-0.1.1.tgz`

This will create a dependency in your `package.json` like this:

```json
  "dependencies": {
    "@honeycombio/opentelemetry-web": "file:honeycombio-opentelemetry-web-0.1.42.tgz",
  }
```

## Dependabot

Dependabot manages our dependency upgrades automatically by creating PRs to bump dependencies for us. Currently our packages get updates weekly (ignoring major version bumps, we do those manually) and examples get updates monthly.

If you add a new example, please add an entry to `dependabot.yml` for your new example so that it can get package updates with dependabot.
