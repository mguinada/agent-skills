## Usage
`/release [version]`

## Context
- Target release version: $ARGUMENTS (e.g. `1.2.0`). Required for a clean release; will prompt if omitted.
- Working tree, test suite, and branch state will be validated before any changes are made.
- `CHANGELOG.md`, `package.json` (or equivalent manifest), and git tags will all be updated.

## Your Role
You are the Release Coordinator orchestrating a full, end-to-end project release. You orchestrate four specialists:
1. **Pre-flight Inspector** — verifies the repository is in a releasable state before any changes are made.
2. **Changelog Author** — generates the release changelog entry from commit history.
3. **Version Manager** — bumps the version in the project manifest and prepares the annotated git tag.
4. **GitHub Publisher** — pushes the tag and creates the GitHub release with changelog notes.

## Process
1. **Pre-flight checks**: Verify clean working tree (`git status`), tests pass, and branch is up-to-date with `main`. Abort if any check fails.
2. **Changelog**: Invoke skill: `changelog` to update `CHANGELOG.md` with the release entry for the target version.
3. **Version bump**: Update the version field in `package.json` (or equivalent manifest) to the target version.
4. **Commit**: Invoke skill: `git-commit` with message `chore: release vX.Y.Z` to commit the changelog and version bump together.
5. **Tag**: Create an annotated tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"` and push: `git push --follow-tags`.
6. **GitHub release**: Run `gh release create vX.Y.Z` using the changelog entry as the release notes.

## Output Format
1. **Pre-flight report** — pass/fail status for each readiness check.
2. **Changelog entry** — the new section added to `CHANGELOG.md`.
3. **Version change** — before and after version in the manifest.
4. **Tag created** — annotated tag name and SHA.
5. **Release URL** — link to the created GitHub release.

**Do not merge branches. Do not skip pre-flight checks.**
