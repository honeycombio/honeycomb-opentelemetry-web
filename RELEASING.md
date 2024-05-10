# Releasing

- Checkout a new branch (ex. release-vX.Y.Z)
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
- Checkout `main` and fetch the now-updated `main` branch.
- Apply a tag for the new version on the merged commit (e.g. `git tag -a v2.3.1 -m "v2.3.1"`)
- Push the tag upstream (this will kick off the release pipeline in CI) e.g. `git push origin v2.3.1`
- The CI publish steps will create a draft GitHub release; wait for CircleCI to complete and then ensure the draft exists at https://github.com/honeycombio/honeycomb-opentelemetry-web/releases
- Click "generate release notes" in GitHub for full changelog notes and any new contributors
- Publish the GitHub draft release - if it is a prerelease (e.g., beta) click the prerelease checkbox.
