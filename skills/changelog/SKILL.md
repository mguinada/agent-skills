---
name: changelog
description: "Generate and maintain a structured CHANGELOG.md following Keep a Changelog format and Semantic Versioning. Use when preparing a release, documenting version changes, writing release notes, or updating changelogs. **PROACTIVE ACTIVATION**: Invoke when user says 'update changelog', 'write release notes', 'bump version', 'prepare release', '/changelog', or after a `create-pr` is merged. **USE CASES**: Pre-release changelog updates, generating notes from git history since last tag, writing user-friendly release notes, documenting breaking changes with migration guides."
author: mguinada
version: 1.0.0
tags: [changelog, release-notes, versioning, semver, documentation, git]
---

# Changelog

## Collaborating skills

- **Git Commit**: skill: `git-commit` — commit the updated CHANGELOG.md with a conventional message
- **Create PR**: skill: `create-pr` — open a release PR after updating the changelog

## Workflow

### Step 1: Gather changes from git

```bash
# Find the last tag
git describe --tags --abbrev=0

# List commits since last tag (replace v1.2.0 with the tag found above)
git log v1.2.0..HEAD --oneline --no-merges

# See full commit messages for detail
git log v1.2.0..HEAD --no-merges --format="%h %s%n%b"
```

Read the commits and classify each into Keep a Changelog categories:
`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`

### Step 2: Determine the next version

```
MAJOR.MINOR.PATCH

MAJOR → breaking changes (existing API/behavior changes incompatibly)
MINOR → new backward-compatible features
PATCH → backward-compatible bug fixes and security patches
```

**Examples:**
- Bug fix only → `1.2.3` → `1.2.4`
- New feature → `1.2.4` → `1.3.0`
- Breaking change → `1.3.0` → `2.0.0`

### Step 3: Update CHANGELOG.md

Move the `[Unreleased]` section content into a new versioned section and add today's date.

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-03-15

### Added
- Dark mode support via CSS custom properties
- Export user data endpoint (GDPR compliance)

### Changed
- Dashboard query performance improved 40%

### Fixed
- Password reset email not sent when username contains special characters

### Security
- Updated dependencies (fixes CVE-2026-1234)

## [1.2.0] - 2026-01-10

### Added
- Two-factor authentication

[Unreleased]: https://github.com/owner/repo/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/owner/repo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/owner/repo/releases/tag/v1.2.0
```

**Rules:**
- Reverse chronological — latest version at the top
- ISO 8601 dates (`YYYY-MM-DD`)
- Write from the user's perspective, not from git commit messages verbatim
- Be specific — "Fix password reset for usernames with special characters", not "Bug fixes"
- Never copy git log messages directly into the changelog

### Step 4: Write release notes (optional)

For user-facing releases, produce a `RELEASES.md` or GitHub release body:

```markdown
## What's New in v1.3.0

### Dark Mode
You can now switch between light and dark themes in Settings > Appearance.

### Performance
Dashboard loads are 40% faster thanks to query optimizations.

## Bug Fixes
- Fixed password reset emails for usernames containing special characters

## Security
- Updated all dependencies to address CVE-2026-1234

## Breaking Changes
None in this release.

---
Full changelog: [CHANGELOG.md](CHANGELOG.md)
```

### Step 5: Document breaking changes

When `MAJOR` version bumps, create a migration guide at `docs/migration/vX-to-vY.md`:

```markdown
# Migration Guide: v1.x → v2.0

## Breaking Changes

### Authentication method changed

**Before (v1.x):**
```js
fetch('/api/users', {
  headers: { 'Authorization': 'Basic ' + btoa(user + ':' + pass) }
});
```

**After (v2.0):**
```js
const { token } = await fetch('/api/auth/login', { ... }).then(r => r.json());
fetch('/api/users', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```
```

---

## Output

| File | Audience | When |
|---|---|---|
| `CHANGELOG.md` | Developers | Always |
| `RELEASES.md` / GitHub release | End users | Public releases |
| `docs/migration/vX-to-vY.md` | API consumers | Breaking changes only |

---

## Checklist

- [ ] Commits since last tag collected and classified
- [ ] Version number determined (MAJOR/MINOR/PATCH)
- [ ] `[Unreleased]` section promoted to versioned entry with today's date
- [ ] Comparison links updated at the bottom of CHANGELOG.md
- [ ] Entries written from user perspective (not raw git log)
- [ ] Breaking changes have migration guide
- [ ] CHANGELOG.md committed via `git-commit` skill
