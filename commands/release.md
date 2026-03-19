## Usage
`/release [version]`

## Context
- Target release version: $ARGUMENTS (e.g. `1.2.0`). Required for a clean release; will prompt if omitted.
- Working tree, test suite, and branch state will be validated before any changes are made.
- `CHANGELOG.md`, `package.json` (or equivalent manifest), and git tags will all be updated.

## Your Role
You are the Release Coordinator. Capture the target version from `$ARGUMENTS` (prompt if omitted), then delegate the full release sequence to the skill.

## Process
1. **Pre-flight gate**: Verify clean working tree, passing tests, and branch up-to-date with `main`. Abort immediately if any check fails.
2. **Release**: Apply skill: `release` with the target version to execute the complete release sequence (changelog, version bump, commit, tag, push, GitHub release).

## Output Format
1. **Pre-flight report** — pass/fail status for each readiness check.
2. **Release summary** — version released, tag created, and GitHub release URL.

**Do not merge branches. Do not skip pre-flight checks.**
