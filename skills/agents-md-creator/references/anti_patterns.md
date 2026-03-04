# Common Anti-Patterns

Real-world cases of what goes wrong when creating AGENTS.md files, and how to avoid them.

## Anti-Pattern 1: Line Count as Success Metric

### The Problem

Using "reduced lines" or percentage reduction as a measure of success.

### Why It's Wrong

- Shorter ≠ better, longer ≠ worse
- Drives wrong decisions (cutting useful info to meet numbers)
- Creates perverse incentives

### Real Example

**Wrong:**
> "Optimized AGENTS.md from 2,114 lines to ~580 lines — a 73% reduction!"

**Right:**
> "Reorganized AGENTS.md using progressive disclosure:
> - Eliminated duplication (same info in 3 places → 1 canonical source)
> - Moved low-frequency content to references (detailed SOPs)
> - Kept high-signal info in Level 1 (commands, errors, patterns)
> - No information was lost"

### Correct Metrics

| Metric | How to assess |
|--------|---------------|
| Single source of truth | Is any info duplicated? |
| Cognitive relevance | Is this info needed for most tasks? |
| Maintainability | Does changing this require updating elsewhere? |

---

## Anti-Pattern 2: References Without Trigger Conditions

### The Problem

Pointing to reference files without saying when or why to read them.

### Why It's Wrong

- LLM doesn't know when to load the reference
- Either ignores it or loads it unnecessarily
- Defeats the purpose of progressive disclosure

### Real Example

**Wrong:**
```markdown
See `docs/references/build-sop.md` for build configuration details.
```

**Right:**
```markdown
**📖 When to read `docs/references/build-sop.md`:**
- Build fails after dependency changes
- Need to add a new build task
- Troubleshooting cache issues

> Contains: dependency ordering, transit nodes, outputs configuration,
> common build errors and solutions.
```

---

## Anti-Pattern 3: Moving Code Patterns to Level 2

### The Problem

Moving frequently-used code examples to reference files.

### Why It's Wrong

- LLM needs to copy code directly
- Moving it forces re-derivation or extra file reads
- Negates the efficiency gain

### Real Example

**Wrong:**
```markdown
## Level 1 (AGENTS.md)
Use lazy loading for database connections.
See `docs/references/database.md` for implementation.

## Level 2 (references/database.md)
```javascript
let _Database = null;
function getDatabase() {
  if (!_Database) {
    _Database = require("better-sqlite3");
  }
  return _Database;
}
```
```

**Right:**
```markdown
## Level 1 (AGENTS.md)
```javascript
// ✅ Lazy loading pattern — always use this
let _Database = null;
function getDatabase() {
  if (!_Database) {
    _Database = require("better-sqlite3");
  }
  return _Database;
}
```

For database setup and migration guides, see `database-sop.md`.
```

---

## Anti-Pattern 4: Deleting Instead of Moving

### The Problem

Deleting content deemed "unimportant" rather than moving it to Level 2.

### Why It's Wrong

- Information is lost forever
- Future LLM interactions can't access it
- User may not realize what's missing

### Real Example

**Wrong:**
> "Deleted the Git workflow section — it's too detailed for AGENTS.md."

**Right:**
> "Moved Git workflow section to `docs/references/git-workflow.md`.
> Added trigger condition: 'When you need to commit, branch, or merge code'."

---

## Anti-Pattern 5: "Moving While Simplifying"

### The Problem

Moving content to Level 2 AND editing it at the same time.

### Why It's Wrong

- Simplification during move = deletion in disguise
- Hard to track what was actually removed
- User can't easily verify nothing was lost

### Real Incident (2026-02-14)

A 2503-line CLAUDE.md was being optimized. During the move to Level 2:

| Original Section | Original | Level 2 After "Move" | Actually Lost |
|------------------|----------|---------------------|---------------|
| Git workflow SOP | 560 lines | 342 lines | 218 lines |
| Feature docs | ~400 lines | 300 lines | ~100 lines |
| Namespace SOP | ~130 lines | Simplified to "rules" | ~80 lines |
| **Total** | **~1090 lines** | **~642 lines** | **~448 lines** |

**The problem:** The LLM reported "Successfully moved to Level 2" but had actually deleted ~40% of the content during the "move."

### Correct Process

**Step 1: Move (copy verbatim)**
```bash
# Copy original content exactly
cp original.md references/new-file.md
# Don't change a single word
```

**Step 2: Update Level 1**
```markdown
# Add reference with trigger
**📖 When to read `references/new-file.md`:**
- [specific trigger condition]
> Contains: [content summary]
```

**Step 3: (Optional) Simplify as separate step**
```markdown
# If simplification is needed:
# 1. List what you want to remove
# 2. Explain why for each item
# 3. Get user confirmation
# 4. Only THEN simplify
```

---

## Anti-Pattern 6: Missing Entry Points

### The Problem

Only having one way to discover Level 2 references.

### Why It's Wrong

- Different mental states need different entry points
- LLM attention is U-shaped (start/end strong, middle weak)
- Reduces discoverability

### Real Example

**Wrong:**
```markdown
## Reference Index (only at start)
| Trigger | Document |
|---------|----------|
| Error A | fix-a.md |
| Error B | fix-b.md |

[... long document ...]
```

**Right:**
```markdown
## Reference Index (start — for problems)
| Trigger | Document | Content |
|---------|----------|---------|
| Error A | fix-a.md | Solution steps |

[... content ...]

## Before Modifying Code (middle — for tasks)
| What you change | Read first | Gotcha |
|----------------|-----------|--------|
| Build config | build-sop.md | Order matters |

[... content ...]

## Reference Trigger Index (end — for re-orientation)
| When to read | Document |
|--------------|----------|
| Error A | fix-a.md |
| Error B | fix-b.md |
```

---

## Anti-Pattern 7: Missing Information Recording Principles

### The Problem

Optimizing AGENTS.md without adding rules for future additions.

### Why It's Wrong

- AGENTS.md will bloat again over time
- No guidance for what goes where
- LLM adds user requests without judgment

### Real Example

**Wrong:**
> "AGENTS.md is now optimized and well-structured!"

**Right:**
> "AGENTS.md is now optimized. Added 'Information Recording Principles' section
> at the top to guide future additions and prevent re-bloat."

### Include This Section

```markdown
## Information Recording Principles (Agents Must Read)

This document uses **progressive disclosure**.

### Level 1 contains:
- Core commands (run, test, build)
- Iron rules/prohibitions
- Error diagnostics (symptom → cause → fix)
- Code patterns (copyable blocks)
- Trigger indexes

### Level 2 contains:
- Detailed SOP flows
- Edge cases
- Complete examples
- Historical decisions

### When adding information:
1. High frequency? → Level 1
2. Low frequency but has trigger? → Level 2 + trigger in Level 1
3. No clear trigger and low frequency? → Consider not adding
```

---

## Anti-Pattern 8: Hardcoded Package Names

### The Problem

Assuming specific package names like `@repo/api` or `@repo/web`.

### Why It's Wrong

- Different projects use different naming conventions
- Backend could be `@repo/api`, `@repo/backend`, `apps/api`, `apps/backend`
- Forces users to edit every example

### Real Example

**Wrong:**
```markdown
| Package | Purpose | Commands |
|---------|---------|----------|
| @repo/web | Frontend | turbo run dev --filter=@repo/web |
| @repo/api | Backend | turbo run dev --filter=@repo/api |
```

**Right:**
```markdown
| Package | Location | Purpose | Commands |
|---------|----------|---------|----------|
| [detected-frontend] | apps/[dir] | Frontend app | turbo run dev --filter=[package] |
| [detected-backend] | apps/[dir] | Backend API | turbo run dev --filter=[package] |
```

Or even better, generate dynamically from actual package.json files.

---

## Anti-Pattern 9: Monorepo Assumptions

### The Problem

Treating all projects as monorepos or all as polyrepos.

### Why It's Wrong

- Polyrepo projects don't have `apps/` or `packages/`
- Monorepo projects need package-specific commands
- Wrong assumptions make documentation confusing

### Real Example

**Wrong (for polyrepo):**
```markdown
## Working with Packages
- Run task in specific package: turbo run <task> --filter=<package>
```

**Right (detect first):**
```markdown
# If monorepo detected:
## Working with Packages
- Run task in specific package: turbo run <task> --filter=<package>

# If polyrepo detected:
## Available Scripts
- npm run dev
- npm run build
- npm test
```

---

## Anti-Pattern 10: Over-Engineering Reference Structure

### The Problem

Creating too many Level 2 files for narrow topics.

### Why It's Wrong

- Too many files = harder to find things
- Each file needs proper trigger conditions
- Maintenance burden increases

### Real Example

**Wrong:**
```
docs/references/
├── build-dependency-order.md
├── build-outputs.md
├── build-env-vars.md
├── build-caching.md
└── build-errors.md
```

**Right:**
```
docs/references/
└── build.md  # Contains all build-related topics with sections
```

### Guideline

Group related topics. Split files only when:
- Topics are genuinely independent
- Different users would need different topics
- File would be >500 lines otherwise

---

## Quick Anti-Pattern Detection

Use this checklist to detect anti-patterns quickly:

| Check | Pass | Fail |
|-------|------|------|
| No line count statistics? | ✅ | ⚠️ |
| Every reference has trigger? | ✅ | ⚠️ |
| High-freq code in Level 1? | ✅ | ⚠️ |
| Multiple entry points? | ✅ | ⚠️ |
| Info recording principles present? | ✅ | ⚠️ |
| Package names are detected not hardcoded? | ✅ | ⚠️ |
- Project structure detected? | ✅ | ⚠️ |
- References reasonably grouped? | ✅ | ⚠️ |
