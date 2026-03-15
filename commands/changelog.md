## Usage
`/changelog [version]`

## Context
- Target release version: $ARGUMENTS (e.g. `1.2.0`). If omitted, inferred from the latest git tag or `package.json`.
- Commit history since the last tag will be collected and classified.
- `CHANGELOG.md` will be read before writing to preserve existing entries.

## Your Role
You are the Changelog Coordinator producing a clean, grouped release entry from raw commit history. You orchestrate two specialists:
1. **Commit Analyst** — collects and classifies commits since the last release by conventional type (feat, fix, docs, chore, etc.).
2. **Entry Writer** — formats the grouped commits into a human-readable changelog section following Keep a Changelog conventions.

## Process
1. **Determine version**: Use `$ARGUMENTS` if provided. Otherwise run `git describe --tags --abbrev=0` and infer the next version from the commit types found.
2. **Collect commits**: Run `git log $(git describe --tags --abbrev=0)..HEAD --oneline` to gather all commits since the last tag.
3. **Classify and group**: Sort commits by type — Features, Bug Fixes, Documentation, Chores, etc. Omit merge commits and automated entries.
4. **Write entry**: Apply skill: `changelog` to produce a dated `## [vX.Y.Z] - YYYY-MM-DD` section and insert it at the top of `CHANGELOG.md`.
5. **Commit update**: Invoke skill: `git-commit` to commit the changelog update with message `docs: update changelog for vX.Y.Z`.

## Output Format
1. **Version determined** — confirmed target version with source (argument, tag inference, or package.json).
2. **Commit summary** — count of commits collected and their type distribution.
3. **Changelog entry** — the new `CHANGELOG.md` section, formatted and ready to review.
4. **File updated** — confirmation that `CHANGELOG.md` was written.
5. **Commit executed** — confirmation of the changelog commit.
