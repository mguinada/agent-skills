# Progressive Disclosure for AGENTS.md

Deep dive on progressive disclosure principles and implementation for AI documentation.

## What is Progressive Disclosure?

Progressive disclosure is a pattern that loads information in phases rather than all at once. For AI documentation, this means:

1. **Level 1 (AGENTS.md):** Always loaded, minimal, high-signal
2. **Level 2 (docs/references/):** On-demand, detailed, comprehensive
3. **Level 3 (Project files):** As-needed, canonical sources

This prevents context bloat while maintaining full access to project knowledge.

## Why Progressive Disclosure Matters

### The Problem: Context Window Limits

- AGENTS.md is loaded on **every interaction**
- Every token in AGENTS.md consumes context that could be used for actual work
- Bloated AGENTS.md causes:
  - Diluted attention (model overwhelmed by irrelevant info)
  - Token waste (paying for content not used in this session)
  - Pattern conflation (confusion across domains)

### The Solution: Three-Level Loading

| Level | When Loaded | Content | Size Target |
|-------|-------------|---------|-------------|
| 1: AGENTS.md | Every interaction | Essential commands, structure, pointers | <500 lines |
| 2: references/ | When referenced | Detailed SOPs, edge cases | Unlimited |
| 3: Project files | As needed | README, configs, source | Canonical |

**Result:** ~93% reduction in context usage while maintaining access to all information.

## Content Classification Framework

### The Decision Tree

For each piece of information, ask:

```
Is this HIGH-FREQUENCY use?
├─ Yes → Keep in Level 1
└─ No → Continue ↓

Is the violation consequence SEVERE?
├─ Yes → Keep in Level 1
└─ No → Continue ↓

Is there a CODE PATTERN to copy?
├─ Yes → Keep the pattern in Level 1
└─ No → Continue ↓

Is there a CLEAR TRIGGER condition?
├─ Yes → Move to Level 2 + add trigger to Level 1
└─ No → Consider deleting or consolidating
```

### Level 1 Content Types

| Type | Example | Why in Level 1 |
|------|---------|----------------|
| **Core commands** | `npm run dev`, `npm test` | Used in every session |
| **Iron rules/prohibitions** | "Must use lazy loading" | Violation causes severe issues |
| **Error diagnostics** | Complete symptom→cause→fix | Needed when problems occur |
| **Code patterns** | Copyable code blocks | Avoids re-derivation |
| **Directory mapping** | Function → file | Quick navigation |
| **Trigger indexes** | Pointers to Level 2 | Enables discovery |

### Level 2 Content Types

| Type | Example | Why in Level 2 |
|------|---------|----------------|
| **Detailed SOPs** | 20-step process guide | Low frequency, clear trigger |
| **Edge cases** | Rare error scenarios | Specific situations |
| **Complete examples** | All config options | Reference material |
| **Historical decisions** | Why X was chosen | Context, not action |

## Multi-Entry Principle

The same Level 2 resource can have **multiple entry points**. This is NOT duplication.

### Three Entry Points

| Entry | Location | User Mindset | Example |
|-------|----------|--------------|---------|
| **Problem index** | Document start | "I have an error" | "Build fails → read build-sop.md" |
| **Task index** | Document middle | "I'm about to change X" | "Changing build config → read build-sop.md" |
| **Re-orientation** | Document end | "Long conversation" | "Which doc was that?" |

**Why this works:** LLM attention is U-shaped — strongest at start and end. Multiple entries serve different discovery paths.

### Reference Table Formats

**1. Problem-Oriented (Start of document):**

```markdown
## Reference Index (When you encounter problems)

| Trigger scenario | Document | Core content |
|------------------|----------|--------------|
| Build fails after dependency change | build-sop.md | Dependency order |
| Cache not invalidating | caching.md | outputs, inputs, env |
```

**2. Task-Oriented (Middle of document):**

```markdown
## Before Modifying Code

| What you're changing | Read this first | Key gotchas |
|---------------------|-----------------|-------------|
| Build configuration | build-sop.md | dependsOn order |
| Cache behavior | caching.md | outputs required |
```

**3. Re-orientation (End of document):**

```markdown
## Reference Trigger Index

| When to read | Document | What you'll find |
|--------------|----------|------------------|
| Build issues | build-sop.md | Troubleshooting |
| Cache issues | caching.md | Hash debugging |
```

## Reference Format Guidelines

### Detailed Format (For important references)

```markdown
**📖 When to read `docs/references/build-sop.md`:**
- Build fails after dependency changes
- Need to add new build task
- Caching issues related to builds

> Contains: dependency ordering, transit nodes, outputs configuration,
> common build errors and solutions.
```

### Inline Format (For quick references)

```markdown
Complete migration guide in `docs/references/migration.md` (database backup, rollback steps).
```

### Key Requirements

1. **Trigger condition** — When should this be read?
2. **Content summary** — What will be found there?
3. **Clear path** — Relative path from AGENTS.md

## Anti-Patterns to Avoid

### ⚠️ Anti-Pattern 1: Line Count as Success Metric

**Wrong:**
- "Reduced from 2000 lines to 500 lines!"
- "Cut 75% of the content!"

**Right:**
- Assess by information quality
- Single source of truth (no duplication)
- Cognitive relevance (is it needed for this task?)
- Maintainability (change once, not everywhere)

### ⚠️ Anti-Pattern 2: References Without Triggers

**Wrong:**
```markdown
See build-sop.md for build configuration.
```

**Right:**
```markdown
**📖 When to read `build-sop.md`:**
- Configuring build tasks
- Build fails after dependency changes
> Contains: dependsOn patterns, outputs setup, troubleshooting
```

### ⚠️ Anti-Pattern 3: Moving Code Patterns to Level 2

**Wrong:** Move frequently-used code examples to references

**Right:** Keep high-frequency code patterns in Level 1

The LLM needs to directly copy code. Moving it forces re-derivation or extra reads.

### ⚠️ Anti-Pattern 4: Deleting Instead of Moving

**Wrong:** Delete "unimportant" sections

**Right:** Move to Level 2, keep trigger in Level 1

### ⚠️ Anti-Pattern 5: "Moving While Simplifying"

**CRITICAL:** Moving content AND editing it simultaneously IS deletion in disguise.

**Correct Process:**
1. Move first — copy verbatim, don't change a word
2. If simplification is needed, do it as a separate step
3. Get user confirmation for any deletions

"Since we're changing it, let's simplify" is the most dangerous anti-pattern.

## Information Recording Principles

Include this in AGENTS.md to prevent future bloat:

```markdown
## Information Recording Principles (Agents Must Read)

This document uses **progressive disclosure** to optimize agent effectiveness.

### Level 1 (This file) contains only

| Type | Example |
|------|---------|
| Core commands | `npm run dev`, `npm test` |
| Iron rules/prohibitions | Must use lazy loading |
| Common error diagnostics | Symptom → cause → fix |
| Code patterns | Directly copyable code blocks |
| Directory navigation | Function → file mapping |
| Trigger index tables | Pointers to Level 2 |

### Level 2 (docs/references/) contains

| Type | Example |
|------|---------|
| Detailed SOP flows | Complete step-by-step guides |
| Edge case handling | Rare error diagnostics |
| Complete config examples | All parameter descriptions |
| Historical decisions | Design rationale |

### When recording information

1. **Assess frequency:** High frequency → Level 1, otherwise Level 2
2. **Level 1 references Level 2 must include:**
   - Trigger condition (when to read)
   - Content summary (what you'll find)
3. **Never:**
   - Place low-frequency detailed flows in Level 1
   - Reference Level 2 without trigger conditions
```

## Verification Checklist

After creating or modifying AGENTS.md:

### Information Completeness (Most Important)

- [ ] Every section has a home (Level 1, Level 2, or canonical source)
- [ ] Level 2 files match original content exactly
- [ ] No content was silently deleted
- [ ] No line count statistics mentioned

### Structure Quality

- [ ] Reference index at document start
- [ ] Core commands table complete
- [ ] Iron rules/prohibitions with code examples
- [ ] Common error diagnostics (complete flow)
- [ ] Code patterns directly copyable
- [ ] Directory mapping (function → file)
- [ ] "Before modifying code" table
- [ ] Reference trigger index at document end
- [ ] Every Level 2 reference has trigger conditions
- [ ] All referenced files exist

## Sign Assessment

### Signals Information is INSUFFICIENT

| Signal | Cause | Fix |
|--------|-------|-----|
| LLM repeatedly asks same questions | Missing key rules | Add to Level 1 |
| LLM re-derives code patterns each time | Missing patterns | Add to Level 1 |
| User repeatedly reminds rules | Rules not emphasized | Add to Level 1 with emphasis |
| LLM doesn't know which Level 2 to read | Missing triggers | Add trigger conditions |

### Signals Information is EXCESSIVE

| Signal | Cause | Fix |
|--------|-------|-----|
| Large low-frequency sections in Level 1 | Wrong level | Move to Level 2 |
| Same content in multiple places | Duplication | Consolidate |
| Edge cases mixed with common cases | No separation | Separate by frequency |

## Token Budget Summary

| Level | Content | When | Per File | Total |
|-------|---------|------|----------|-------|
| 1: AGENTS.md | Essential info | Always | <5000 tokens | ~5K |
| 2: references/ | Detailed docs | On demand | Variable | ~5-10K |
| 3: Project files | Canonical | As needed | Variable | As needed |

**Key insight:** Level 1 is always loaded, keep it minimal. Levels 2-3 are loaded only when needed.
