# Releasing

## Prep
- Checkout a new branch (ex. release-vX.Y.Z)

## Code changes
- `cd` into the package you want to do the release for
  - If you are releasing both packages at the same time, you can do that on one branch, you just need to repeat the following steps in this section (ie. up until the "git tagging and release" section) for each package.
- Pull `main` and run `npm ci` to ensure your local `node_modules` are up to date.
- Use `npm version --no-git-tag-version` to update the version number using `major`, `minor`, `patch`, or the prerelease variants `premajor`, `preminor`, or `prepatch`.
  For example, to bump from v1.1.1 to the next patch version:

```shell
> npm version --no-git-tag-version patch # 1.1.1 -> 1.1.2
```

- Confirm the version number update appears in `package.json` and `package-lock.json`.
- Update `version.ts` with the new version number.
- Update `CHANGELOG.md` with the changes since the last release. Consider automating with a command such as these two:
  - `git log $(git describe --tags --abbrev=0)..HEAD --no-merges --oneline > new-in-this-release.log`
  - `git log --pretty='%C(green)%d%Creset- %s | %an'`
- If the upstream OpenTelemetry package versions have changed, update README with new versions and links.
- Commit your changes, push, and open a release preparation pull request for review.
  - make sure the PR title starts with `rel:` to conform with our semantic commits convention
  - add the `no-changelog`, `type: maintenance`, and `version: no bump` labels
- Once the pull request is approved, squash-merge it

## Git Tags and Releases
- Checkout `main` and fetch the now-updated `main` branch.
- Apply a tag for the new version on the merged commit (e.g. `git tag -a web-distro-v2.3.1 -m "web-distro-v2.3.1"`). The tag MUST begin with our accepted tag prefix, corresponding to the library that is being released. See the section below for the full list of tag prefixes.
  - if you want to release both libraries, create two tags and push them both upstream.
- Push the tag upstream (this will kick off the release pipeline in CI) e.g. `git push origin web-distro-v2.3.1`
- The CI publish steps will create a draft GitHub release; wait for CircleCI to complete and then ensure the draft exists at https://github.com/honeycombio/honeycomb-opentelemetry-web/releases
- Click "generate release notes" in GitHub for full changelog notes and any new contributors
- Publish the GitHub draft release - if it is a prerelease (e.g., beta) click the prerelease checkbox.

## Available Tag Prefixes
We currently publish 2 packages from this repository. Each package is versioned separately, and may be released independently. We manage releases via git tags, and we use the following tags for each package:

| package                                        | tag                                           |
|------------------------------------------------|-----------------------------------------------|
| packages/honeycomb-opentelemetry-web           | `honeycomb-opentelemetry-web-vX.Y.Z`          |
| packages/experimental                          | `experimental-vX.Y.Z`                         |

note that the `X.Y.Z` at the end of each tag will be replaced with the version number for that package.
