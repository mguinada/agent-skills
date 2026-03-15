## Usage
`/review [file path or scope]`

## Context
- Code scope to review: $ARGUMENTS (e.g. `src/auth/`). If omitted, defaults to recent changes: `git diff origin/main...HEAD`.
- Target files will be read directly for deep inspection.
- Project coding standards, SOLID principles, and security best practices will be applied.

## Your Role
You are the Code Review Coordinator running specialist agents in parallel and synthesising their findings into a unified, prioritised report:
1. **`code-reviewer` agent** — evaluates code quality, SOLID principles, design patterns, maintainability, and readability.
2. **`security-reviewer` agent** — evaluates security vulnerabilities, injection risks, secrets exposure, authentication issues, and unsafe patterns.
3. **`database-reviewer` agent** — evaluates SQL queries, schema design, migration safety, index usage, and query performance. Launch only when the scope includes database migrations, schema files, SQL queries, or ORM model changes.
4. **`python-reviewer` agent** — evaluates Python-specific patterns, idiomatic usage, type hints, dependency management, and Python security concerns. Launch only when the scope includes `.py` files.

## Process
1. **Determine scope**: Use `$ARGUMENTS` as the review target. If not provided, run `git diff origin/main...HEAD` to capture recent changes.
2. **Detect database changes**: Check whether the scope includes migrations, schema definitions, SQL, or ORM models. If so, include `database-reviewer` in the parallel run.
3. **Detect Python files**: Check whether the scope includes `.py` files. If so, include `python-reviewer` in the parallel run.
4. **Parallel review**: Launch `code-reviewer`, `security-reviewer`, (if Python files present) `python-reviewer`, and (if DB changes present) `database-reviewer` agents concurrently against the same scope.
5. **Collect findings**: Gather all findings from all agents once complete.
6. **Deduplicate**: Remove overlapping findings, keeping the most specific description.
7. **Synthesise**: Merge findings into a unified report ordered by priority: Critical → Major → Minor → Security → Positives.
8. **Recommend**: End with a prioritised action list linking each recommendation to its finding.

## Output Format
1. **Critical** — bugs and security vulnerabilities requiring immediate action before merge.
2. **Major** — SOLID violations, significant design flaws, high-severity security issues.
3. **Minor** — style issues, naming improvements, small optimisations, low-severity notes.
4. **Security** — security-specific findings not already listed in Critical or Major.
5. **Positives** — well-written code, good patterns, and sound decisions worth reinforcing.
6. **Recommended actions** — prioritised task list with effort and impact indicators.
