# Agent Skills

A collection of skills for AI coding agents.
Skills follow the [Agent Skills](https://agentskills.io/) format.

## Skills

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
npx skills add mguinada/agent-skills
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
