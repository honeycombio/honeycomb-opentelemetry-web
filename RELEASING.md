# Releasing

## Available Tag Prefixes
We currently publish 2 packages from this repository. Each package is versioned separately, and may be released independently. We manage releases via git tags, and we use the following tags for each package:

| package                                 | tag                                     |
| --------------------------------------- | --------------------------------------- |
| packages/honeycomb-opentelemetry-web    | `honeycomb-opentelemetry-web-vX.Y.Z`    |
| packages/experimental-opentelemetry-web | `experimental-opentelemetry-web-vX.Y.Z` |

NOTE: the `X.Y.Z` at the end of each tag will be replaced with the version number for that package.

### Release Steps:

#### Checkout latest and create a release branch:
2. Checkout the `main` branch and fetch the latest
    ```shell
    git checkout main && git fetch
    ```
1.  Checkout a new branch for the release `release-YYYY-MM-DD` (i.e. `release-2024-09-16`)
    ```shell
    git checkout -b release-honeycomb-opentelemetry-web-vX.Y.Z
    ```

#### Bump versions and update changelog:
  >For _EACH_ package that has changes to release:

3. `cd` into the package you'd like to release i.e.
    ```shell
    cd packages/honeycomb-opentelemetry-web`
    ```
    OR
    ```shell
    cd packages/experimental-opentelemetry-web`
    ```
4. Clear `node_modules` and install dependencies
    ```shell
    rm -rf node_modules
    ```
    ```shell
    npm ci
    ```
5.  Ensure the package builds
    ```shell
    npm run build
    ```
6. Bump the package version number using `major`, `minor`, `patch`, or the prerelease variants `premajor`, `preminor`, or `prepatch`.
   ```shell
   npm version --no-git-tag-version RELEASE_TYPE
   vX.Y.Y
   ```
7. Confirm the version number in the package's `package.json` and `package-lock.json`. the out put of `npm version` should match the `version` field in both `package.json` and `package-lock.json`.
8. Update `version.ts` with the new version number.
9. Update the `CHANGELOG.md` using:
    ```shell
      `git log --pretty='%C(green)%d%Creset- %s | %an'`
    ```
    - Copy the latest commits and paste them into the package's `CHANGELOG.md`
    - Update the author names to GitHub handles
10. If any of the upstream [OpenTelemetry](https://github.com/open-telemetry) package versions have changed, update [`README.md`](./README.md) with new versions and links.

#### Open the release PR
11. Commit your changes, push a release and open a PR on GitHub (i.e. `git commit -am "rel: Releasing honeycomb-opentelemetry-web-v0.7.0, experimental-opentelemetry-web-v0.1.0"`)
      ```shell
      git commit -am "rel: Releasing TAG_A, TAG_B"
      git push origin BRANCH
      ```
      - Make sure the PR title starts with `rel:` to conform with our semantic commits convention
      - Add the `no-changelog`, `type: maintenance`, and `version: no bump` labels
12. Once the pull request is approved, squash-merge it
1. Checkout `main` and fetch the now-updated `main` branch.

#### Create tags and publish release
  >For _EACH_ package that needs to be released:
14. Create a tag for the new version:
    ```shell
      git tag -a honeycomb-opentelemetry-web-vX.Y.Z -m honeycomb-opentelemetry-web-vX.Y.Z
    ```
    - These tags MUST correspond to the accepted tag prefixes (see [Available Tag Prefixes](#available-tag-prefixes)).
15. Push the tag upstream:
    ```shell
      git push origin TAG
    ```
1. Publish Release notes
   Pushing the tags will kickoff a CI process that will create a draft GitHub release
   1. Wait for the CI pipeline to finish and ensure the draft exists at: https://github.com/honeycombio/honeycomb-opentelemetry-web/releases
   2. Click "generate release notes" in GitHub for full changelog notes and at-mention any new contributors
   3. Publish the GitHub draft release
      - If it is a prerelease (e.g., beta) click the prerelease checkbox.


