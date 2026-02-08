# Operations & Security

Agent operations, security, and learning patterns for production agentic systems.

## Agent Ops (GenAIOps)

The transition from deterministic software to stochastic agentic systems requires a new operational philosophy. Traditional unit tests don't work when responses are probabilistic by design.

### Evaluation Strategy

**Define Success Metrics First**
Frame observability like an A/B test. Key Performance Indicators should include:
- Goal completion rates
- User satisfaction scores
- Task latency
- Operational cost per interaction
- Business impact (revenue, conversion, retention)

**LM as Judge**
Since simple pass/fail is impossible, use an "LM as Judge" pattern:
- Use a powerful model to assess agent output against a predefined rubric
- Evaluate: factual accuracy, instruction following, tone, completeness
- Run against a golden dataset of prompts and expected responses
- Creating eval datasets is tedious but pays off quickly

**Metrics-Driven Development**
1. Create evaluation scenarios with golden questions and correct responses
2. Run new version against entire dataset
3. Compare scores to existing production version
4. Use A/B deployments for real-world validation

### Observability and Debugging

**OpenTelemetry Traces**
Traces provide step-by-step recording of an agent's execution path:
- Exact prompt sent to model
- Model's internal reasoning (if available)
- Specific tool chosen and parameters generated
- Raw data returned as observation
- Full trajectory for root cause analysis

**Human Feedback Loop**
User feedback is your most valuable resource for improvement:
- Collect bug reports, "thumbs down" clicks, and edge cases
- Tie occurrences back to analytics platform
- Convert real-world failures into permanent test cases
- "Close the loop" by vaccinating system against entire error classes

### Deployment Considerations

**Containerization and Scaling**
- Agents can be containerized and deployed to standard runtimes
- Use scale-to-zero for irregular traffic patterns
- Use dedicated capacity for mission-critical, latency-sensitive workloads
- Monitor both cost and performance comprehensively

## Agent Identity and Security

Agents introduce a new class of principal in security architecture, distinct from both human users and service accounts.

### Agent as a Principal

| Principal Type | Authentication | Characteristics |
|----------------|----------------|-----------------|
| **Users** | OAuth/SSO | Human actors with full autonomy and responsibility |
| **Agents** | SPIFFE/cryptographic identity | Delegated authority, acts on behalf of users |
| **Service Accounts** | IAM integration | Fully deterministic, no responsibility for actions |

Each agent requires a verifiable digital identity with least-privilege permissions. This granular control ensures blast radius containment if a single agent is compromised.

### Security Layers

**Deterministic Guardrails (Layer 1)**
- Hardcoded rules acting as security chokepoint
- Policy engine blocks purchases over thresholds
- Requires explicit confirmation before external API calls

**Reasoning-Based Defenses (Layer 2)**
- Adversarial training for model resilience
- Smaller "guard models" that evaluate proposed plans
- Flag risky or policy-violating steps for review

**Policy Enforcement**
- Apply principle of least privilege
- Constrain access to tools, data, agents, and context sharing
- Build guardrails into tools, models, and sub-agents

### Tool Security Threats

**Dynamic Capability Injection**
- **Risk:** MCP servers or tool providers change available tools without notification, causing agents to inherit unauthorized capabilities
- **Example:** A poetry agent connects to a Books server for quotes, but the server adds a purchasing capability—suddenly the agent can make financial transactions
- **Mitigation:** Explicit tool allowlists, mandatory change notifications, tool version pinning, API gateways

**Tool Shadowing**
- **Risk:** Malicious tools use broader triggers to overshadow legitimate tools, intercepting sensitive operations
- **Example:** Malicious `save_secure_note` tool triggers on "save", "store", "keep"—overshadowing legitimate `secure_storage_service`
- **Mitigation:** Prevent naming collisions, mutual TLS, deterministic policy enforcement, human-in-the-loop for high-risk operations

**Confused Deputy Problem**
- **Risk:** Privileged server (deputy) tricked by less-privileged entity into misusing its authority
- **Example:** AI assistant asks MCP server to create a branch with sensitive code—server has permission but user doesn't
- **Mitigation:** Validate user permissions before executing server actions, never assume AI agent's authority equals user's

**Malicious Tool Definitions**
- **Risk:** Tool descriptors manipulate agent planners or consume external content with prompt injection
- **Example:** Tool descriptions designed to trigger on specific patterns, or tool results containing injectable prompts
- **Mitigation:** Input/output sanitization, separate system prompts, allowlist validation for resources

**Sensitive Information Leaks**
- **Risk:** Tools unintentionally receive or exfiltrate sensitive data through conversation context
- **Example:** User interaction history transmitted to tool, or Elicitation capability abused to gather sensitive info
- **Mitigation:** Structured outputs with taint tracking, scoped credentials, keep secrets out of agent context

**No Per-Tool Authorization**
- **Risk:** MCP only supports coarse-grained auth, no per-tool or per-resource scope
- **Mitigation:** Scoped credentials with audience validation, principle of least privilege, secrets transmitted via side channels

### Multi-Layered Defense Strategy

```
┌─────────────────────────────────────────────┐
│          Human-in-the-Loop (HIL)            │  ← Final approval for high-risk ops
├─────────────────────────────────────────────┤
│          API Gateway / Policy Layer         │  ← Tool filtering, audit logging
├─────────────────────────────────────────────┤
│          Agent SDK with Allowlists          │  ← Explicit permitted tools
├─────────────────────────────────────────────┤
│          Tool Schema Validation             │  ← Input/output validation
├─────────────────────────────────────────────┤
│          Secure Tool Design                 │  ← Descriptive errors, no secrets
└─────────────────────────────────────────────┘
```

## Agent Learning and Self-Evolution

Agents deployed in dynamic environments must adapt to maintain performance—manual updates don't scale.

### Learning Sources

**Runtime Experience**
- Session logs, traces, and memory
- Successes, failures, tool interactions
- Human-in-the-loop feedback (authoritative corrections)

**External Signals**
- Updated enterprise policies
- New regulatory guidelines
- Critiques from other agents

### Adaptation Techniques

**Enhanced Context Engineering**
- Continuously refine prompts and few-shot examples
- Optimize information retrieved from memory
- Increase success likelihood through better context

**Tool Optimization and Creation**
- Identify capability gaps through reasoning
- Gain access to new tools
- Create tools on the fly (e.g., Python scripts)
- Modify existing tools (e.g., update API schemas)

### Advanced Learning Patterns

**Multi-Agent Learning Workflow**
1. Querying Agent retrieves raw data
2. Reporting Agent synthesizes into draft
3. Critiquing Agent reviews against compliance guidelines
4. Human expert provides corrective feedback on ambiguities
5. Learning Agent generalizes feedback into reusable guidelines

This creates a loop where the system autonomously adapts to evolving requirements without complete reengineering.
