# Agent-Computer Interface (ACI)

Tool design matters as much as prompt engineering. Tools define how agents interact with external systems.

## Design Philosophy

Treat tool interfaces with the same care as Human-Computer Interfaces (HCI). A well-designed ACI prevents errors, reduces cognitive load on the model, and improves reliability.

### Core Principles

1. **Give tokens to think** - Don't force the model into a corner where it must commit before understanding
2. **Keep formats natural** - Match patterns from training data (natural language, markdown, JSON)
3. **Minimize overhead** - Avoid line counting, escape sequences, complex validation
4. **Design for errors** - Make it hard to misuse tools (poka-yoke)
5. **Publish tasks, not APIs** - Tools should encapsulate user-facing tasks, not mirror backend APIs

## Tool Definition Best Practices

### Publish Tasks, Not API Calls

**Bad: Thin API wrapper**
```python
{
    "name": "call_jira_api",
    "description": "Call the JIRA API",
    "parameters": {
        "endpoint": {"type": "string"},
        "method": {"type": "string"},
        "body": {"type": "object"},
        "headers": {"type": "object"}
    }
}
```

**Good: Task-oriented tool**
```python
{
    "name": "create_critical_bug_in_jira_with_priority",
    "description": "Create a critical bug report in JIRA with assigned priority",
    "parameters": {
        "title": {"type": "string", "description": "Bug title"},
        "description": {"type": "string", "description": "Detailed bug description"},
        "priority": {"type": "string", "enum": ["P0", "P1", "P2"]}
    }
}
```

**Why:** APIs are designed for developers with full knowledge. Agents must decide at runtime what to do. Task-oriented tools are more discoverable and self-documenting.

### Tool Granularity

**Make tools as granular as possible:**

- Single responsibility per tool
- Clear, well-documented purpose
- Avoid multi-tool workflows encapsulated in single tool
- Each tool should answer: What does it do? When to call? Side effects? Return value?

**Exception:** When a common workflow requires many sequential calls, a single tool may be more efficient—document clearly.

### Descriptions

**Bad:**
```python
{
    "name": "edit_file",
    "description": "Edit a file",
    "parameters": {
        "file": {"type": "string"},
        "content": {"type": "string"}
    }
}
```

**Good:**
```python
{
    "name": "edit_file",
    "description": """
    Replace the entire contents of a file with new content.

    Use this when you need to completely rewrite a file. For partial edits,
    use the 'replace_section' tool instead.

    The file will be created if it doesn't exist.
    """,
    "parameters": {
        "filepath": {
            "type": "string",
            "description": "Absolute path to the file (e.g., /Users/project/file.py)"
        },
        "content": {
            "type": "string",
            "description": "Complete new file contents"
        }
    }
}
```

### Parameter Naming

**Use clear, descriptive names:**

| Bad | Good | Reason |
|-----|------|--------|
| `f` | `filepath` | Clarity over brevity |
| `txt` | `content` | Semantic meaning |
| `n` | `max_results` | Obvious from name |
| `flag` | `include_metadata` | Boolean is clear |

### Examples in Descriptions

**Include usage examples:**

```python
{
    "name": "search_code",
    "description": """
    Search codebase for matching files and code.

    Examples:
    - search_code(query="User class", language="python")
    - search_code(query="TODO comments", file_pattern="*.py")
    - search_code(query="function getName", path="/src/components/")

    Returns file paths with line numbers and matching lines.
    """,
    "parameters": {...}
}
```

### Edge Cases

**Document boundaries clearly:**

```python
{
    "name": "create_branch",
    "description": """
    Create a new git branch from the current HEAD.

    Requirements:
    - Branch name must start with feature/, fix/, or docs/
    - Branch name cannot contain spaces (use hyphens)
    - Fails if branch already exists

    Example: create_branch(name="feature/add-login")
    """,
    ...
}
```

## Format Selection

### Writing Files

**Bad: Diff format (requires line counting)**
```python
{
    "name": "apply_diff",
    "description": "Apply a diff to a file",
    "parameters": {
        "file": "...",
        "diff_lines": "Requires counting lines before writing code"
    }
}
```

**Good: Full file replacement**
```python
{
    "name": "write_file",
    "description": "Write complete file contents",
    "parameters": {
        "filepath": "...",
        "content": "Natural code, no line counting needed"
    }
}
```

### Structured Output

**Bad: JSON-embedded code**
```python
{
    "name": "generate_code",
    "parameters": {
        "code_json": json.dumps({
            "code": "function() { ... }"  # Escaping hell
        })
    }
}
```

**Good: Markdown code block**
```python
{
    "name": "generate_code",
    "parameters": {
        "response": """
        Here's the code:

        ```javascript
        function() {
            // Natural formatting
        }
        ```
        """
    }
}
```

### Why It Matters

- **Line counting** forces model to track positions → errors
- **String escaping** in JSON creates complexity → mistakes
- **Natural formats** match training data → better performance

## Common Patterns

### Read-Modify-Write

**Single tool:**
```python
{
    "name": "edit_file",
    "description": "Read, modify, and write a file atomically",
    "parameters": {
        "filepath": "...",
        "old_text": "Exact text to replace",
        "new_text": "Replacement text"
    }
}
```

**Why:** Prevents race conditions, clear intent, atomic operation

### CRUD Operations

```python
# Create
{
    "name": "create_file",
    "parameters": {
        "filepath": "...",
        "content": "Initial contents"
    }
}

# Read - Usually automatic, but can be explicit
{
    "name": "read_file",
    "parameters": {
        "filepath": "..."
    }
}

# Update
{
    "name": "update_file",
    "description": "Replace file contents (creates if doesn't exist)",
    "parameters": {
        "filepath": "...",
        "content": "New complete contents"
    }
}

# Delete
{
    "name": "delete_file",
    "parameters": {
        "filepath": "..."
    }
}
```

### Batch Operations

```python
{
    "name": "batch_edit",
    "description": """
    Edit multiple files in a single operation.

    Use when making related changes across multiple files.
    All changes are applied atomically - either all succeed or all fail.

    Example: batch_edit(edits=[
        {"filepath": "file1.py", "old_text": "foo", "new_text": "bar"},
        {"filepath": "file2.py", "old_text": "baz", "new_text": "qux"}
    ])
    """,
    "parameters": {
        "edits": {
            "type": "array",
            "items": {
                "filepath": "...",
                "old_text": "...",
                "new_text": "..."
            }
        }
    }
}
```

## Output Design

### Design for Concise Output

**Problem:** Large responses swamp context window, degrade performance

**Solutions:**
```python
# Bad: Returns entire dataset
{
    "name": "query_database",
    "returns": "Complete table with 10,000 rows"
}

# Good: Returns reference to data
{
    "name": "query_database",
    "returns": "Table name where results are stored for subsequent retrieval"
}

# Alternative: Paginated results
{
    "name": "query_database",
    "returns": {
        "result_id": "temp_table_123",
        "row_count": 10000,
        "columns": ["id", "name", "value"]
    }
}
```

**Strategies:**
- Use external storage for large data
- Return references instead of full content
- Use framework artifact services when available
- Paginated results for large datasets

### Descriptive Error Messages

**Bad:** Generic error codes
```python
{
    "error": "ERR_INVALID_INPUT"
}
```

**Good:** Actionable guidance for LLM
```python
{
    "error": "No product data found for product ID XXX. "
             "Ask the customer to confirm the product name, "
             "and look up the product ID by name to confirm you have the correct ID."
}
```

**Why:** Error messages instruct the LLM on recovery. Provide next steps, not just failure indication.

## Input Validation

### Use Schema Validation

**Always define schemas for inputs and outputs:**

```python
{
    "name": "get_product_information",
    "inputSchema": {
        "type": "object",
        "properties": {
            "product_id": {
                "type": "string",
                "description": "Unique product identifier",
                "pattern": "^[A-Z]{2}\\d{6}$"  # Validation
            }
        },
        "required": ["product_id"]
    },
    "outputSchema": {
        "type": "object",
        "properties": {
            "product_name": {"type": "string"},
            "brand": {"type": "string"},
            "status": {"type": "string", "enum": ["active", "inactive", "suspended"]}
        }
    }
}
```

**Benefits:**
- Runtime validation
- Additional documentation for LLM
- Clearer tool usage understanding

## Tool Types

### Information Retrieval Tools

Retrieve data from external sources:
- Web search, databases, document repositories
- **Design:** Clear schemas, efficient querying, handle context limitations

### Action/Execution Tools

Perform real-world operations:
- Send emails, post messages, execute code, control devices
- **Design:** Clear side effects, confirmation for destructive actions

### System/API Integration Tools

Connect with existing systems:
- Enterprise workflows, third-party services
- **Design:** Document external APIs, secure key management, error handling

### Human-in-the-Loop Tools

Facilitate human collaboration:
- Ask clarification, seek approval, hand off tasks
- **Design:** Clear UI guidance, timeout handling

## Agent Instructions vs Tool Documentation

### Describe Actions, Not Implementations

**Bad (tool-specific instructions):**
```
"To save a file, use the save_file tool with the filepath parameter..."
```

**Good (action-oriented):**
```
"Save the file to the user's project directory..."
```

**Why:** Eliminates conflict when tools change dynamically (e.g., MCP). Maintains separation of concerns.

### Principles

1. **Describe what, not how** - Explain objectives, not specific tool usage
2. **Don't duplicate instructions** - Tool documentation should live in one place
3. **Don't dictate workflows** - Allow autonomous tool selection
4. **DO explain interactions** - Document side effects between tools

## Poka-Yoke (Error Prevention)

### Absolute vs Relative Paths

**Problem:** Agent moves directories, relative paths break

**Solution:** Require absolute paths
```python
{
    "name": "read_file",
    "parameters": {
        "filepath": {
            "type": "string",
            "description": "Absolute path starting with /",
            "pattern": "^/.*"  # Validation
        }
    }
}
```

### Validation in Tool Names

```python
# Clear intent from name
{
    "name": "create_file_if_not_exists",
    "description": "Create file only if it doesn't already exist"
}

# vs ambiguous
{
    "name": "create_file",  # Will overwrite? Skip? Error?
    ...
}
```

### Required vs Optional

```python
{
    "name": "deploy",
    "parameters": {
        "environment": {
            "type": "string",
            "description": "Target environment (staging or production)",
            "required": True,
            "enum": ["staging", "production"]
        },
        "rollback_on_failure": {
            "type": "boolean",
            "description": "Automatically rollback if deployment fails",
            "required": False,
            "default": True
        }
    }
}
```

## Tool Testing

### Testing Strategy

```python
# 1. Unit test each tool
def test_search_code():
    result = search_code(query="class User")
    assert len(result.files) > 0
    assert all(f.path.endswith(".py") for f in result.files)

# 2. Test with diverse inputs
test_cases = [
    "simple query",
    "query with special chars: !@#$",
    "very long query " + "x" * 1000,
    "unicode: 你好世界",
    "edge case: nonexistent"
]

# 3. Test in agent workflows
def test_agent_with_search():
    agent = Agent(tools=[search_code, read_file])
    result = agent.run("Find the User class and explain it")
    assert "User class" in result
```

### Common Mistakes to Test For

- Tool selection (choosing wrong tool)
- Parameter formatting (wrong types, formats)
- Edge cases (empty inputs, special characters)
- Error handling (graceful failure vs crash)
- Rate limiting (handling API limits)

### Iteration Based on Testing

**What to look for:**
1. Which tools does the model misuse?
2. What parameters cause confusion?
3. Which errors occur frequently?

**Example fix from Anthropic's SWE-bench agent:**
```python
# Problem: Relative paths failed after agent moved directories
{
    "name": "edit_file",
    "parameters": {
        "path": {"type": "string"}  # Could be relative
    }
}

# Solution: Require absolute paths
{
    "name": "edit_file",
    "parameters": {
        "filepath": {
            "type": "string",
            "description": "Absolute path (e.g., /home/repo/file.py)"
        }
    }
}
```

Result: Model used flawlessly after fix.

## Organizing Tool Sets

### By Function

```python
# File operations
file_tools = [read_file, write_file, list_directory, delete_file]

# Git operations
git_tools = [create_branch, commit_changes, push, merge]

# Code analysis
analysis_tools = [search_code, find_references, analyze_structure]
```

### By Domain

```python
# Customer service
support_tools = [
    lookup_customer,
    view_order_history,
    process_refund,
    update_ticket,
    search_knowledge_base
]

# Coding agent
coding_tools = [
    read_file,
    edit_file,
    run_tests,
    search_code,
    create_branch,
    commit_changes
]
```

### Tool Overlap

**When tools are similar, distinguish clearly:**

```python
{
    "name": "search_files_by_name",
    "description": "Find files by filename pattern (e.g., '*.py', 'test_*')"
}

{
    "name": "search_file_contents",
    "description": "Find files containing specific text or code patterns"
}

{
    "name": "search_code_symbols",
    "description": "Find definitions of classes, functions, variables"
}
```

## Documentation Template

```python
{
    "name": "tool_name",

    # One-line summary
    "description": """
    Brief description of what the tool does.

    Use when: Specific scenarios for using this tool
    Don't use when: Scenarios where other tools are better

    Examples:
    - tool_name(param="value")
    - tool_name(param="another value")

    Notes:
    - Important constraints or requirements
    - Error conditions to be aware of
    """,

    "parameters": {
        "param_name": {
            "type": "string|integer|boolean|array|object",
            "description": "What this parameter does",
            "required": true|false,
            "default": "default_value_if_optional",
            "enum": ["allowed", "values"],
            "pattern": "regex_pattern"
        }
    },

    "returns": {
        "description": "What the tool returns",
        "type": "return_type",
        "fields": {
            "field1": "description",
            "field2": "description"
        }
    }
}
```

## Checklist

Before deploying tools with an agent:

- [ ] Each tool has clear, descriptive name
- [ ] Descriptions include when to use/not use
- [ ] Examples show realistic usage
- [ ] Edge cases documented
- [ ] Parameters have clear names and types
- [ ] Required vs optional clearly marked
- [ ] Format is natural (no unnecessary escaping)
- [ ] Poka-yoke applied where possible
- [ ] Tested with diverse inputs
- [ ] Similar tools clearly differentiated
- [ ] Error behavior documented
