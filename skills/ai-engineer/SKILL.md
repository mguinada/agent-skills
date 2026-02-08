---
name: ai-engineer
description: Guide for building effective AI agents and agentic workflows. Use when designing, building, or debugging agentic systems - including choosing the right agentic pattern (workflows vs agents), implementing prompt chaining/routing/parallelization/orchestrator-workers/evaluator-optimizer workflows, building autonomous agents with tools, designing Agent-Computer Interfaces (ACI) and tool specifications, or troubleshooting/optimizing existing agent implementations. Covers augmented LLMs, agentic workflows, and autonomous agents based on Anthropic's production patterns.
---

# AI Engineering

Build effective agentic systems using proven patterns. Start simple, add complexity only when needed.

## Core Principle

**Find the simplest solution first.** Agentic systems trade latency and cost for better task performance. Only increase complexity when simpler solutions fall short.

1. Start with optimized single LLM calls (retrieval, in-context examples)
2. Add workflows for predictable, multi-step tasks
3. Use agents when flexibility and autonomous decision-making are required

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

## Autonomous Agents

Agents dynamically direct their own processes and tool usage. LLM maintains control over task execution.

**Best for:** Open-ended problems where steps cannot be predicted, trusted environments

**Requirements:**
- LLM can reason, plan, use tools reliably, recover from errors
- Environmental feedback (tool results, code execution) provides ground truth
- Clear stopping conditions (completion, checkpoints, max iterations)

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

Based on Anthropic's "Building Effective AI Agents":
- Augmented LLMs as foundation
- Workflows vs. Agents architectural distinction
- Production patterns from customer implementations
- Tool documentation and testing importance
