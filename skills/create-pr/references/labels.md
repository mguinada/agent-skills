# GitHub Labels for Sprolio PRs

This document defines the standard labels applied to pull requests and provides the implementation script for creating and assigning them.

## Label Definitions

### Type Labels (from Conventional Commits)

| Label | Color | Description |
|-------|-------|-------------|
| `feat` | `#fbca04` (yellow) | New feature |
| `fix` | `#d73a4a` (red) | Bug fix |
| `perf` | `#5319e7` (purple) | Performance improvement |
| `test` | `#0075ca` (blue) | Adding or correcting tests |
| `docs` | `#0075ca` (blue) | Documentation only |
| `refactor` | `#768390` (gray) | Code change (no bug/feature) |
| `build` | `#768390` (gray) | Build system or dependencies |
| `ci` | `#0e8a16` (green) | CI configuration |
| `chore` | `#768390` (gray) | Routine tasks, maintenance |

### Scope Labels

| Label | Description |
|-------|-------------|
| `backend` | Rails API changes (`apps/backend`) |
| `web` | React frontend changes (`apps/web`) |
| `types` | Shared TypeScript types (`packages/types`) |
| `api` | Public API contract changes |
| `infra` | Deployment, Docker, Kamal, CI |
| `docs` | Documentation and strategy files |

### Special Labels

| Label | Color | Description |
|-------|-------|-------------|
| `breaking` | `#ff0000` (bright red) | Breaking changes |
| `dependencies` | `#0366d6` (dark blue) | Dependency updates |
| `security` | `#ee0701` (dark red) | Security-related changes |

## Implementation Script

```bash
#!/bin/bash
# Label assignment script for Sprolio PRs
# Run this after creating a PR to assign appropriate labels

set -e

# Get PR number and title
PR_NUMBER=$(gh pr view --json number -q .number)
TITLE=$(gh pr view --json title -q .title)

echo "Processing PR #$PR_NUMBER: $TITLE"

# Parse type (before : or !:)
if [[ "$TITLE" =~ ^([a-z]+)!?: ]]; then
  TYPE="${BASH_REMATCH[1]}"
else
  echo "Warning: Could not parse type from title: $TITLE"
  TYPE="chore"  # Default fallback
fi

# Check for breaking change
BREAKING=false
if [[ "$TITLE" =~ !: ]]; then
  BREAKING=true
  echo "Breaking change detected"
fi

# Parse scope (in parentheses after type)
SCOPE=""
if [[ "$TITLE" =~ \(([a-z]+)\) ]]; then
  SCOPE="${BASH_REMATCH[1]}"
  echo "Scope detected: $SCOPE"
fi

# Ensure a label exists, creating it with color if missing
ensure_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  if ! gh label list "$name" >/dev/null 2>&1; then
    echo "Creating label: $name"
    gh label create "$name" \
      --color "$color" \
      --description "$description" \
      2>/dev/null || echo "Label $name already exists"
  fi
}

# Ensure type label exists with appropriate color
case "$TYPE" in
  feat)
    ensure_label "feat" "fbca04" "New feature"
    ;;
  fix)
    ensure_label "fix" "d73a4a" "Bug fix"
    ;;
  perf)
    ensure_label "perf" "5319e7" "Performance improvement"
    ;;
  test)
    ensure_label "test" "0075ca" "Adding or correcting tests"
    ;;
  docs)
    ensure_label "docs" "0075ca" "Documentation only"
    ;;
  refactor)
    ensure_label "refactor" "768390" "Code refactoring"
    ;;
  build)
    ensure_label "build" "768390" "Build system or dependencies"
    ;;
  ci)
    ensure_label "ci" "0e8a16" "CI configuration"
    ;;
  chore)
    ensure_label "chore" "768390" "Routine tasks, maintenance"
    ;;
esac

# Ensure special labels
ensure_label "breaking" "ff0000" "Breaking changes"
ensure_label "dependencies" "0366d6" "Dependency updates"
ensure_label "security" "ee0701" "Security-related changes"

# Build labels array
LABELS=("$TYPE")

# Add scope label if present
if [[ -n "$SCOPE" ]]; then
  # Validate scope against allowed values
  case "$SCOPE" in
    backend|web|types|api|infra|docs)
      LABELS+=("$SCOPE")
      ;;
    *)
      echo "Warning: Unknown scope '$SCOPE' - not applying as label"
      ;;
  esac
fi

# Add breaking label if applicable
if [[ "$BREAKING" == true ]]; then
  LABELS+=("breaking")
fi

# Apply labels (comma-separated)
echo "Applying labels: ${LABELS[*]}"
gh pr edit "$PR_NUMBER" --add-labels "$(IFS=,; echo "${LABELS[*]}")"

echo "✓ Labels applied to PR #$PR_NUMBER"
```

## One-Liner Version

For quick use inline with `gh pr create`:

```bash
# After creating PR, extract type and apply label
PR_NUM=$(gh pr view --json number -q .number)
TYPE=$(gh pr view --json title -q .title | sed -E 's/^([a-z]+).*/\1/')
gh label create "$TYPE" --color "fbca04" 2>/dev/null || true
gh pr edit "$PR_NUM" --add-labels "$TYPE"
```

## Quick Reference: gh Label Commands

```bash
# List all labels
gh label list

# Create a label
gh label create <name> --color <hex> --description "<text>"

# Add label to current PR
gh pr edit --add-labels <label1,label2>

# Remove label from current PR
gh pr edit --remove-labels <label>
```
