# Changelog Skill

Generates and maintains a structured `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and [Semantic Versioning](https://semver.org/).

## Usage

### Manual invocation

Say any of the following in a Claude Code session:

```
update the changelog
write release notes for v1.3.0
prepare the release
bump the version
/changelog
```

### As part of the release workflow

The `release` skill delegates to this skill automatically. You rarely need to invoke `changelog` directly when using `release`.

### After merging a PR (manual ritual)

After a PR is merged into main:

```
update the changelog — PR #42 was just merged
```

Claude reads `git log` since the last tag, classifies the commits, and writes the entry.

### Automated via GitHub Actions

To run after every merge to `main`, add `.github/workflows/changelog.yml`:

```yaml
name: Update changelog
on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  changelog:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: |
          claude -p "Update the changelog. The PR that was just merged: #${{ github.event.pull_request.number }} — ${{ github.event.pull_request.title }}"
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Requires the `claude` CLI and an `ANTHROPIC_API_KEY` repository secret.

## What the skill produces

| Output | Audience | When |
|---|---|---|
| `CHANGELOG.md` entry | Developers | Always |
| `RELEASES.md` / GitHub release body | End users | Public releases |
| `docs/migration/vX-to-vY.md` | API consumers | Breaking changes only |

## Workflow summary

1. **Gather commits** — `git log <last-tag>..HEAD` to collect unreleased changes
2. **Classify** — sort into `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`, `Security`
3. **Determine version** — MAJOR / MINOR / PATCH based on the nature of changes
4. **Update CHANGELOG.md** — promote `[Unreleased]` to a dated versioned section
5. **Release notes** (optional) — user-friendly prose summary for GitHub releases
6. **Migration guide** (MAJOR only) — `docs/migration/vX-to-vY.md` with before/after examples
7. **Commit** — via the `git-commit` skill with `chore: update changelog for vX.X.X`

## Semver quick reference

| Change type | Version bump | Example |
|---|---|---|
| Breaking API/behavior change | MAJOR | `1.3.0` → `2.0.0` |
| New backward-compatible feature | MINOR | `1.2.3` → `1.3.0` |
| Bug fix or security patch | PATCH | `1.2.3` → `1.2.4` |

## Collaborating skills

- **`release`** — orchestrates the full release sequence; invokes this skill as step 2
- **`git-commit`** — commits the updated `CHANGELOG.md`
- **`create-pr`** — opens a release PR after the changelog is updated
