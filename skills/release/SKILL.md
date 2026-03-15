---
name: release
description: "Orchestrates a complete software release: pre-flight checks, changelog update, version bump, git tag, and GitHub release. Use when cutting a release, tagging a version, or publishing a new version of the project. **PROACTIVE ACTIVATION**: Invoke when user says 'release', 'cut a release', 'tag a release', 'ship v1.x', 'publish version', or '/release'. **USE CASES**: Tagging main after a sprint, releasing a library version, preparing a versioned deployment."
author: mguinada
version: 1.0.0
tags: [release, git, versioning, changelog, github, semver]
---

# Release

## Collaborating skills

- **Changelog**: skill: `changelog` — classify commits, determine version bump, write CHANGELOG.md entry
- **Git Commit**: skill: `git-commit` — commit the release changes with a conventional message
- **Create PR**: skill: `create-pr` — open a release PR after updating the changelog

## Overview

A release is a sequence of discrete steps. Complete each one before moving to the next, and confirm with the user before pushing anything to the remote.

---

## Step 1: Pre-flight checks

Verify the repository is in a clean, releasable state:

```bash
# Must be on main (or the designated release branch)
git branch --show-current

# Working tree must be clean
git status

# Must be up to date with remote
git fetch origin
git log HEAD..origin/main --oneline   # should be empty

# Show commits since last tag (what will be released)
git describe --tags --abbrev=0        # last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline --no-merges
```

**Stop if:**
- Not on the main branch
- Uncommitted changes exist
- Local branch is behind remote — pull first

---

## Step 2: Determine version and update changelog

Invoke the `changelog` skill here. It will:
- Read commits since the last tag
- Classify them into Added / Changed / Fixed / Security / etc.
- Propose the next semver version (MAJOR / MINOR / PATCH)
- Write the new versioned section in `CHANGELOG.md`

Confirm the proposed version and changelog content with the user before continuing.

---

## Step 3: Update version in project files

After confirming the version, update the version string wherever the project declares it.

**Detect which files to update:**

```bash
# Common version files — check which exist
ls package.json pyproject.toml Cargo.toml mix.exs version.rb VERSION 2>/dev/null
```

Update the version field in whichever files are present:

```bash
# Node.js / npm
npm version <new-version> --no-git-tag-version

# Or edit manually for other ecosystems
# Python: pyproject.toml → [project] version = "x.x.x"
# Ruby gem: version.rb → VERSION = "x.x.x"
# Plain file: echo "x.x.x" > VERSION
```

---

## Step 4: Commit release changes

Use the `git-commit` skill with a conventional release commit:

```bash
git add CHANGELOG.md package.json   # (and any other version files updated)
git commit -m "chore: release vX.X.X"
```

---

## Step 5: Create and push the git tag

```bash
# Annotated tag with the changelog entry as the message
git tag -a vX.X.X -m "Release vX.X.X"

# Review what will be pushed
git log --oneline -3
git tag -l "vX.X.X"
```

**Confirm with the user before pushing.**

```bash
# Push commit and tag together
git push origin main
git push origin vX.X.X
```

---

## Step 6: Create GitHub release

Extract the changelog entry for this version to use as the release body:

```bash
# Show the section for this version from CHANGELOG.md
awk '/^## \[X\.X\.X\]/,/^## \[/' CHANGELOG.md | head -n -1
```

Create the release:

```bash
gh release create vX.X.X \
  --title "vX.X.X" \
  --notes "$(awk '/^## \[X\.X\.X\]/,/^## \[/' CHANGELOG.md | head -n -1)"
```

For a pre-release:
```bash
gh release create vX.X.X --prerelease --title "vX.X.X (pre-release)" --notes "..."
```

---

## Step 7: Post-release (project-specific)

Depending on the project, additional publish steps may be needed. Check and run only what applies:

```bash
# npm package
npm publish

# Python package
uv build && uv publish

# Ruby gem
gem build *.gemspec && gem push *.gem
```

These are opt-in — only run if the project is a published package.

---

## Full sequence summary

| Step | Action | Requires confirmation |
|---|---|---|
| 1 | Pre-flight checks | — |
| 2 | Changelog + version decision | Yes — confirm version |
| 3 | Update version files | — |
| 4 | Commit release changes | — |
| 5 | Tag + push | Yes — before pushing |
| 6 | GitHub release | Yes — review release notes |
| 7 | Publish (if applicable) | Yes |

---

## Checklist

- [ ] On main branch, working tree clean, up to date with remote
- [ ] Commits since last tag reviewed
- [ ] Version confirmed (MAJOR / MINOR / PATCH)
- [ ] CHANGELOG.md updated with dated versioned section
- [ ] Version files updated (`package.json`, etc.)
- [ ] Release commit created: `chore: release vX.X.X`
- [ ] Annotated tag created: `git tag -a vX.X.X`
- [ ] Commit and tag pushed to remote
- [ ] GitHub release created with changelog notes
- [ ] Package published (if applicable)
