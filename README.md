# Agent Skills

A collection of skills for AI coding agents.
Skills follow the [Agent Skills](https://agentskills.io/) format.

## Skills

### AGENTS.md Creator

**Use when:** Creating AGENTS.md/CLAUDE.md files, optimizing existing AI documentation, implementing progressive disclosure, detecting project structure (monorepo/polyrepo), or preventing documentation bloat. Triggers on "create agents.md", "update AGENTS.md", "AI documentation", "project context", "monorepo documentation", "progressive disclosure", or when AI repeatedly asks the same questions about the project.

**Scope:** Create and maintain AI documentation files using progressive disclosure principles. Covers project structure detection (monorepo vs polyrepo indicators), three-level loading system architecture, content classification decision trees, reference index formats (problem-oriented, task-oriented, re-orientation), anti-patterns to avoid, and verification checklists. Emphasizes single source of truth over line count metrics.

---

### GitHub Copilot SDK

**Use when:** Embedding AI agents in apps, creating custom tools, implementing streaming responses, managing sessions, connecting to MCP servers, or creating custom agents. Triggers on Copilot SDK, GitHub SDK, agentic app, embed Copilot, programmable agent, MCP server, custom agent.

**Scope:** Embeds Copilot's agentic workflows in any application using Python, TypeScript, Go, or .NET. Exposes the same engine behind Copilot CLI: a production-tested agent runtime you can invoke programmatically for planning, tool invocation, file edits, streaming, custom tools, MCP integration, and custom agents.

---

### Create Pull Request

**Use when:** Creating PRs, submitting changes for review, or when the user says `/pr` or asks to create a pull request.

**Scope:** Creates GitHub pull requests with properly formatted titles using the project's PR template. Analyzes changes on the current branch, ensures staged changes are committed first (via git-commit if needed), pushes the branch, and uses the pull request template from `.github` when present.

---

### Git Commit

**Use when:** Creating git commits from staged changes, crafting commit messages, or reviewing commit message quality.

**Scope:** Generates concise and descriptive git commit messages based on staged code changes. Follows best practices: imperative mood, subject ≤50 characters, body lines ≤72 characters, and optional description and tags (e.g. `Fixes #123`).

---

### Phoenix Observability

**Use when:** Debugging LLM applications with detailed traces, running evaluations on datasets, monitoring production AI systems, setting up observability infrastructure for agentic systems, or configuring OpenTelemetry instrumentation. Triggers on arize-phoenix imports, OpenTelemetry setup, or observability-related code.

**Scope:** Open-source AI observability platform for LLM tracing, evaluation, and monitoring. Covers Phoenix installation and launch, OpenTelemetry-based tracing (manual and automatic), evaluation framework with LLM-as-judge, storage backends (SQLite for development, PostgreSQL for production), Docker deployment, and comprehensive framework integrations (DSPy, LangChain, LlamaIndex, Agno, AutoGen, CrewAI, and more).

---

### Prompt Engineering for Agentic Systems

**Use when:** Creating prompts for AI agents, especially for tool-using agents, planning agents, data processing agents, or when reducing hallucinations in fact-based tasks.

**Scope:** Generates effective prompts for agentic systems with concrete scenario examples and technique selection guidance. Covers ReAct for tool-using agents, Tree of Thoughts for planning, Few-Shot with negative examples, Chain-of-Verification for factual accuracy, Structured Thinking for complex decisions, Self-Refine for iterative improvement, Least-to-Most for decomposing complex problems, and more. Includes quick decision tree, anti-patterns to avoid, and rationale template with trade-off warnings.

---

### Refactor

**Use when:** Code has become complex or difficult to understand, functions or classes have multiple responsibilities, code smells are detected (duplication, long functions, etc.), architecture needs simplification, or you want to improve maintainability without changing behavior.

**Scope:** Refactors code to make architecture and implementation simpler while preserving all functionality. Follows TDD methodology: small iterations, Red-Green-Refactor cycles, and verification via tests, lint, and type checks. Identifies and addresses code smells (e.g. magic numbers, mixed concerns, poor naming).

---

### AI Engineering

**Use when:** Designing, building, or debugging agentic systems. Triggers on choosing agentic patterns (workflows vs agents), implementing prompt chaining/routing/parallelization/orchestrator-workers/evaluator-optimizer workflows, building autonomous agents with tools, designing Agent-Computer Interfaces (ACI) and tool specifications, or troubleshooting/optimizing existing agent implementations.

**Scope:** Guide for building effective AI agents and agentic workflows based on Anthropic's production patterns. Covers augmented LLMs, agentic workflows (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer), autonomous agents, Agent-Computer Interface (ACI) design, tool specifications, and real-world examples (customer support, coding agents). Emphasizes starting simple and adding complexity only when needed.

---

### TDD (Test-Driven Development)

**Use when:** Implementing a new feature or function, fixing a bug (write reproducing test first), adding tests to legacy code, reviewing code for test refactoring opportunities, or improving existing test quality and organization.

**Scope:** Guides the complete TDD workflow using the Red-Green-Refactor cycle. Covers new features, bug fixes, and legacy code; identifies test improvement opportunities (parametrization, shared fixtures, markers); and applies pytest best practices and verification commands.

---

### Ruby on Rails

**Use when:** Building Rails applications, working with controllers, models, migrations, routes, Active Job, Active Record, validations, associations, API-only apps, Active Storage file uploads, Action Cable WebSockets, Action Mailer email, Action Mailbox inbound email, Action Text rich text, I18n internationalization, or Rails configuration. Triggers on Rails generators, scaffold, migrate, ActiveRecord queries, controller actions, routing config, background jobs, file uploads, real-time features, email handling, translations, or any Rails-specific development task.

**Scope:** Comprehensive Rails development guide with progressive disclosure. Covers controllers (filters, strong parameters, rendering), models (Active Record CRUD, validations, associations, callbacks, scopes), migrations (creating tables, indexes, foreign keys), routing (resource routing, namespaces, constraints), Active Job (background jobs, queues, retries), API-only applications (JSON rendering, versioning, authentication), Active Storage (file uploads, variants, direct uploads), Action Cable (WebSockets, channels, broadcasting), Action Mailer (email sending, attachments), Action Mailbox (inbound email routing), Action Text (rich text, Trix editor), I18n (translations, pluralization), and configuration (database, security, environments).

---

### TypeScript

**Use when:** Working with TypeScript types, generics, type errors, tsconfig issues, module resolution, JS→TS migration, type performance, monorepo setup, or any TypeScript-related question. Triggers on .ts/.tsx files, tsconfig.json, types/ directory, @types/ packages, or TypeScript-related imports.

**Scope:** TypeScript expert guidance for type-level programming, performance optimization, migrations, and real-world problem solving. Covers type patterns (branded types, conditional types, template literals), performance optimization (skipLibCheck, incremental, project references), type testing with Vitest, declaration files, monorepo configuration (Turborepo vs Nx), and tooling decisions (Biome vs ESLint). Includes progressive disclosure with detailed reference files.

---

### Vitest Testing

**Use when:** Writing tests for JavaScript/TypeScript projects, unit testing, component testing (React/Vue/Svelte), browser/E2E testing, mocking, snapshots, code coverage, or handling flaky tests. Triggers on .test.* or .spec.* files, vitest.config.*, vite.config.* with test property, or mentions of testing/vitest.

**Scope:** Comprehensive Vitest testing framework guide with progressive disclosure. Covers unit testing (describe/it/expect, async, hooks), component testing (React/Vue/Svelte), browser/E2E testing (locators, interactions, visual regression), complete mocking reference (functions, modules, globals, timers, file system, requests, dates, classes), all assertions and custom matchers, snapshots, coverage with validation checkpoints, debugging failed tests workflow, parallelism, reporters, type testing with expectTypeOf, in-source testing, test annotations, IDE integration, and CI/CD.

---

## Skill Evaluation

This project includes multiple ways to evaluate Agent Skills quality and format compliance.

### Built-in Evaluation Script

Validates Agent Skills format compliance with rule-based checks and optional LLM-based qualitative analysis.

```bash
# List all available skills
npm run eval

# Lint a specific skill (rule-based validation)
npm run eval -- tdd

# Lint all skills
npm run eval:all

# Detailed review of all skills (includes quality checks)
npm run eval:review

# LLM evaluation of a specific skill (requires API key)
npm run eval -- tdd llm

# LLM evaluation of all skills
npm run eval:llm
```

#### What It Checks

**Rule-based validation:**
- **Required fields**: `name`, `description`, `version`, `tags`
- **Recommended fields**: `author`
- **Content quality**: Code examples, step-by-step structure, trigger hints
- **Frontmatter validity**: YAML parsing and format compliance

**LLM evaluation (when using `llm` flag):**
- **Description quality**: specificity, trigger terms, completeness, distinctiveness
- **Content quality**: conciseness, actionability, workflow clarity, progressive disclosure
- **Structure quality**: frontmatter, examples, edge cases, error handling

#### Score Interpretation

- **90-100%**: Production-ready
- **70-89%**: Good quality with minor improvements needed
- **Below 70%**: Needs work before deployment

#### LLM Configuration

The LLM evaluation uses Groq API. Configure in `.env`:

```bash
# LLM API configuration for evaluation scripts
# For Groq: https://api.groq.com/openai/v1
OPEN_AI_LLM_URL=https://api.groq.com/openai/v1
LLM_API_KEY=your_api_key_here
```

### Tessl Integration

[Tessl](https://tessl.com/) provides AI-powered skill evaluation with deep qualitative analysis.

```bash
# Install Tessl CLI (first time only)
npm install -D @tessl/cli

# Review a specific skill
npx tessl skill review skills/ai-engineering/

# Review all skills
npx tessl skill review skills/*/
```

## Installation

```bash
npx skills add mguinada/ai-coding-toolkit
```

## Third party skills you may want to install

**[Skill creator](https://skills.sh/anthropics/skills/skill-creator)**

```bash
npx skills add https://github.com/anthropics/skills --skill skill-creator
```

**[Find skills](https://skills.sh/vercel-labs/skills/find-skills)**

```bash
npx skills add https://github.com/vercel-labs/skills --skill find-skills
```

**[Claude Code Skills](https://github.com/anthropics/claude-code.git)**

```bash
npx skills add anthropics/claude-code
```

**[Ruby on Rails](https://github.com/NeverSight/learn-skills.dev)**

```bash
npx skills add NeverSight/learn-skills.dev --skill rails
```

### REST APIs

**[RESTful HATEOAS](https://skills.sh/pproenca/dot-skills/restful-hateoas)**

> Note: Rails oriented but can be used as a general REST API design skill with HATEOAS principles.

```bash
npx skills add https://github.com/pproenca/dot-skills --skill restful-hateoas
```

**[REST API Design Patterns](https://skills.sh/manutej/luxor-claude-marketplace/rest-api-design-patterns)**

> Note: Examples in Python (FastAPI) and JS (Express.js) but principles can be applied to any REST API design.

```bash
npx skills add https://github.com/manutej/luxor-claude-marketplace --skill rest-api-design-patterns
```

**[Phoenix Skills](https://github.com/Arize-ai/phoenix)**

```bash
# Individual skills
npx skills add https://github.com/Arize-ai/phoenix/skills --skill phoenix-tracing
npx skills add https://github.com/Arize-ai/phoenix/skills --skill phoenix-evals
npx skills add https://github.com/Arize-ai/phoenix/skills --skill phoenix-cli
```

> **Note:** `phoenix-tracing` may overlap with the `phoenix-observability` skill included in this repository.
