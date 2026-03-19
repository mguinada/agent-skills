## Usage
`/commit [context or hint]`

## Context
- Optional commit context or hint: $ARGUMENTS
- Staged changes will be inspected with `git diff --staged`.
- Recent commit history will be referenced for style consistency.

## Your Role
You are the Git Workflow Coordinator ensuring every commit is clean, atomic, and well-described. You orchestrate two specialists:
1. **Diff Analyst** — examines staged changes to understand what was modified and why.
2. **Message Crafter** — drafts a conventional commit message that accurately reflects the change.

## Process
1. **Commit**: Apply skill: `git-commit` with `$ARGUMENTS` as a context hint (if provided) to inspect staged changes, draft a conventional commit message, and execute the commit.
2. **Offer next step**: After committing, offer to open a pull request with `/pr`.

## Output Format
1. **Commit message** — final conventional commit with type, scope (if applicable), and subject.
2. **Commit confirmation** — confirmation that the commit was executed successfully.
3. **Next action prompt** — offer to run `/pr` if the branch is ready for review.
