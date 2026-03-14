---
name: refactor
description: "TDD-based code refactoring preserving behavior through tests. Use Red-Green-Refactor cycles to apply refactoring patterns one test-verified change at a time. **TRIGGERS**: 'clean up code', 'make code simpler', 'reduce complexity', 'refactor this', 'apply DRY', 'extract method', 'remove duplication'. **DISTINCT FROM**: Adding features (use /tdd) or fixing bugs. **PROACTIVE**: Auto-invoke when test-covered code has complexity (functions >50 lines, high cyclomatic complexity, duplication)."
author: mguinada
version: 2.0.0
tags: [refactoring, tdd, code-quality, simplification, clean-code]
---

# Refactor Skill

## Quick Reference

### Code Smells Reference

| Smell | Detection | Refactoring |
|-------|-----------|-------------|
| Long function | >20 lines | Extract Method |
| Duplicated code | Similar logic | Extract Method, Pull Up |
| Long parameter list | >3 params | Introduce Parameter Object |
| Large class | >10 methods | Extract Class |
| Feature envy | Method uses other class | Move Method |
| Switch statements | Type checking | Replace with Polymorphism |
| Speculative generality | Unused abstractions | Inline, Collapse Hierarchy |
| Message chains | a.b.c.d | Hide Delegate |
| Middle man | Excessive delegation | Remove Middle Man |
| Incomplete library class | Missing methods | Introduce Foreign Method |

### Process

```
1. VERIFY  - Tests exist and pass
2. ANALYZE - Identify code smells (see references/code-smells.md)
3. SELECT  - Choose appropriate pattern (see references/catalog.md)
4. APPLY   - One small step at a time
5. VERIFY  - Run tests after each change
6. REPEAT  - Until clean
```

## TDD Cycle

For each discrete refactoring:

```
🔴 RED    - If adding behavior, write failing test first
🟢 GREEN  - Make minimal changes to pass tests
🔵 REFACTOR - Apply pattern while keeping tests green
✅ VERIFY - Run tests, lint, type check
```

---

## Prerequisites

1. **Tests must exist** - If no tests, write them first
2. **Tests must pass** - Run tests before starting
3. **Understand the code** - Read and comprehend behavior

## Verification Commands

**Python:**
```bash
pytest              # Run tests
ruff check src/     # Lint
mypy src/           # Type check
```

**Ruby:**
```bash
rspec               # Run tests
rubocop             # Lint
steep check         # Type check (if using Steep)
```

---

## Refactoring Checklist

```markdown
- [ ] Function does one thing only (SRP)
- [ ] Function name clearly describes intent
- [ ] Function is 20 lines or fewer
- [ ] 3 or fewer parameters
- [ ] No duplicate code (DRY)
- [ ] If nesting is 2 levels or fewer
- [ ] No magic numbers
- [ ] Self-documenting code
- [ ] Tests pass
- [ ] Lint passes
- [ ] Type check passes
```

## Constraints

**MUST:**
- Write/run tests before refactoring
- Change one thing at a time
- Preserve behavior exactly

**MUST NOT:**
- Refactor + add features simultaneously
- Refactor without tests
- Batch multiple refactorings

---

## References

- **[Code Smells Guide](references/code-smells.md)** - Detection patterns and fixes for all code smells
- **[Refactoring Catalog](references/catalog.md)** - Complete catalog with Ruby/Python examples
- **[Advanced Patterns](references/patterns.md)** - SOLID refactorings, prompt patterns, functional patterns

## External Resources

- [Refactoring (Martin Fowler)](https://refactoring.com/)
- [Catalog of Refactorings](https://refactoring.com/catalog/)
- [Clean Code (Robert C. Martin)](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
