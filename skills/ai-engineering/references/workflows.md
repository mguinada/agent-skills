# Workflows Reference

Detailed patterns for agentic workflows with code examples and variations.

## Prompt Chaining

### Pattern
Sequential LLM calls where each processes the previous output.

### Variations

#### Linear Chain
```python
def linear_chain(input_text):
    # Step 1: Extract
    key_points = llm("Extract key points from: " + input_text)

    # Step 2: Summarize
    summary = llm("Summarize these points: " + key_points)

    # Step 3: Format
    formatted = llm("Format as bullet list: " + summary)
    return formatted
```

#### Chain with Gate
```python
def chained_with_gate(input_text):
    outline = llm("Create outline for: " + input_text)

    # Gate: Validate quality
    validation = llm(f"Does this outline meet criteria? {outline}")
    if "no" in validation.lower():
        outline = llm(f"Revise outline: {outline}")

    content = llm(f"Write content from outline: {outline}")
    return content
```

#### Branching Chain
```python
def branching_chain(input_text):
    first_pass = llm("Draft response to: " + input_text)

    # Parallel evaluation
    tone_check = llm(f"Check tone: {first_pass}")
    fact_check = llm(f"Verify facts: {first_pass}")

    # Conditional revision
    if tone_check == "inappropriate" or fact_check == "errors found":
        return llm(f"Revise: {first_pass}\nTone: {tone_check}\nFacts: {fact_check}")
    return first_pass
```

### Use Cases
- Content creation pipelines
- Multi-step document processing
- Validation workflows
- Translation with quality checks

## Routing

### Pattern
Classify input to specialized handler.

### Implementations

#### LLM Router
```python
def llm_router(user_input):
    route = llm(f"""
    Classify this query into one of:
    - technical_support
    - billing
    - general_question
    - refund_request

    Query: {user_input}
    Return only the category name.
    """)

    handlers = {
        "technical_support": handle_technical,
        "billing": handle_billing,
        "general_question": handle_general,
        "refund_request": handle_refund,
    }

    return handlers.get(route, handle_general)(user_input)
```

#### Model Router (Cost Optimization)
```python
def model_router(query):
    complexity = llm(f"Rate query complexity (simple/complex): {query}")

    if "simple" in complexity.lower():
        return claude_haiku.generate(query)  # Cheaper
    else:
        return claude_sonnet.generate(query)  # More capable
```

#### Hybrid Router
```python
def hybrid_router(input_data):
    # Fast classification for known categories
    if input_data.startswith("/"):
        return command_handler(input_data)

    # LLM classification for ambiguous input
    category = llm.classify(input_data)

    # Specialized models per category
    return ROUTES[category].process(input_data)
```

### Use Cases
- Customer service triage
- Cost optimization through model selection
- Multi-language routing
- Specialized domain handling

## Parallelization

### Sectioning Pattern
```python
def sectioning(task):
    # Break into independent subtasks
    subtasks = llm(f"Divide into independent parts: {task}")

    # Execute in parallel
    with ThreadPoolExecutor() as executor:
        results = list(executor.map(
            lambda t: llm(t),
            subtasks
        ))

    # Combine results
    return llm(f"Combine these results: {results}")
```

### Voting Pattern
```python
def voting(prompt, num_votes=5):
    # Multiple attempts for confidence
    responses = [llm(prompt) for _ in range(num_votes)]

    # Aggregate by voting
    from collections import Counter
    most_common = Counter(responses).most_common(1)[0][0]

    return most_common
```

### Ensemble Pattern (Specialized Prompts)
```python
def ensemble(input_text):
    # Different perspectives in parallel
    safety_check = llm(f"Safety check: {input_text}")
    quality_check = llm(f"Quality assessment: {input_text}")
    factual_check = llm(f"Fact verification: {input_text}")

    # Combine judgments
    if all([safety_check, quality_check, factual_check]):
        return "approved"
    return "review needed"
```

### Use Cases
- **Sectioning:** Guardrails, multi-aspect evaluation, batch processing
- **Voting:** Content moderation, vulnerability scanning, error detection

## Orchestrator-Workers

### Basic Pattern
```python
def orchestrator_workers(task):
    # Orchestrator: Plan decomposition
    subtasks = orchestrator.llm(f"""
    Analyze this task and break it into independent subtasks:
    {task}

    Return subtasks as a list.
    """)

    # Workers: Execute in parallel
    with ThreadPoolExecutor() as executor:
        worker_results = list(executor.map(
            worker.llm,
            subtasks
        ))

    # Orchestrator: Synthesize
    result = orchestrator.llm(f"""
    Synthesize these results into a coherent response:
    {worker_results}
    """)

    return result
```

### Dynamic Workforce
```python
def dynamic_workers(task):
    # Determine needed workers
    worker_types = orchestrator.llm(f"""
    What types of workers are needed for: {task}
    Options: researcher, writer, analyst, fact_checker
    """)

    # Assign subtasks to specialized workers
    results = {}
    for worker_type in worker_types:
        subtask = orchestrator.llm(f"What should {worker_type} do for {task}?")
        results[worker_type] = WORKERS[worker_type].llm(subtask)

    return orchestrator.llm(f"Synthesize: {results}")
```

### Hierarchical Orchestration
```python
def hierarchical_orchestration(complex_task):
    # Top-level: Major phases
    phases = top_orchestrator.llm(f"Break into phases: {complex_task}")

    all_results = []
    for phase in phases:
        # Sub-orchestrator: Tasks within phase
        subtasks = sub_orchestrator.llm(f"Break phase into tasks: {phase}")

        # Workers: Execute tasks
        results = [worker.llm(t) for t in subtasks]
        all_results.extend(results)

    # Synthesize final output
    return top_orchestrator.llm(f"Final synthesis: {all_results}")
```

### Use Cases
- Complex coding tasks (multi-file changes)
- Research across multiple sources
- Document analysis with multiple aspects
- Multi-step problem solving

## Evaluator-Optimizer

### Basic Loop
```python
def evaluator_optimizer(initial_prompt, max_rounds=3):
    response = llm(initial_prompt)

    for _ in range(max_rounds):
        # Evaluate current response
        critique = evaluator.llm(f"""
        Critique this response for:
        - Accuracy
        - Completeness
        - Clarity
        - Style

        Response: {response}
        """)

        # Check if satisfactory
        is_good = evaluator.llm(f"Is this satisfactory? {critique}")
        if "yes" in is_good.lower():
            break

        # Improve based on critique
        response = optimizer.llm(f"""
        Improve this response based on critique:
        Response: {response}
        Critique: {critique}
        """)

    return response
```

### Multi-Criteria Evaluation
```python
def multi_criteria_optimizer(content):
    response = content

    criteria = ["accuracy", "clarity", "engagement", "seo_friendly"]

    for criterion in criteria:
        for _ in range(3):  # Max 3 attempts per criterion
            evaluation = evaluator.llm(f"""
            Evaluate {criterion}: {response}
            Score 1-10 and suggest improvements.
            """)

            if evaluation.score >= 8:
                break

            response = optimizer.llm(f"""
            Improve {criterion}:
            Content: {response}
            Feedback: {evaluation.suggestions}
            """)

    return response
```

### Self-Reflection Pattern
```python
def self_reflection(task):
    # Generate initial response
    response = llm(f"Complete this task: {task}")

    # Agent critiques its own work
    critique = llm(f"""
    You just completed: {task}
    Your response was: {response}

    Critique your own work. What could be improved?
    """)

    # Agent improves based on critique
    improved = llm(f"""
    Original: {response}
    Critique: {critique}

    Provide an improved version.
    """)

    return improved
```

### Use Cases
- **Content refinement:** Writing, translation, creative work
- **Code improvement:** Refactoring, optimization, bug fixing
- **Search enhancement:** Multi-round information gathering
- **Quality assurance:** Systematic improvement against criteria

## Pattern Combinations

### Routing + Chaining
```python
def route_then_chain(user_input):
    # Route to appropriate chain
    category = router.llm(user_input)

    chains = {
        "writing": writing_chain,
        "coding": coding_chain,
        "analysis": analysis_chain
    }

    return chains[category](user_input)
```

### Orchestrator + Evaluator-Optimizer
```python
def orchestrated_with_evaluation(task):
    # Orchestrate subtasks
    result = orchestrator_workers(task)

    # Evaluate and optimize final result
    for _ in range(3):
        critique = evaluator.llm(f"Evaluate: {result}")
        if "good" in critique.lower():
            break
        result = optimizer.llm(f"Improve: {result}\nFeedback: {critique}")

    return result
```

### Parallel + Voting + Evaluator-Optimizer
```python
def robust_processing(input_data):
    # Parallel attempts
    attempts = [llm(input_data) for _ in range(5)]

    # Vote for best
    best = voting(attempts)

    # Evaluate and optimize
    for _ in range(3):
        if evaluator.llm(f"Quality check: {best}") == "pass":
            break
        best = optimizer.llm(f"Improve: {best}")

    return best
```

## Implementation Tips

### Error Handling
```python
def safe_workflow(input_data, max_retries=3):
    for attempt in range(max_retries):
        try:
            return workflow(input_data)
        except LLMParsingError as e:
            if attempt == max_retries - 1:
                raise
            # Adjust prompt for retry
            input_data = clarify_input(input_data)
```

### State Management
```python
def stateful_chain(initial_input):
    state = {"input": initial_input, "history": []}

    for step in workflow_steps:
        result = step(llm, state)
        state["history"].append(result)
        state["last_result"] = result

    return state
```

### Monitoring
```python
def monitored_workflow(input_data):
    with WorkflowTracer(name="workflow_name") as tracer:
        for step in steps:
            tracer.log_step_start(step.name)
            result = step(input_data)
            tracer.log_step_complete(step.name, result)

    return tracer.final_result()
```
