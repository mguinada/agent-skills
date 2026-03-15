# ai-coding-toolkit

A Claude Code plugin with AI coding skills, slash commands, and specialized agents.

## Installation

### Plugin (skills + commands + agents)

```bash
claude plugin install mguinada/ai-coding-toolkit
```

### Skills only (via Agent Skills registry)

```bash
npx skills add mguinada/ai-coding-toolkit
```

Individual skills can also be installed from the monorepo:

```bash
npx skills add mguinada/ai-coding-toolkit --skill tdd
```

---

## Skills

Skills are context-aware knowledge packages that activate **automatically** when their trigger conditions are detected in the conversation. No explicit invocation needed — Claude loads the relevant skill when the topic matches.

| Skill | Activates when… |
|-------|-----------------|
| `tdd` | Writing tests, implementing features with TDD, Red-Green-Refactor |
| `refactor` | Simplifying code, reducing complexity, fixing code smells |
| `git-commit` | Creating commits, writing commit messages |
| `create-pr` | Opening pull requests, submitting changes for review |
| `debug` | Debugging errors, stack traces, failing tests, unexpected behaviour |
| `docker` | Dockerfiles, docker-compose, containerising applications |
| `changelog` | Updating CHANGELOG.md, preparing releases, writing release notes |
| `release` | Cutting releases, tagging versions, publishing packages |
| `agents-md-creator` | Creating or updating AGENTS.md / CLAUDE.md files |
| `design-pattern-adopter` | Applying GoF patterns, decoupling components, OO architecture |
| `ai-engineering` | Building agentic systems, choosing workflows vs. agents |
| `prompt-engineering` | Writing prompts for agents, reducing hallucinations |
| `phoenix-observability` | LLM tracing, evaluation, monitoring with Arize Phoenix |
| `copilot-sdk` | Embedding Copilot in apps, custom agents *(Technical Preview)* |
| `rails` | Ruby on Rails controllers, models, migrations, routing, jobs |
| `typescript` | TypeScript types, generics, tsconfig, monorepo setup |
| `vitest` | Vitest unit, component, and browser testing |

See the full [skills catalog](skills/README.md) for trigger phrases and scope details.

---

## Slash Commands

Slash commands provide **explicit, on-demand** entry points into workflows. Type a command in Claude Code to trigger it directly.

| Command | What it does |
|---------|--------------|
| `/ask [question]` | Adversarial architectural consultation — four advisors (Systems Designer, Strategist, Scalability, Risk) analyse your question |
| `/commit [hint]` | Inspect staged changes, draft a conventional commit message, and execute the commit |
| `/pr` | Push the current branch and create a GitHub pull request with a conventional title, body, and labels |
| `/changelog [version]` | Generate a grouped CHANGELOG.md entry from git history since the last tag |
| `/release [version]` | Full release sequence: pre-flight checks → changelog → version bump → tag → GitHub release |
| `/tdd [feature]` | Drive the Red-Green-Refactor cycle with the `tdd-guide` agent enforcing write-tests-first |
| `/refactor [file]` | Apply safe, test-backed refactoring steps; uses `tdd` if new tests are needed |
| `/debug [error]` | Four-phase debugging: Reproduce → Locate → Fix → Verify; adds regression tests after the fix |
| `/review [scope]` | Parallel code review by `code-reviewer`, `security-reviewer`, `python-reviewer` (if `.py` files), `database-reviewer` (if DB changes) |
| `/agents-md` | Generate or update `AGENTS.md` / `CLAUDE.md` with progressive disclosure structure |
| `/docker [service]` | Scaffold a `Dockerfile` + `.dockerignore`, or audit and fix existing Docker configuration |
| `/deploy-check [env]` | Multi-layer deployment readiness check — tests, security scan, container audit, DB migration check → Go / No-Go verdict |
| `/plan [feature]` | Structured planning before implementation: clarify scope, iterate, yield control for review |
| `/docs [scope]` | Generate or update documentation (README, API reference, architecture guide, or tutorial) |

**Usage example:**

```
/review src/auth/
/commit
/pr
```

---

## Agents

Agents are specialized subagents available after plugin install. They are launched automatically by commands, or you can invoke them by name in a conversation.

| Agent | Description |
|-------|-------------|
| `code-reviewer` | Code quality, SOLID principles, design patterns, and readability |
| `security-reviewer` | Security vulnerabilities, injection risks, secrets exposure, and unsafe patterns |
| `database-reviewer` | PostgreSQL query optimisation, schema design, RLS, and migration safety |
| `python-reviewer` | Python-specific patterns, type hints, idiomatic usage, and Python security |
| `tdd-guide` | TDD specialist enforcing write-tests-first with multi-language support (JS/TS, Python, Ruby) |
| `e2e-runner` | End-to-end testing with Playwright; interprets results and reports failures |
| `planner` | Structured planning with iterative breakdown before implementation |
| `technical-docs-writer` | Generates and maintains technical documentation |

**Invoking an agent directly:**

```
Use the code-reviewer agent to review src/payments/
```

```
Ask the planner agent to break down adding OAuth2 support
```

---

## License

MIT
