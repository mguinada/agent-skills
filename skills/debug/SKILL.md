---
name: debug
description: "Systematic bug investigation using a root-cause-first methodology. Use PROACTIVELY when encountering any bug, test failure, unexpected behavior, or performance problem—before proposing any fix. **PROACTIVE ACTIVATION**: Invoke immediately when the user shares an error message, stack trace, failing test, or says something is 'broken', 'not working', or 'acting weird'. **USE CASES**: Reproducing errors, tracing failures in multi-component systems, debugging flaky tests, diagnosing performance regressions, investigating unexpected output."
author: mguinada
version: 1.0.0
tags: [debugging, bug-fix, root-cause, testing, troubleshooting]
---

# Debug

## Collaborating skills

- **TDD**: skill: `tdd` — write a failing test to pin down the bug before fixing (Phase 4)
- **Refactor**: skill: `refactor` — clean up code after the bug is confirmed fixed

## The Core Principle

Random fixes waste time and create new bugs. Find the root cause before touching any code.

> **Never propose a fix without completing Phase 1.** Symptoms are not root causes.

---

## The Four Phases

Complete each phase before moving to the next.

### Phase 1: Root Cause Investigation

**Before writing a single line of fix:**

1. **Read error messages carefully** — don't skim past stack traces. Note file paths, line numbers, error codes. They often contain the exact answer.

2. **Reproduce consistently** — can you trigger it reliably? If not, gather more data first. Never fix something you can't reproduce.

3. **Check recent changes** — `git diff`, recent commits, new dependencies, config changes. Most bugs have a recent cause.

4. **Gather evidence in multi-component systems** — when the system has multiple layers (API → service → DB, CI → build → deploy), add diagnostic instrumentation at each boundary *before* guessing which layer is broken:

```bash
# Example: trace an env var through layers
echo "=== Layer 1: Workflow ==="
echo "SECRET: ${SECRET:+SET}${SECRET:-UNSET}"

echo "=== Layer 2: Build script ==="
env | grep SECRET || echo "SECRET not in environment"

echo "=== Layer 3: Runtime ==="
printenv | grep -i secret
```

Run once to see *where* it breaks, then investigate that specific layer.

5. **Trace data flow** — for errors deep in a call stack, trace backward: where does the bad value come from? What called this with that value? Keep tracing up until you find the origin. Fix at the source.

   See `references/root-cause-tracing.md` for the complete backward tracing technique.

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. Locate similar working code in the same codebase — what works that resembles what's broken?
2. If implementing a known pattern, read the reference implementation completely. Don't skim.
3. List every difference between working and broken, however small. Don't assume something "can't matter."
4. Understand all dependencies: config, environment, state assumptions.

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form one hypothesis** — state it clearly: "I think X is the root cause because Y." Write it down. Be specific.
2. **Test minimally** — make the smallest possible change to test the hypothesis. One variable at a time.
3. **Verify before continuing** — did it work? Yes → Phase 4. No → form a *new* hypothesis. Don't stack fixes on top of each other.
4. **When you don't know** — say so. Research more. Ask for help. Don't pretend to understand.

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Write a failing test first** — use the `tdd` skill to write the simplest test that reproduces the bug. This test must fail before you fix anything.

2. **Implement one fix** — address the root cause identified in Phase 1. One change. No "while I'm here" improvements.

3. **Verify** — test passes, no other tests broken, issue actually resolved.

4. **If the fix doesn't work** — STOP. Count fixes attempted:
   - Under 3 attempts: return to Phase 1 with new information
   - 3 or more attempts: question the architecture (see below)

**3+ fixes failed? Question the architecture.**

When each fix reveals a new problem in a different place, or fixes require massive refactoring, you're likely treating symptoms of a structural problem. Stop and discuss with the user before attempting another fix.

---

## Red Flags — Return to Phase 1

Catch yourself thinking any of these? Stop and restart from Phase 1:

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "It's probably X, let me fix that" (without tracing)
- "Add multiple changes, run tests"
- "I don't fully understand but this might work"
- "One more fix attempt" (when 2+ already tried)
- Each fix reveals a new problem in a different place

---

## Common Pitfalls

| Temptation | Reality |
|---|---|
| "Issue is simple, skip the process" | Simple bugs have root causes too. Process is fast for simple bugs. |
| "Emergency, no time" | Systematic debugging is faster than guess-and-check thrashing. |
| "Multiple fixes saves time" | Can't isolate what worked. Creates new bugs. |
| "I'll write the test after" | Untested fixes don't stick. Test first proves the fix. |
| "Reference is long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |

---

## Quick Reference

| Phase | Goal | Gate |
|---|---|---|
| **1. Root Cause** | Read errors, reproduce, trace data flow | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify all differences |
| **3. Hypothesis** | Form theory, test one change | Confirmed root cause |
| **4. Implementation** | Write test, apply fix, verify | Tests pass, bug gone |

---

## Supporting Techniques

- `references/root-cause-tracing.md` — trace bugs backward through the call stack
- `references/defense-in-depth.md` — add validation at multiple layers after finding root cause
