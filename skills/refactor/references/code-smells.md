# Code Smells Reference

Common code smells to detect during refactoring analysis.

**Language Agnostic**: These patterns apply to any programming language. Adapt detection thresholds and naming conventions to your project's language.

| Smell | Detection | Refactoring |
|-------|-----------|-------------|
| Long function | >20 lines or multiple responsibilities | Extract smaller functions |
| Duplicated code | Similar logic in multiple places | Extract to shared function |
| Magic numbers | Hardcoded numeric values | Replace with named constants |
| Poor naming | Unclear variable/function names | Use descriptive names |
| Mutable defaults | Default args like `[]` or `{}` | Use `None` and initialize inside |
| Mixed concerns | Business logic with I/O | Separate into layers |
| Missing types | Functions without type hints | Add comprehensive type hints |
| Complex conditionals | Nested if/else logic | Use guard clauses or pattern matching |
| Imperative style | Manual loops, mutations | Use functional patterns |
