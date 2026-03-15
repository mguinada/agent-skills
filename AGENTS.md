# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin and Agent Skills collection. It distributes AI coding skills and subagents via two formats:

- **Claude Code plugin** — install with `claude plugin install mguinada/ai-coding-toolkit`
- **Agent Skills** — install with `npx skills add mguinada/ai-coding-toolkit`

Each skill is a self-contained knowledge package that extends Claude Code's capabilities for specific development tasks.

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

Plugin install (skills + agents):

```bash
claude plugin install mguinada/ai-coding-toolkit
```

Skills-only install:

```bash
npx skills add mguinada/ai-coding-toolkit
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
- **copilot-sdk** - Build agentic applications with GitHub Copilot SDK (Technical Preview)
- **prompt-engineering** - Generate effective prompts for agentic systems
- **debug** - Systematic root-cause-first debugging methodology
- **docker** - Docker containerization, multi-stage builds, and Compose
- **changelog** - Generate and maintain CHANGELOG.md files
- **release** - Orchestrate full release sequence (tag, publish, GitHub release)
- **agents-md-creator** - Create and maintain AGENTS.md / CLAUDE.md files
- **design-pattern-adopter** - Guide to all 23 GoF design patterns
- **ai-engineering** - Build AI agents and agentic workflows
- **phoenix-observability** - LLM tracing, evaluation, and monitoring with Arize Phoenix
- **rails** - Comprehensive Ruby on Rails development guide
- **typescript** - TypeScript type-level programming and tooling
- **vitest** - Vitest testing framework for JavaScript/TypeScript

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

## Updating skills/README.md

When adding or updating a skill, you must also update `skills/README.md` following this pattern:

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

## Commands

Slash commands in `commands/` provide explicit, on-demand entry points into key workflows. They complement skills (which auto-invoke via context detection) by giving users a direct way to trigger a workflow.

### `/ask`

**Trigger:** User types `/ask [technical question]` or wants architectural consultation and guidance.

**Action:** Orchestrates four architectural advisors (Systems Designer, Technology Strategist, Scalability Consultant, Risk Analyst). Asks clarifying questions if the problem is underspecified. Provides honest analysis including risks and trade-offs without sugar-coating.

---

### `/commit`

**Trigger:** User types `/commit` or wants to create a git commit.

**Action:** Invokes skill `git-commit`. Inspects staged changes, drafts a conventional commit message, executes the commit, and offers to open a PR.

---

### `/pr`

**Trigger:** User types `/pr` or wants to open a pull request.

**Action:** Invokes skill `create-pr`. Checks branch state, pushes if needed, creates a PR with a conventional title and body, and applies labels. Never merges.

---

### `/changelog`

**Trigger:** User types `/changelog [version]` or wants to update the changelog.

**Action:** Invokes skill `changelog`. Reads git log since the last tag, writes a grouped changelog entry into `CHANGELOG.md`, then invokes skill `git-commit` to commit the update.

---

### `/release`

**Trigger:** User types `/release [version]` or wants to cut a release.

**Action:** Invokes skill `release`. Runs pre-flight checks, invokes skill `changelog`, bumps version, invokes skill `git-commit`, creates an annotated tag, and creates a GitHub release.

---

### `/tdd`

**Trigger:** User types `/tdd [feature description]` or wants to develop with TDD.

**Action:** Invokes skill `tdd`. Drives the Red-Green-Refactor cycle. Launches the `tdd-guide` agent to enforce write-tests-first discipline.

---

### `/refactor`

**Trigger:** User types `/refactor [file or function]` or wants to refactor code.

**Action:** Invokes skill `refactor`. Verifies tests pass first, then applies small safe refactoring steps. Uses skill `tdd` and the `tdd-guide` agent if new tests are needed.

---

### `/debug`

**Trigger:** User types `/debug [error or description]` or needs to investigate a bug.

**Action:** Invokes skill `debug`. Works through four phases: Reproduce → Locate → Fix → Verify. Invokes skill `refactor` for cleanup and skill `tdd` for regression tests after the fix.

---

### `/review`

**Trigger:** User types `/review [file or scope]` or wants a code review.

**Action:** Launches `code-reviewer`, `security-reviewer`, and (when the scope includes migrations, schema files, SQL, or ORM models) `database-reviewer` agents in parallel. Synthesizes findings into a unified report: Critical → Major → Minor → Security → Positives.

---

### `/agents-md`

**Trigger:** User types `/agents-md` or wants to generate/update `AGENTS.md`.

**Action:** Invokes skill `agents-md-creator`. Detects project type and tech stack, then generates or updates `AGENTS.md` with progressive disclosure structure.

---

### `/docker`

**Trigger:** User types `/docker [service]` or wants Docker scaffolding or an audit.

**Action:** Invokes skill `docker`. Scaffolds `Dockerfile` + `.dockerignore` for new projects, or audits and fixes existing Docker configuration.

---

### `/deploy-check`

**Trigger:** User types `/deploy-check [target or environment]` or wants to validate deployment readiness.

**Action:** Runs a multi-layer pre-flight check. Invokes skill `tdd` and launches the `e2e-runner` agent for QA validation. Launches the `security-reviewer` agent for vulnerability and secrets scanning. Invokes skill `docker` for container and infra readiness; launches the `database-reviewer` agent if migrations are present. Synthesises all findings into an explicit **Go / No-Go** verdict with a deployment plan and rollback procedures.

---

### `/plan`

**Trigger:** User types `/plan [feature or task description]` or wants a structured plan before writing code.

**Action:** Launches the `planner` agent. Asks clarifying questions if the task is underspecified. Presents the plan (Overview, Architecture Decision, Iterations, Unresolved Questions) and yields control for user review. Does not proceed to implementation until the user approves.

---

### `/docs`

**Trigger:** User types `/docs [file, module, or scope]` or wants documentation generated or updated.

**Action:** Launches the `technical-docs-writer` agent. Reads relevant source files and produces structured documentation (README, API reference, architecture guide, or tutorial) as appropriate. Defaults to recently changed files if no scope is specified.

---

## Agents

The plugin includes the following subagents:

- **`code-reviewer`** - Code quality, SOLID principles, design patterns, and readability
- **`security-reviewer`** - Security vulnerabilities, injection risks, secrets exposure, and unsafe patterns
- **`database-reviewer`** - PostgreSQL query optimization, schema design, RLS, and migration safety
- **`python-reviewer`** - Python-specific patterns, type hints, idiomatic usage, and Python security
- **`tdd-guide`** - TDD specialist enforcing write-tests-first methodology with multi-language support
- **`e2e-runner`** - End-to-end testing with Agent Browser (preferred) and Playwright fallback
- **`planner`** - Structured planning with iterative breakdown before implementation
- **`technical-docs-writer`** - Generates and maintains technical documentation

---

## Publishing

Skills are published to GitHub. Users install them via the `npx skills` CLI from the skills.sh registry.
