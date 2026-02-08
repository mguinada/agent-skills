# Implementation Guide

Practical guidance for implementing agentic systems. See SKILL.md for pattern selection.

## Start Simple

```python
# Single call with retrieval
response = claude.messages.create(
    model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": query}],
    tools=[search_tool, database_tool]
)
```

## Add Complexity Only When Needed

1. Measure performance of simple approach
2. Identify specific failure modes
3. Add targeted complexity (one pattern at a time)
4. Re-measure, iterate

## Framework Considerations

**Frameworks:** Claude Agent SDK, Agno, CrewAI, LangChain, Copilot SDK

**Tradeoff:** Quick start vs. abstraction layers obscuring prompts/responses

**Recommendation:** Start with direct LLM APIs. Most patterns need only a few lines of code. If using frameworks, understand underlying code.

## Model Selection Strategy

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

## Performance & Scalability

### Context Window Management

**The Challenge:**
- Tool definitions must be included in model context
- Many tools = large metadata overhead
- Increased cost, latency, reduced context for actual work

**Symptoms of Context Bloat:**
- Model struggles to identify relevant tools
- Erratic behavior (ignoring useful tools, invoking irrelevant ones)
- Loss of focus on user's original intent
- Degraded reasoning quality

**Mitigation Strategies:**

1. **Tool Namespace Organization**
   - Group related tools logically
   - Use clear naming hierarchies
   - Minimize tool count per agent

2. **Dynamic Tool Loading**
   - Load only relevant tools for current task
   - Implement tool retrieval vs. pre-loading all
   - Consider RAG-like approach for tool discovery

3. **Tool Definition Optimization**
   - Keep descriptions concise but complete
   - Use examples selectively (balance clarity vs. tokens)
   - Modular tools over complex multi-purpose ones

### State Management

**Challenge:** Remote MCP servers use stateful connections; REST APIs are stateless

**Solutions:**
- Build state-management layers for integration
- Consider horizontal scaling implications
- Use connection pooling for efficiency
- Implement graceful reconnection logic

### Cost Optimization

**Measure First:**
- Track token usage per agent/tool
- Monitor API call frequency
- Measure end-to-end latency

**Optimize:**
- Use smaller models for routine tasks
- Cache frequently accessed data
- Batch operations where possible
- Set appropriate timeouts
