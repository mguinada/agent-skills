# Real-World AI Agent Examples

Production patterns and implementations from industry experience.

## Customer Support Agent

### Architecture

```
User Query → Router → Specialist Agents → Tools → Response
                 ↓
            Knowledge Base + Customer Data
```

### Why It Works

1. **Natural conversation flow** - Chatbots are familiar interface
2. **Clear success criteria** - Issue resolution is measurable
3. **External integration** - Customer data, orders, policies
4. **Programmatic actions** - Refunds, updates, escalations

### Implementation

```python
class CustomerSupportAgent:
    def __init__(self):
        self.tools = [
            LookupCustomer(),
            ViewOrderHistory(),
            ProcessRefund(),
            UpdateTicket(),
            SearchKnowledgeBase(),
            EscalateToHuman()
        ]

        self.router = self._build_router()

    def _build_router(self):
        """Route to appropriate specialist"""
        return {
            "billing": BillingSpecialist(self.tools),
            "technical": TechnicalSupportSpecialist(self.tools),
            "general": GeneralSupportSpecialist(self.tools),
            "refund": RefundSpecialist(self.tools)
        }

    def handle_query(self, user_message, customer_id=None):
        # Identify customer if provided
        context = {}
        if customer_id:
            context = self.tools[0].execute(customer_id)

        # Route to specialist
        category = self._classify_query(user_message)
        specialist = self.router[category]

        # Handle with full context
        return specialist.handle(user_message, context)
```

### Specialist Pattern

```python
class RefundSpecialist:
    def __init__(self, tools):
        self.tools = tools
        self.evaluator = RefundEvaluator()

    def handle(self, message, context):
        # Gather relevant information
        order_id = self._extract_order(message)
        order_details = self.tools[1].execute(order_id)

        # Check refund eligibility
        if not self.evaluator.is_eligible(order_details, context):
            return self._explain_denial(order_details)

        # Process refund
        refund_amount = self._calculate_refund(order_details)
        result = self.tools[2].execute(order_id, refund_amount)

        return self._format_refund_confirmation(result)
```

### Success Metrics

- Resolution rate (issues solved without human)
- Customer satisfaction scores
- Average handle time
- Refund accuracy (correct amount, correct orders)

### Production Considerations

- **Guardrails**: Never process refunds over $X without approval
- **Audit trail**: Log all actions for review
- **Human escalation**: Clear criteria for when to involve humans
- **Compliance**: Respect refund policies, regional regulations

## Coding Agent

### Architecture

```
Issue Description → Parser → Planner → Editor → Test Runner
                                              ↓
                                         (Iterate if fail)
```

### Why It Works

1. **Verifiable output** - Tests pass/fail provides clear feedback
2. **Structured problem space** - Code has defined syntax and semantics
3. **Objective quality** - Tests, linting, type checking
4. **Iterative improvement** - Can try again based on test results

### Implementation

```python
class CodingAgent:
    def __init__(self, repo_path):
        self.repo = GitRepository(repo_path)
        self.tools = [
            ReadFile(),
            EditFile(),
            RunTests(),
            SearchCode(),
            CreateBranch(),
            CommitChanges()
        ]

    def solve_issue(self, issue_description):
        # Parse and understand the issue
        understanding = self._analyze_issue(issue_description)

        # Create working branch
        branch_name = self._generate_branch_name(understanding)
        self.tools[4].execute(branch_name)

        # Plan the changes
        plan = self._create_plan(understanding)
        plan = self._refine_plan_with_context(plan)

        # Execute plan with test verification
        for step in plan.steps:
            result = self._execute_step(step)

            if result.tests_failed:
                step = self._fix_failures(step, result.test_output)

        # Final verification
        if self._all_tests_pass():
            return self.tools[5].execute(plan.summary)

        return {"status": "failed", "reason": "Tests failing"}
```

### Plan-Execute-Verify Loop

```python
def _execute_step(self, step):
    """Execute a single step with verification"""
    # Make the change
    for edit in step.edits:
        self.tools[1].execute(
            filepath=edit.filepath,
            old_text=edit.old_text,
            new_text=edit.new_text
        )

    # Run tests
    test_result = self.tools[2].execute(
        tests=step.related_tests
    )

    if test_result.passed:
        return {"status": "success"}

    # Analyze failure
    failure_analysis = self._analyze_test_failure(
        test_result.output,
        step.edits
    )

    return {
        "status": "failed",
        "tests_failed": test_result.failed_tests,
        "analysis": failure_analysis
    }
```

### Failure Recovery

```python
def _fix_failures(self, step, test_output):
    """Attempt to fix test failures"""
    # Analyze what went wrong
    diagnosis = self._diagnose_failure(test_output, step)

    # Generate fix
    fix_plan = self.llm(f"""
    The following change caused test failures:

    Changes made: {step.edits}
    Test output: {test_output}

    Diagnosis: {diagnosis}

    Generate a fix for these failures.
    """)

    # Apply fix
    return self._apply_fix_plan(fix_plan)
```

### SWE-bench Pattern

Based on Anthropic's SWE-bench implementation:

1. **Parse PR description** - Extract issue requirements
2. **Search codebase** - Find relevant files
3. **Create plan** - Determine which files to change and how
4. **Execute changes** - Edit files with test verification
5. **Run tests** - Verify each change
6. **Iterate on failures** - Fix based on test output
7. **Final validation** - All tests pass

### Key Tools for Coding

```python
{
    "name": "search_and_replace",
    "description": """
    Search for code pattern and replace across files.

    Use for renaming, refactoring, updating imports.
    Shows diff preview before applying changes.
    """,
    "parameters": {
        "search_pattern": "Regex or literal string to find",
        "replacement": "Replacement string",
        "file_pattern": "Glob pattern for files to search",
        "preview_only": "Show changes without applying"
    }
}

{
    "name": "run_specific_tests",
    "description": """
    Run specific tests related to changes.

    Automatically determines relevant tests based on files changed.
    Returns detailed output including failures and stack traces.
    """,
    "parameters": {
        "changed_files": "List of files that were modified",
        "test_framework": "pytest, unittest, jest, etc."
    }
}
```

### Production Considerations

- **Sandboxing** - Run tests in isolated environment
- **Resource limits** - CPU, memory, timeout constraints
- **Human review** - Always require approval before merge
- **Rollback capability** - Easy to discard failed attempts

## Research Agent

### Architecture

```
Query → Expansion → Parallel Search → Synthesis → Citation
```

### Implementation

```python
class ResearchAgent:
    def __init__(self):
        self.tools = [
            WebSearch(),
            FetchDocument(),
            ExtractContent(),
            SemanticSearch(),
            CompileCitations()
        ]

    def research(self, query):
        # Expand query into research questions
        questions = self._expand_query(query)

        # Parallel research
        with ThreadPoolExecutor() as executor:
            findings = list(executor.map(
                self._research_question,
                questions
            ))

        # Synthesize findings
        report = self._synthesize(findings)

        # Add citations
        cited_report = self._add_citations(report, findings)

        return cited_report
```

## Data Analysis Agent

### Architecture

```
Data → Profiler → Analysis Router → Specialist → Visualization
```

### Implementation

```python
class DataAnalysisAgent:
    def __init__(self):
        self.tools = [
            LoadDataFrame(),
            StatisticalSummary(),
            PlotChart(),
            RunModel(),
            ExportResults()
        ]

    def analyze(self, data_path, question):
        # Load and profile data
        df = self.tools[0].execute(data_path)
        profile = self.tools[1].execute(df)

        # Determine analysis type
        analysis_type = self._classify_analysis(question, profile)

        # Route to specialist
        if analysis_type == "descriptive":
            return self._descriptive_analysis(df, question)
        elif analysis_type == "predictive":
            return self._predictive_analysis(df, question)
        elif analysis_type == "diagnostic":
            return self._diagnostic_analysis(df, question)
```

## Content Creation Agent

### Architecture

```
Brief → Research → Outline → Draft → Review → Final
```

### Evaluator-Optimizer Pattern

```python
class ContentAgent:
    def __init__(self):
        self.creator = CreatorLLM()
        self.evaluator = EvaluatorLLM()

    def create_content(self, brief):
        # Generate initial content
        content = self.creator.execute(brief)

        # Evaluate and optimize
        for _ in range(3):
            evaluation = self.evaluator.evaluate(content, brief)

            if evaluation.is_satisfactory:
                break

            content = self.creator.improve(
                content,
                evaluation.feedback
            )

        return content
```

## Deployment Checklist

Before deploying any agent to production:

### Functional Requirements
- [ ] Core functionality tested on diverse inputs
- [ ] Error handling prevents cascading failures
- [ ] Tools work independently (unit tested)
- [ ] Workflow produces correct outputs

### Safety & Reliability
- [ ] Maximum iteration limits set
- [ ] Resource constraints (CPU, memory, time)
- [ ] Human checkpoint requirements defined
- [ ] Rollback mechanism available

### Monitoring
- [ ] Success/failure metrics tracked
- [ ] Cost per operation measured
- [ ] Latency monitored
- [ ] Error logging comprehensive

### Compliance
- [ ] Data handling policies followed
- [ ] Access controls implemented
- [ ] Audit trail maintained
- [ ] Human review requirements defined

## Performance Patterns

### Cost Optimization

```python
# Model routing for cost efficiency
def route_by_complexity(query):
    complexity = classify_complexity(query)

    if complexity == "simple":
        return claude_haiku  # 1x cost
    elif complexity == "medium":
        return claude_sonnet  # 3x cost
    else:
        return claude_opus  # 15x cost, only when needed
```

### Latency Optimization

```python
# Parallel processing for speed
def parallel_analysis(data):
    with ThreadPoolExecutor() as executor:
        results = executor.map(analyze_aspect, aspects)
    return combine_results(results)
```

### Caching Strategy

```python
# Cache expensive operations
@cache_result(ttl=3600)
def expensive_lookup(query):
    return search_database(query)
```

## Measuring Success

### Quantitative Metrics
- **Task success rate** - Percentage of tasks completed successfully
- **Time to completion** - Average time per task
- **Cost per task** - Compute and API costs
- **Human intervention rate** - How often human help is needed

### Qualitative Metrics
- **Output quality** - Human evaluation of results
- **User satisfaction** - Feedback scores
- **Error patterns** - Common failure modes
- **Edge case handling** - Performance on unusual inputs

### Iteration Cycle

1. **Measure** - Collect metrics on production usage
2. **Analyze** - Identify patterns in failures and successes
3. **Hypothesize** - Propose improvements
4. **Implement** - Make targeted changes
5. **Validate** - A/B test against baseline
6. **Deploy** - Roll out improvements
