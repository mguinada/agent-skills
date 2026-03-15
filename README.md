# ai-coding-toolkit

A Claude Code plugin with AI coding skills and agents.

## Installation

```bash
claude plugin install mguinada/ai-coding-toolkit
```

Alternatively, install skills only via the Agent Skills registry:

```bash
npx skills add mguinada/ai-coding-toolkit
```

## What's included

### Skills

A collection of skills that extend Claude Code's capabilities. Skills are invoked automatically when their trigger conditions are met.

See the full [skills catalog](skills/README.md) for details on each skill.

### Agents

Specialized subagents available after plugin install:

| Agent | Description |
|-------|-------------|
| `tdd-guide` | Guides Test-Driven Development workflows |
| `planner` | Breaks down tasks into actionable plans |
| `code-reviewer` | Reviews code for quality and best practices |
| `python-reviewer` | Python-specific code review |
| `security-reviewer` | Security vulnerability analysis |
| `technical-docs-writer` | Writes technical documentation |
| `e2e-runner` | Runs and interprets end-to-end tests |
| `database-reviewer` | Reviews database schemas and queries |

## Usage

After installing the plugin, skills activate automatically based on context. Agents can be invoked by name in Claude Code conversations.

## License

MIT
