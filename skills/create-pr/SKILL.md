---
name: create-pr
description: "Creates GitHub pull requests with properly formatted titles, a body matching Sprolio's PR template, and appropriate type/scope labels. Automatically creates labels if they don't exist. Use when creating PRs, submitting changes for review, or when the user says /pr or asks to create a pull request. **PROACTIVE ACTIVATION**: Auto-invoke when a branch has commits ahead of main and the user signals the work is ready. **DETECTION**: Run git log origin/main..HEAD - if commits exist and user signals readiness, offer to open a PR. User says \"open a PR\", \"ready for review\", \"this is done\", \"let's merge\", \"submit this\". **USE CASES**: Feature or fix complete, user finished a series of commits and mentions review or merging."
allowed-tools: Bash(git:*), Bash(gh:*), Bash(gh pr:*), Bash(gh label:*), Read, Grep, Glob
---

# Create Pull Request

Creates GitHub PRs with conventional commit titles and a body that mirrors `.github/pull_request_template.md`.

## PR Title Format

```
<type>(<scope>): <summary>
```

### Types (required)

| Type       | Description                                      |
|------------|--------------------------------------------------|
| `feat`     | New feature                                      |
| `fix`       | Bug fix                                           |
| `perf`     | Performance improvement                          |
| `test`     | Adding/correcting tests                          |
| `docs`     | Documentation only                               |
| `refactor` | Code change (no bug fix or feature)               |
| `build`    | Build system or dependencies                     |
| `ci`       | CI configuration                                  |
| `chore`    | Routine tasks, maintenance                       |

### Scopes (optional but recommended)

- `backend` — Rails API (`apps/backend`)
- `web` — React frontend (`apps/web`)
- `types` — Shared TypeScript types (`packages/types`)
- `api` — Public API contract (serializers, endpoints)
- `infra` — Deployment, Docker, Kamal, CI
- `docs` — Documentation and strategy files

### Summary Rules

- Use imperative present tense: "Add" not "Added"
- Capitalize first letter
- No period at the end
- Add `!` before `:` for breaking changes (e.g. `feat(api)!: ...`)

## Steps

1. **Check current state**:
   ```bash
   git status
   git diff --stat
   git log origin/main..HEAD --oneline
   ```

2. **Analyze changes** to determine:
   - Type: What kind of change is this?
   - Scope: Which area is affected?
   - Summary: What does the change do?

3. **Push branch if needed**:
   ```bash
   git push -u origin HEAD
   ```

4. **Create PR** using gh CLI with title and body:
   ```bash
   gh pr create --title "<type>(<scope>): <summary>" --body "<body from template>"
   ```

5. **Assign labels** by parsing the PR title:
   - Extract `<type>` from the title
   - Extract `<scope>` if present in parentheses
   - Check for `!` prefix indicating breaking change
   - Create labels if they don't exist
   - Apply labels using `gh pr edit --add-labels`

   See `references/labels.md` for the complete implementation script.
   ```bash
   gh pr create --title "<type>(<scope>): <summary>" --body "$(cat <<'EOF'
   ## What

   <Describe the change concisely. What does this PR do and why?>

   ## Related issue

   <!-- Closes #123 / Fixes #123 / Resolves #123 -->

   ## Type of change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Refactor
   - [ ] Documentation
   - [ ] Infrastructure / tooling

   ## Testing

   <How was this tested? What cases were covered?>

   ## Checklist

   - [ ] Tests pass (`pnpm test`)
   - [ ] Types are up to date — if the Rails API response shape changed, `packages/types` was updated accordingly
   - [ ] No financial calculation logic was changed without corresponding test coverage
   - [ ] No new dependencies introduced without justification
   - [ ] Breaking changes are documented below (if any)

   ## Breaking changes

   <!-- List any breaking API contracts, renamed fields, removed endpoints, or behaviour changes. Leave blank if none. -->

   ## Regulatory / compliance notes

   <!-- Does this change affect data handling, tax calculations, user data storage, or anything with regulatory implications? Leave blank if not applicable. -->
   EOF
   )"
   ```

## Examples

### New backend feature
```
feat(backend): Add cost basis calculation for FIFO method
```

### Bug fix in shared types
```
fix(types): Correct PortfolioPosition return field type to decimal string
```

### Frontend improvement
```
feat(web): Add portfolio performance chart with time range selector
```

### Breaking API change
```
feat(api)!: Rename holdings endpoint response field cost_price to cost_basis
```

### Infra / tooling
```
chore(infra): Update Kamal deployment configuration for staging
```

### No scope (affects multiple areas)
```
chore: Upgrade pnpm and synchronise lockfile
```

## Validation

The PR title must match this pattern:
```
^(feat|fix|perf|test|docs|refactor|build|ci|chore|revert)(\([a-zA-Z0-9 ]+\))?!?: [A-Z].+[^.]$
```

Key rules:
- Type must be one of the allowed types
- Scope is optional but must be in parentheses if present
- `!` for breaking changes goes before the colon
- Summary must start with a capital letter
- Summary must not end with a period

## Labels

After creating the PR, assign labels based on the type and scope extracted from the PR title.

**Standard labels to apply:**
- **Type label** (from `<type>(<scope>):`): `feat`, `fix`, `perf`, `test`, `docs`, `refactor`, `build`, `ci`, `chore`
- **Scope label** (if scope present): `backend`, `web`, `types`, `api`, `infra`, `docs`
- **Special labels:** `breaking` (if `!` in title), `dependencies` (for dependency updates), `security` (for security fixes)

Create labels if they don't exist. See `references/labels.md` for complete color mapping and implementation script.

## Iron Rule

**The agentic coding assistant shall never merge to the main branch** — create pull requests only. Never use `gh pr merge`, `git merge`, or any command that directly merges to main. Pull requests are for human review and merging.
