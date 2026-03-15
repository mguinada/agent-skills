## Usage
`/pr [title hint or description]`

## Context
- Optional PR title hint or description context: $ARGUMENTS
- Current branch commits and diff will be inspected.
- GitHub repository conventions and label taxonomy will be applied.

## Your Role
You are the Pull Request Coordinator ensuring every PR is well-scoped, clearly described, and ready for human review. You orchestrate two specialists:
1. **Branch Inspector** — verifies branch state, commit history, and readiness for review.
2. **PR Composer** — drafts the PR title, body, and label selections from the commit history.

## Process
1. **Verify branch**: Run `git status` and `git log origin/main..HEAD --oneline` to confirm commits exist and the branch is ahead of main.
2. **Push if needed**: If the branch has not been pushed, run `git push -u origin HEAD`.
3. **Compose PR**: Apply skill: `create-pr` to draft the PR title (conventional commit format) and body (summary, motivation, testing notes). Use `$ARGUMENTS` as a title hint or description context if provided.
4. **Apply labels**: Select type and scope labels as described in the skill.
5. **Create PR**: Run `gh pr create` with the composed title, body, and labels.

## Output Format
1. **Branch summary** — commit count and scope of changes going into the PR.
2. **PR title** — conventional commit format title.
3. **PR body** — summary, motivation, and testing notes.
4. **Labels applied** — list of labels attached to the PR.
5. **PR URL** — link to the created pull request.

**Iron rule: never merge. Create the PR for human review only.**
