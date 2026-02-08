---
name: ai-engineering
description: Guide for building effective AI agents and agentic workflows. Use when designing, building, or debugging agentic systems - including choosing the right agentic pattern (workflows vs agents), implementing prompt chaining/routing/parallelization/orchestrator-workers/evaluator-optimizer workflows, building autonomous agents with tools, designing Agent-Computer Interfaces (ACI) and tool specifications, or troubleshooting/optimizing existing agent implementations. Covers augmented LLMs, agentic workflows, and autonomous agents based on Anthropic's production patterns.
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

## Prompt Engineering

Effective prompts are critical to agentic system performance. When designing or refining prompts for LLM calls, workflows, or agents, leverage the **prompt-engineering skill** if available. It provides specialized guidance for crafting prompts that produce reliable, high-quality outputs.

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

## Task Decomposition

Task decomposition is the process of identifying discrete steps required to complete a workflow. Decompose iteratively until each step can be executed reliably by an LLM, a tool, or a human.

### Decomposition Procedure

For each step in a workflow, evaluate:

**1. Execution Capability**
Can this step be completed by:
- An LLM alone?
- A deterministic tool call?
- An LLM orchestrating tool calls?
- If none apply → requires human intervention

**2. Human Baseline Analysis**
If a human would perform this step, identify:
- The exact decision being made
- The inputs required
- The success criteria

Attempt to decompose further until automatable or explicitly human-gated.

**3. Granularity Control**
Continue decomposition until:
- The step has a single clear objective
- Inputs and outputs are well defined
- Failure modes are observable

**Stop** when further subdivision does not improve reliability, observability, or control.

### Workflow Step Design Principles

Each step MUST satisfy:

| Principle | Requirement |
|-----------|-------------|
| **Single Responsibility** | Each step performs one well-defined action or decision. Mixed responsibilities are prohibited. |
| **Explicit I/O** | Declare required inputs, produced outputs, and side effects (if any). |
| **Deterministic Boundaries** | Prefer deterministic tools over free-form LLM reasoning where possible. |

---

## Workflows

### Prompt Chaining

Decompose task into sequence of steps. Each LLM call processes previous output.

**Best for:** Marketing copy → translation, document outline → content with validation

**Implementation:**
```python
# Step 1: Generate outline
outline = llm("Create an outline for an article about X")

# Step 2: Validate outline
if not meets_criteria(outline):
    outline = llm(f"Revise this outline: {outline}")

# Step 3: Generate content
content = llm(f"Write article based on: {outline}")
```

**Gating:** Add programmatic checks between steps to verify quality.

### Routing

Classify input and direct to specialized downstream task.

**Best for:** Customer service queries, cost optimization (Haiku for simple, Sonnet for complex)

**Implementation:**
```python
# Route input to appropriate handler
category = llm(f"Classify: {user_input}")
if category == "technical_support":
    result = technical_llm(user_input)
elif category == "refund":
    result = refund_process(user_input)
else:
    result = general_llm(user_input)
```

### Parallelization

Two variations: **Sectioning** (independent subtasks) or **Voting** (multiple attempts).

**Sectioning best for:** Guardrails, automated evals (each LLM evaluates different aspect)

**Voting best for:** Code vulnerability review, content moderation (multiple prompts, flag if any find issue)

**Implementation:**
```python
# Sectioning: independent processing
guardrail_result = guardrail_llm(user_input)
response = main_llm(user_input)

# Voting: multiple attempts for confidence
results = [llm(prompt) for _ in range(3)]
final = aggregate(results)
```

### Orchestrator-Workers

Central LLM dynamically breaks down tasks, delegates to workers, synthesizes results.

**Best for:** Coding (multiple file changes), search across multiple sources

**Key difference from parallelization:** Subtasks not predefined—determined by orchestrator based on input

**Implementation:**
```python
# Orchestrator decomposes task
subtasks = orchestrator_llm(f"Break down: {task}")

# Workers execute subtasks in parallel
results = [worker_llm(subtask) for subtask in subtasks]

# Orchestrator synthesizes
final = orchestrator_llm(f"Synthesize: {results}")
```

### Evaluator-Optimizer

One LLM generates response, another evaluates and provides feedback in a loop.

**Best for:** Literary translation, complex search with multiple rounds

**Signs of good fit:** (1) Human feedback improves responses, (2) LLM can provide useful feedback

**Implementation:**
```python
response = initial_llm(prompt)
while not evaluator_llm(response):
    feedback = evaluator_llm(f"Critique: {response}")
    response = optimizer_llm(f"Improve based on: {feedback}")
```

### Prompt Templates

For managing complexity without multi-agent overhead, use prompt templates instead of maintaining many individual prompts.

**Template approach:**
- Create a single flexible base prompt with variable placeholders
- Inject policy variables at runtime for different contexts
- Update variables rather than rewriting entire workflows

**Example:**
```
You are a call center agent helping {{user_first_name}}, a loyal customer for {{user_tenure}}.
The user may complain about {{user_complaint_categories}}. Greet them and answer any questions!
```

This adapts easily to various contexts, simplifying maintenance and evaluation.

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

---

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

Both patterns keep components flexible, composable, and driven by clear prompts.

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

## Implementation Guidance

### Start Simple

```python
# Single call with retrieval
response = claude.messages.create(
    model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": query}],
    tools=[search_tool, database_tool]
)
```

### Add Complexity Only When Needed

1. Measure performance of simple approach
2. Identify specific failure modes
3. Add targeted complexity (one pattern at a time)
4. Re-measure, iterate

### Framework Considerations

**Frameworks:** Claude Agent SDK, Agno, CrewAI, LangChain, Copilot SDK

**Tradeoff:** Quick start vs. abstraction layers obscuring prompts/responses

**Recommendation:** Start with direct LLM APIs. Most patterns need only a few lines of code. If using frameworks, understand underlying code.

### Model Selection Strategy

Different models have different strengths in task complexity, latency, and cost. Not every task requires the most capable model.

**Recommended approach:**
1. **Prototype with the best model** to establish a performance baseline
2. **Set up evals** to measure accuracy and quality
3. **Optimize cost and latency** by swapping smaller models where acceptable results are maintained

| Task Type | Model Choice |
|-----------|--------------|
| Simple retrieval, classification | Smaller, faster models |
| Complex reasoning, decisions | More capable models |
| Coding, analysis | Most capable models available |

## Human Intervention

Plan for human intervention early—it's a critical safeguard for improving real-world performance.

### When to Escalate

| Trigger | Condition | Example |
|---------|-----------|---------|
| **Failure threshold exceeded** | Agent fails after multiple attempts | Cannot understand customer intent after 3 tries |
| **High-risk action** | Sensitive, irreversible, or high-stakes operations | Canceling orders, large refunds, payments |

### Implementation

Design graceful handoff mechanisms that allow agents to transfer control when they cannot complete a task. In customer service, this means escalating to a human agent. For coding agents, this means handing control back to the user.

## Debugging Agents

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Agent loops forever | No clear stopping condition | Add max iterations, checkpoint |
| Poor tool usage | Unclear tool descriptions | Rewrite with examples |
| Misses edge cases | Insufficient variation in testing | Expand test coverage |
| High latency/cost | Over-agentic design | Simplify to workflow or single call |
| Compounding errors | No environmental feedback | Add verification steps |

### Testing Strategy

1. **Unit test** each tool independently
2. **Integration test** agent workflows with sample inputs
3. **Sandbox** before production deployment
4. **Monitor** costs, latency, success rates
5. **Iterate** based on real usage patterns

## Resources

- **[Workflows Reference](references/workflows.md)** - Detailed workflow patterns with code examples
- **[ACI Guide](references/aci.md)** - Agent-Computer Interface deep dive with tool design patterns
- **[Examples](references/examples.md)** - Real-world implementations and case studies

## Further Reading

This skill synthesizes best practices from production AI systems across multiple sources:

- **Augmented LLMs as foundation** - Start with retrieval and examples before adding complexity
- **Workflows vs. Agents** - Architectural distinction and when to use each pattern
- **Production patterns** - Real-world implementations from customer deployments
- **Tool design** - Documentation, testing, and ACI principles
- **Guardrails** - Layered defense for safe, predictable agent behavior
