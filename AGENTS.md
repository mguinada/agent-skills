# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of AI agent skills following the [Agent Skills](https://agentskills.io/) format. Each skill is a self-contained knowledge package that extends Claude Code's capabilities for specific development tasks.

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
- Always follow the instructions in `.github/instructions/` for context-aware coding guidelines.
- The plan should be broken down into clear, discrete iterations. Each iteration has a full TDD cycle, linting, and type checking.
- After each iteration, give me prompt control back to review the code and provide feedback before proceeding to the next step.
- Do not proceed to the next iteration until I explicitly tell you to.
- As the final step of the plan, update any documentation files as needed to reflect the new code.

## Git commits

- Never add `Co-Authored-By:` to commit messages.
- Use the `git-commit` skill if available

## Pull Requests

- Always create a pull request for code changes, even if working alone.
- Use the `create-pr` skill if available

## Installation

Users install skills via:

```bash
npx skills add mguinada/agent-skills
```

Individual skills can be installed from the monorepo.

## Skill Structure

Each skill lives in `skills/<skill-name>/` and must contain:

- **SKILL.md** - The main skill file with YAML frontmatter (name, description, version, tags) and markdown content
- **references/** (optional) - Additional documentation files

### Required Frontmatter Fields

```yaml
---
name: skill-name
description: One-line description for when to use this skill
author: Author name
version: X.X.X
tags: [tag1, tag2, tag3]
---
```

### Current Skills

- **tdd** - Test-Driven Development workflow (Red-Green-Refactor)
- **refactor** - Code simplification using TDD methodology
- **git-commit** - Generate conventional git commit messages
- **create-pr** - Create GitHub pull requests with proper formatting
- **copilot-sdk** - Build agentic applications with GitHub Copilot SDK
- **prompt-engineering** - Generate effective prompts for agentic systems

## Skill Development Guidelines

### Skill Content Principles

1. **Actionable first** - Skills should guide specific actions, not just provide reference information
2. **Clear trigger conditions** - The description field must indicate when to invoke the skill
3. **Progressive disclosure** - Start with overview, then provide details in sections
4. **Examples over theory** - Show concrete code examples before explaining concepts
5. **Verification commands** - Include commands to test/verify the skill's guidance works

### When Skills Should Auto-Invoke

Skills list trigger phrases in their description. Common patterns:
- "Use when: X, Y, Z"
- "Triggers on: X, Y, Z"

When these patterns appear in user requests, the Skill tool should be invoked proactively.

### Testing Skill Changes

After modifying a skill:
1. Test the skill locally in Claude Code
2. Verify YAML frontmatter is valid
3. Check that all code examples are accurate
4. Ensure description properly identifies when to use the skill

## Updating README.md

When adding or updating a skill, you must also update `README.md` following this pattern:

```markdown
### Skill Name

**Use when:** [trigger conditions from the skill's description field]

**Scope:** [what the skill does and its key capabilities]

---
```

Each skill entry in the README should:
- Use the skill's display name as the heading
- List trigger conditions under "**Use when:**"
- Describe capabilities under "**Scope:**"
- End with `---` separator (except the last skill)

## Publishing

Skills are published to GitHub. Users install them via the `npx skills` CLI from the skills.sh registry.
