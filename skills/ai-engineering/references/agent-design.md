# Agent Design Patterns

Comprehensive guide to designing high-quality AI agents. See SKILL.md for when to use agents vs. workflows.

## Core Characteristics of High-Quality AI Agents

Effective agents share these essential design properties:

### 1. Explicit Role & Responsibility

An agent has a clearly defined role, expertise, and responsibility. Its mandate is narrow, intentional, and unambiguous.

An agent knows who it is, what it is responsible for, and what it must not do.

### 2. Single-Purpose Focus

An agent is optimized for a small, well-scoped objective. Broad scope, excessive context, or mixed responsibilities degrade performance.

Many narrowly focused agents cooperating outperform a few generalist agents.

### 3. Minimal, Purpose-Built Tooling

An agent has access only to the tools strictly necessary to fulfill its role. Each tool is well-defined, reliable, and aligned with the agent's mandate.

Excess tools increase ambiguity, decision errors, and cost.

### 4. Deterministic Orchestration

Agent behavior is governed by a clear execution structure (planning, acting, observing), not free-form autonomy. The system—not the agent—controls flow, retries, and termination.

Autonomy is bounded; orchestration is explicit.

### 5. Cooperation & Delegation

Agents can collaborate through structured interaction: delegating subtasks, exchanging intermediate results, providing critique or validation.

Agents do not "chat"; they coordinate.

### 6. Self-Constraint & Guardrails

Agents continuously evaluate their outputs and actions against role constraints, safety rules, and task objectives.

Guardrails prevent scope creep, hallucinated authority, and unsafe actions. An agent knows when to stop, defer, or escalate.

### 7. State Awareness (Session Memory)

An agent maintains short-term, task-scoped state: what has been attempted, what succeeded or failed, what remains unresolved.

This prevents repetition and incoherent reasoning within a task.

### 8. Long-Term Memory (Selective & Intentional)

Agents can persist useful knowledge across executions, but memory is curated, scoped, and retrievable by intent.

Memory is a tool, not a transcript.

### 9. Observability & Evaluability

Agent decisions, tool calls, and outcomes are inspectable. The system can trace why an agent acted a certain way and assess quality over time.

If you can't observe it, you can't trust it.

### 10. Failure Awareness & Recovery

Agents recognize uncertainty, errors, and missing information. They can retry safely, ask for clarification, or hand off to another agent or human.

Graceful failure is a first-class capability.

## Autonomous Agents

Agents dynamically direct their own processes and tool usage. LLM maintains control over task execution.

**Best for:** Open-ended problems where steps cannot be predicted, trusted environments

**Requirements:**
- LLM can reason, plan, use tools reliably, recover from errors
- Environmental feedback (tool results, code execution) provides ground truth
- Clear stopping conditions (completion, checkpoints, max iterations)

### The Run Loop

Every agent system needs a "run" concept—a loop that lets agents operate until an exit condition is reached. This loop is central to agent functioning.

**Common exit conditions:**
- Final output is produced
- Model returns response without tool calls
- Error occurs
- Maximum iterations reached

**Implementation pattern:**
```python
def agent_loop(task, max_iterations=10):
    plan = llm(f"Create plan for: {task}")
    for i in range(max_iterations):
        # Execute next step with tools
        result = use_tools(plan.next_step())
        # Assess progress from environment
        status = llm(f"Progress: {result}")
        if status.is_complete():
            break
        # Optionally pause for human feedback
        if status.needs_human_input():
            plan = llm(f"Update plan with: {get_human_input()}")
    return status.final_result()
```

**Risks:** Higher costs, compounding errors. **Mitigation:** Sandbox testing, guardrails, extensive testing.

## Agent-Computer Interface (ACI)

Tool design matters as much as prompt engineering. Tools are how agents interact with the world.

### Tool Classification

Agents require three types of tools:

| Type | Purpose | Examples |
|------|---------|----------|
| **Data** | Retrieve context and information | Query databases, search web, read documents |
| **Action** | Interact with systems to take actions | Send messages, update records, initiate processes |
| **Orchestration** | Delegate to other agents | Handoffs to specialized agents (see Multi-Agent Patterns) |

Each tool should have a standardized definition, enabling flexible many-to-many relationships between tools and agents. Well-documented, reusable tools improve discoverability and prevent redundant definitions.

### Tool Design Principles

1. **Give tokens to think** - Don't write model into a corner
2. **Keep formats natural** - Match what model sees in training data
3. **Minimize overhead** - Avoid line counting, string escaping

### Best Practices

- **Include examples** in tool descriptions for edge cases
- **Clear parameter names** - Think great docstring for junior developer
- **Test thoroughly** - Run many inputs, iterate on mistakes
- **Poka-yoke** - Design to prevent errors (e.g., require absolute paths to avoid confusion)

**Example:** Instead of relative filepaths that change with agent location, require absolute paths.

### Documentation Checklist

- [ ] Clear description of what tool does
- [ ] Parameter types and constraints
- [ ] Example usage with realistic inputs
- [ ] Edge cases and error conditions
- [ ] Distinction from similar tools

## Guardrails

Guardrails are a layered defense mechanism. No single guardrail provides sufficient protection—using multiple, specialized guardrails together creates resilient agents.

### Guardrail Taxonomy

| Guardrail Type | Purpose | Example |
|----------------|---------|---------|
| **Relevance classifier** | Ensure responses stay within intended scope | Flag off-topic queries |
| **Safety classifier** | Detect unsafe inputs (jailbreaks, prompt injection) | Block attempts to extract system prompts |
| **PII filter** | Prevent exposure of personally identifiable information | Redact sensitive data from outputs |
| **Moderation** | Flag harmful or inappropriate content | Detect hate speech, harassment |
| **Tool safeguards** | Risk-based tool rating and escalation | Require approval for high-risk actions |
| **Rules-based protections** | Deterministic measures for known threats | Blocklists, input limits, regex filters |
| **Output validation** | Ensure responses align with requirements | Brand voice checks, format validation |

### Implementing Guardrails

1. **Focus on data privacy and content safety first**
2. **Add guardrails based on real-world edge cases and failures**
3. **Optimize for both security and user experience**—over-aggressive filtering harms UX

### Tool Risk Rating

Assign each tool a risk level based on:

- **Low:** Read-only operations, reversible actions
- **Medium:** Write access with limited impact, requires permissions
- **High:** Irreversible actions, financial impact, sensitive data changes

Use risk ratings to trigger automated safeguards: pause for checks before high-risk tools, escalate to human approval, or require additional authentication.

## Multi-Agent Coordination Patterns

When a single agent becomes overloaded with tools or complex logic, split responsibilities across multiple specialized agents.

### When to Split

| Trigger | Indication |
|---------|------------|
| **Complex logic** | Prompts contain many conditional branches; prompt templates become difficult to scale |
| **Tool overload** | Tools are similar or overlapping; improving clarity doesn't fix selection errors |

### Coordination Patterns

**Manager Pattern (Agents as Tools)**
- Central coordinator delegates to specialized agents via tool calls
- Coordinator synthesizes results and maintains control
- Ideal when you want one agent controlling workflow execution

**Decentralized Pattern (Agent Handoffs)**
- Agents operate as peers, handing off execution to one another
- One-way transfer of control with conversation state
- Ideal for conversation triage or when specialized agents should fully take over

**Sequential Pattern**
- Output from one agent becomes direct input for the next
- Acts like a digital assembly line for linear workflows
- Best for: Multi-stage content pipelines, document processing chains

**Iterative Refinement Pattern**
- Generator agent creates content, critic agent evaluates against quality standards
- Creates feedback loop for continuous improvement
- Best for: Content generation requiring quality gates, code review

All patterns keep components flexible, composable, and driven by clear prompts.

## Real-World Patterns

### Customer Support Agent

Natural fit because:
- Conversational flow + external data/actions
- Tools: customer data, order history, knowledge base
- Actions: refunds, ticket updates programmatically
- Clear success: user-defined resolutions

### Coding Agent

Effective because:
- Code verifiable through automated tests
- Iteration using test results as feedback
- Well-defined, structured problem space
- Objective quality measurement

**Example flow:**
1. Parse issue description
2. Plan changes across files
3. Edit files with test verification
4. Run tests, iterate on failures
5. Human review for alignment
