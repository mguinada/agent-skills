# Agent Quality & Evaluation

Comprehensive guide to evaluating and improving agent quality. See SKILL.md for core quality principles and operations.md for Agent Ops overview.

## The Paradigm Shift: From Predictable Code to Unpredictable Agents

Traditional software verification asks: "Did we build the product right?"  
Modern AI evaluation asks: "Did we build the right product?"

**Traditional software** = Delivery truck (basic checks: did it start, did it follow route?)  
**AI agents** = Formula 1 race car (continuous telemetry for every decision)

### Why Agent Quality Demands a New Approach

**Agent failures are different:**
- Subtle degradations of quality, not system crashes
- API returns 200 OK but output is profoundly wrong
- Silently eroding trust while continuing to run

**Agent Failure Modes:**

| Failure Mode | Description | Example |
|--------------|-------------|---------|
| **Algorithmic Bias** | Operationalizes/amplifies biases from training data | Financial agent over-penalizes loans based on zip codes |
| **Factual Hallucination** | Plausible-sounding but invented information | Research tool generates false historical dates |
| **Performance/Concept Drift** | Performance degrades as real-world data changes | Fraud detection agent missing new attack patterns |
| **Emergent Unintended Behaviors** | Novel/unanticipated strategies to achieve goals | Finding loopholes in rules, engaging in "proxy wars" |

## Four Pillars of Agent Quality

**Effectiveness (Goal Achievement)** - Did the agent achieve user's actual intent?
- Connects to user-centered metrics and business KPIs
- Example: "Did it drive a conversion?" not just "Did it find a product?"

**Efficiency (Operational Cost)** - Did the agent solve the problem well?
- Measured in resources consumed: tokens (cost), time (latency), trajectory complexity (steps)
- Example: 25 steps with failed tool calls = low quality even if successful

**Robustness (Reliability)** - How does the agent handle adversity?
- API timeouts, missing data, ambiguous prompts
- Graceful failure: retries, asks for clarification, reports what it couldn't do

**Safety & Alignment (Trustworthiness)** - Non-negotiable gate
- Fairness, bias prevention, prompt injection resistance
- Stays on task, refuses harmful instructions

## The "Outside-In" Evaluation Hierarchy

### Outside View: End-to-End Evaluation (The Black Box)

**First question:** "Did the agent achieve the user's goal effectively?"

**Metrics:**
- **Task Success Rate** - Binary/graded score of final output correctness
- **User Satisfaction** - Thumbs up/down, CSAT scores
- **Overall Quality** - Accuracy/completeness (e.g., "Did it summarize all 10 articles?")

### Inside View: Trajectory Evaluation (The Glass Box)

**When final output fails, analyze the trajectory:**

1. **LLM Planning (The "Thought")** - Core reasoning quality
   - Hallucinations, nonsensical responses, context pollution, repetitive loops

2. **Tool Usage (Selection & Parameterization)** - Right tool, right parameters?
   - Wrong tool selection, missing/incorrect parameters, malformed JSON

3. **Tool Response Interpretation (The "Observation")** - Understanding results
   - Misinterpreting data, failing to extract entities, not recognizing error states

4. **RAG Performance** - Retrieved information quality
   - Irrelevant retrieval, outdated information, ignoring retrieved context

5. **Trajectory Efficiency and Robustness** - Process quality
   - Excessive API calls, high latency, unhandled exceptions

6. **Multi-Agent Dynamics** - Inter-agent communication
   - Misunderstandings, communication loops, role conflicts

## The Evaluators: Who Judges Agent Quality?

### Automated Metrics

**String-based similarity** - ROUGE, BLEU (compare to references)  
**Embedding-based similarity** - BERTScore, cosine similarity (semantic closeness)  
**Task-specific benchmarks** - TruthfulQA

**Best practice:** Treat as trend indicators, not absolute quality measures. Use as "first filter" in CI/CD to catch obvious regressions.

### LLM-as-a-Judge

Use powerful model to evaluate agent outputs with detailed rubric.

**Implementation pattern:**
- Provide judge LLM with: agent output, original prompt, golden answer, evaluation rubric
- Ask for rating (1-5 scale) with reasoning
- Scalable, fast, nuanced feedback for intermediate steps

**Pairwise Comparison (More Reliable):**
1. Run evaluation set against two agent versions (old vs new)
2. Generate Answer A and Answer B for each prompt
3. Force LLM judge to choose: "Which is more helpful: A or B?"
4. Calculate win/loss/tie rate - more reliable than absolute scores

**Example prompt:**
```
You are an expert evaluator for a customer support chatbot.
[User Query] "Hi, my order #12345 hasn't arrived yet."
[Answer A] "I can see that order #12345 is currently out for delivery..."
[Answer B] "Order #12345 is on the truck. It will be there by 5."
Please evaluate which is better. Compare on correctness, helpfulness, tone.
Provide reasoning and output JSON with "winner" (A/B/tie) and "rationale".
```

### Agent-as-a-Judge

Uses one agent to evaluate full execution trace of another.

**Key evaluation dimensions:**
- **Plan quality** - Logically structured and feasible?
- **Tool use** - Right tools chosen and applied correctly?
- **Context handling** - Effective use of prior information?

**Implementation:** Feed execution trace to "Critic Agent" with specific process questions about plan, tool selection, argument correctness.

### Human-in-the-Loop (HITL) Evaluation

**Essential for:**
- **Domain Expertise** - Specialized agents (medical, legal, financial)
- **Nuanced Interpretation** - Tone, creativity, user intent, ethical alignment
- **Creating Golden Set** - Curating comprehensive evaluation benchmarks

**HITL is not "objective ground truth"** - perfect inter-annotator agreement is rare for subjective tasks. Instead, HITL establishes human-calibrated benchmark.

### User Feedback & Reviewer UI

**Feedback patterns:**
- Low-friction: thumbs up/down, quick sliders, short comments
- Context-rich: paired with full conversation and reasoning trace
- Reviewer UI: two-panel (conversation left, reasoning right), inline tagging

**Interruption workflow:** Pause agent before high-stakes tool calls, surface state in Reviewer UI for human approval.

## Responsible AI & Safety Evaluation

**Non-negotiable gate:** An agent that is 100% effective but causes harm is total failure.

**Components:**
- **Systematic Red Teaming** - Adversarial scenarios (hate speech, private info, harmful stereotypes)
- **Automated Filters & Human Review** - Technical filters + human review for nuanced bias/toxicity
- **Adherence to Guidelines** - Explicit evaluation against ethical principles

**Guardrail pattern:** Implement as structured Plugin with callbacks (before_model, after_model) rather than isolated functions.

## Observability: Seeing Inside the Agent's Mind

### The Kitchen Analogy

**Traditional Software = Line Cook** - Laminated recipe, rigid steps, monitoring = checklist  
**AI Agents = Gourmet Chef** - Mystery basket challenge, no single recipe, observability = food critic

### Three Pillars of Observability

#### Pillar 1: Logging – The Agent's Diary

**What are Logs?** - Timestamped entries, raw immutable facts about discrete events

**Effective log structure (JSON):**
- **Core Information** - Prompt/response pairs, chain-of-thought, tool calls (inputs/outputs/errors), state changes
- **Tradeoff** - Verbosity vs. Performance (DEBUG in development, INFO in production)

**Best practice:** Record intent before action and outcome after - clarifies failed attempts vs. deliberate decisions.

#### Pillar 2: Tracing – Following the Agent's Footsteps

**What is Tracing?** - Connects individual logs (spans) into coherent story showing causal relationships

**Key elements (OpenTelemetry):**
- **Spans** - Individual operations (llm_call, tool_execution)
- **Attributes** - Metadata (prompt_id, latency_ms, token_count, user_id)
- **Context Propagation** - Links spans via trace_id for full picture

**Why indispensable:** Reveals causal chain (e.g., RAG search failed → faulty tool call → LLM error → wrong answer)

#### Pillar 3: Metrics – The Agent's Health Report

**What are Metrics?** - Quantitative, aggregated health scores derived from logs/traces

**System Metrics (Vital Signs):**
- **Performance:** Latency (P50/P99), Error Rate
- **Cost:** Tokens per Task, API Cost per Run
- **Effectiveness:** Task Completion Rate, Tool Usage Frequency

**Quality Metrics (Decision-Making):**
- **Correctness & Accuracy** - Factually correct, faithful to source
- **Trajectory Adherence** - Followed intended path/ideal recipe
- **Safety & Responsibility** - Avoided harmful/biased/inappropriate content
- **Helpfulness & Relevance** - Actually helpful and relevant

### Putting It All Together

**Operational practices:**
1. **Dashboards & Alerting** - Separate System Metrics (operational) from Quality Metrics (agent effectiveness)
2. **Security & PII** - PII scrubbing before long-term storage
3. **Granularity vs. Overhead** - Dynamic sampling (DEBUG in dev, INFO + sampling in production)

## The Agent Quality Flywheel

Continuous improvement cycle with four steps:

1. **Define Quality (The Target)** - Four Pillars as concrete targets
2. **Instrument for Visibility (The Foundation)** - Structured Logs and Traces
3. **Evaluate the Process (The Engine)** - Outside-in assessment with LLM-as-Judge + HITL
4. **Architect the Feedback Loop (The Momentum)** - Every production failure → permanent regression test

## Three Core Principles for Trustworthy Agents

**Principle 1:** Treat Evaluation as an Architectural Pillar, Not a Final Step
- Build agents "evaluatable-by-design" from first line of code
- Quality is architectural choice, not final QA phase

**Principle 2:** The Trajectory is the Truth
- Final answer is last sentence of a long story
- True measure lies in end-to-end "thought process" (trajectory)
- Process Evaluation only possible through deep Observability

**Principle 3:** The Human is the Arbiter
- Automation is tool for scale; humanity is source of truth
- AI can help grade, but human writes rubric and decides what "good" means
