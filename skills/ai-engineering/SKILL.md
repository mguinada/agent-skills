---
name: ai-engineering
description: Guide for building effective AI agents and agentic workflows. Use when designing, building, or debugging agentic systems - including choosing the right agentic pattern (workflows vs agents), implementing prompt chaining/routing/parallelization/orchestrator-workers/evaluator-optimizer workflows, building autonomous agents with tools, designing Agent-Computer Interfaces (ACI) and tool specifications, or troubleshooting/optimizing existing agent implementations. Covers augmented LLMs, agentic workflows, and autonomous agents based on production patterns.
---

# AI Engineering

Build effective agentic systems using proven patterns. Start simple, add complexity only when needed.

## Core Principle

**Find the simplest solution first.** Agentic systems trade latency and cost for better task performance. Only increase complexity when simpler solutions fall short.

1. Start with optimized single LLM calls (retrieval, in-context examples)
2. Add workflows for predictable, multi-step tasks
3. Use agents when flexibility and autonomous decision-making are required

## When to Build an Agent

Before committing to an agent, validate that your use case truly requires agentic capabilities. Consider alternatives first—deterministic solutions are simpler, faster, and more reliable.

**Use agents when workflows involve:**

| Criteria | Description | Example |
|----------|-------------|---------|
| **Complex decision-making** | Nuanced judgment, exceptions, context-sensitive decisions | Refund approval with edge cases |
| **Brittle rule systems** | Rulesets that are unwieldy, costly to maintain, or error-prone | Vendor security reviews |
| **Unstructured data** | Interpreting natural language, documents, or conversational input | Processing insurance claims |

If your use case doesn't clearly fit these criteria, a deterministic or simple LLM solution may suffice.

## Agentic System Taxonomy

Understanding the spectrum of agentic capabilities helps you choose the right level of complexity for your use case.

| Level | Name | Description | Use Case |
|-------|------|-------------|----------|
| **Level 0** | Core Reasoning System | LM operates in isolation, responding based on pre-trained knowledge only | Explaining concepts, general knowledge |
| **Level 1** | Connected Problem-Solver | LM connects to external tools to retrieve real-time information and take actions | Answering "What's the score?", querying databases |
| **Level 2** | Strategic Problem-Solver | Agent actively curates context, plans multi-step tasks, and engineers focused queries for each step | "Find coffee shops halfway between two locations" |
| **Level 3** | Collaborative Multi-Agent System | Multiple specialized agents coordinate under a central manager or through peer handoffs | Product launch with research, marketing, and web dev agents |
| **Level 4** | Self-Evolving System | Agents can dynamically create new tools or agents to fill capability gaps | Agent creates sentiment analysis agent when needed |

**Progression guidance:** Start at Level 0 or 1. Only increase levels when the current level cannot handle your use case effectively.

## Prompt Engineering

Effective prompts are critical to agentic system performance. When designing or refining prompts for LLM calls, workflows, or agents, leverage the **prompt-engineering skill** if available. It provides specialized guidance for crafting prompts that produce reliable, high-quality outputs.

## Context Engineering

Context engineering is the practice of dynamically assembling and managing information within an LLM's context window to enable stateful, intelligent agents. It represents an evolution from prompt engineering—while prompts focus on static instructions, context engineering addresses the entire payload dynamically.

**Key principles:**
- **Curate attention:** Prevent context overload by including only relevant information for each step
- **Dynamic filtering:** Transform previous outputs into focused queries for the next step
- **Progressive refinement:** Each step should produce a distilled, actionable input for the next

**Example:** Instead of passing an entire document to summarize, extract key entities first, then retrieve only relevant context about those entities.

For comprehensive guidance on sessions, memory, and context management, see **[references/context-engineering.md](references/context-engineering.md)**.

## Agentic Problem-Solving Process

All autonomous agents operate on a continuous cyclical process. Understanding this loop is fundamental to building effective agents.

**The 5-Step Loop:**

1. **Get the Mission** - Receive a high-level goal from user or automated trigger
2. **Scan the Scene** - Gather context from available resources: instructions, session history, available tools, long-term memory
3. **Think It Through** - Analyze mission against scene, devise a plan using chain-of-reasoning
4. **Take Action** - Execute the first concrete step by invoking a tool or generating response
5. **Observe and Iterate** - Observe the outcome, add to context/memory, loop back to step 3

This "Think, Act, Observe" cycle continues until the mission is complete or an exit condition is reached.

## Pattern Selection Guide

| Pattern | Use When | Key Benefit |
|---------|----------|-------------|
| **Augmented LLM** | Single task needing external data/tools | Retrieval, tools, memory |
| **Prompt Chaining** | Task decomposes into fixed subtasks | Trade latency for accuracy |
| **Routing** | Distinct categories need separate handling | Separation of concerns |
| **Parallelization** | Subtasks are independent OR multiple attempts needed | Speed OR confidence |
| **Orchestrator-Workers** | Subtasks unpredictable, input-dependent | Dynamic task breakdown |
| **Evaluator-Optimizer** | Clear evaluation criteria, iteration adds value | Iterative refinement |
| **Autonomous Agent** | Open-ended problems, unpredictable steps | Flexibility at scale |

## Decision Framework

```
Is the task solvable with a single well-crafted prompt?
├─ Yes → Optimize with retrieval/examples → Done
└─ No → Are subtasks fixed and predictable?
    ├─ Yes → Use Workflow (chaining/routing/parallelization)
    └─ No → Are subtasks input-dependent?
        ├─ Yes → Use Orchestrator-Workers
        └─ No → Is the problem open-ended with unpredictable steps?
            ├─ Yes → Use Autonomous Agent
            └─ No → Reconsider approach
```

## Workflow Patterns

For detailed workflow implementations with code examples, see **[references/workflows.md](references/workflows.md)**.

**Quick reference:**
- **Prompt Chaining** - Sequential LLM calls, each processing previous output
- **Routing** - Classify input and direct to specialized handler
- **Parallelization** - Sectioning (independent subtasks) or Voting (multiple attempts)
- **Orchestrator-Workers** - Central LLM breaks down tasks, delegates to workers, synthesizes results
- **Evaluator-Optimizer** - One LLM generates, another evaluates and provides feedback in a loop

## Agent Design

For comprehensive agent design patterns, characteristics, and best practices, see **[references/agent-design.md](references/agent-design.md)**.

**Core agent characteristics:**
1. Explicit Role & Responsibility - Clearly defined mandate
2. Single-Purpose Focus - Narrow scope, high performance
3. Minimal, Purpose-Built Tooling - Only necessary tools
4. Deterministic Orchestration - Clear execution structure
5. Cooperation & Delegation - Structured interaction
6. Self-Constraint & Guardrails - Prevents scope creep
7. State Awareness - Session memory for tasks
8. Long-Term Memory - Curated, retrievable knowledge
9. Observability - Inspectable decisions and outcomes
10. Failure Awareness - Graceful recovery

**Key topics in agent-design.md:**
- Autonomous Agents and the Run Loop
- Agent-Computer Interface (ACI) and Tool Design
- Guardrails and Security
- Multi-Agent Coordination Patterns
- Real-World Agent Examples

## Implementation Guidance

For practical implementation guidance including model selection, task decomposition, and debugging, see **[references/implementation.md](references/implementation.md)**.

**Quick start:**
```python
# Single call with retrieval
response = claude.messages.create(
    model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": query}],
    tools=[search_tool, database_tool]
)
```

**Key topics in implementation.md:**
- Start simple, add complexity only when needed
- Framework considerations (Claude Agent SDK, Agno, CrewAI, LangChain)
- Model selection strategy (prototype with best, optimize cost/latency)
- Task decomposition procedure
- Human intervention patterns
- Debugging agents and testing strategy

## Operations & Security

For production operations, security, and agent learning patterns, see **[references/operations.md](references/operations.md)**.

**Key topics:**
- **Agent Ops (GenAIOps)** - Evaluation strategy, LM as Judge, metrics-driven development, OpenTelemetry traces
- **Agent Identity & Security** - Agents as new class of principal, security layers, policy enforcement
- **Agent Learning** - Self-evolution, adaptation techniques, multi-agent learning workflows

## Quality & Evaluation

For comprehensive agent quality frameworks, evaluation strategies, and observability practices, see **[references/quality-evaluation.md](references/quality-evaluation.md)**.

**Key topics:**
- **Four Pillars of Agent Quality** - Effectiveness, Efficiency, Robustness, Safety
- **"Outside-In" Evaluation Hierarchy** - End-to-end (Black Box) and Trajectory (Glass Box) evaluation
- **Evaluators** - Automated metrics, LLM-as-a-Judge, Agent-as-a-Judge, Human-in-the-Loop
- **Observability Pillars** - Logging, Tracing, Metrics for agent visibility
- **Agent Quality Flywheel** - Continuous improvement loop
- **Three Core Principles** - For building trustworthy agents

## Resources

- **[Workflows Reference](references/workflows.md)** - Detailed workflow patterns with code examples
- **[Context Engineering](references/context-engineering.md)** - Sessions, memory, and context management
- **[Agent Design](references/agent-design.md)** - Agent characteristics, ACI, guardrails, multi-agent patterns
- **[Implementation Guide](references/implementation.md)** - Practical implementation guidance and debugging
- **[Operations & Security](references/operations.md)** - Production operations, security, and agent learning
- **[Quality & Evaluation](references/quality-evaluation.md)** - Agent quality frameworks, evaluation strategies, observability
- **[ACI Guide](references/aci.md)** - Agent-Computer Interface deep dive with tool design patterns
- **[MCP Guide](references/mcp.md)** - Model Context Protocol for tool interoperability
- **[Examples](references/examples.md)** - Real-world implementations and case studies
