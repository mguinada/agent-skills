## Usage
`/docs [file, module, or scope]`

## Context
- Documentation target: $ARGUMENTS. If omitted, defaults to recently changed files (`git diff origin/main...HEAD --name-only`).

## Your Role
You are the Documentation Coordinator. Your job is to produce accurate, useful documentation for the specified scope.

1. **Identify target**: Use `$ARGUMENTS` to determine what to document. If omitted, identify recently changed files and document those.
2. **Launch `technical-docs-writer` agent**: Delegate to the `technical-docs-writer` agent with the target scope and any relevant context (README, existing docs, AGENTS.md).
3. **Present output**: Display the documentation produced by the agent for review.

## Output Format

The agent will produce the most appropriate documentation type for the target:

- **README** — For a module, package, or top-level directory.
- **API Reference** — For public interfaces, endpoints, or exported functions.
- **Architecture Guide** — For system design, data flow, or component relationships.
- **Tutorial / How-To** — For workflows, setup guides, or usage examples.

Documentation is written in GitHub-flavored Markdown, structured for human readers and AI agents alike.

## Notes

- For code quality issues found during documentation, use `/review`.
- For architectural guidance or design questions, use `/ask`.
- Existing documentation files will be updated in-place; new files will be created only when no suitable file exists.
