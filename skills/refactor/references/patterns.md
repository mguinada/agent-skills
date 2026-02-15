# Refactoring Patterns Reference

Common refactoring patterns with before/after examples.

**Language Agnostic**: Examples use Python syntax; port to your project's language while preserving the underlying patterns and principles.

## Prompt Refactoring Patterns

When code contains prompts or prompt templates, apply these patterns to simplify and maintain clarity.

### Extract Prompt Template

```python
# Before - Prompt embedded in code
def generate_response(topic):
    prompt = f"""You are an expert on {topic}. Please provide a detailed explanation
of the key concepts, history, and modern applications. Include specific examples
and make it accessible to beginners."""
    return llm.complete(prompt)

# After - Extracted template
EXPERT_SYSTEM_PROMPT = """You are an expert on {topic}.

Provide a detailed explanation covering:
- Key concepts
- Historical context
- Modern applications

Include specific examples and keep it accessible to beginners."""

def generate_response(topic: str) -> str:
    return llm.complete(EXPERT_SYSTEM_PROMPT.format(topic=topic))
```

### Extract Few-Shot Examples

```python
# Before - Examples inline with prompt
def classify_sentiment(text):
    prompt = f"""Classify the sentiment as positive, negative, or neutral.

Example 1: "I love this product!" -> positive
Example 2: "This is terrible." -> negative
Example 3: "It's okay, nothing special." -> neutral

Input: "{text}"
Classification:"""
    return llm.complete(prompt)

# After - Examples extracted separately
SENTIMENT_EXAMPLES = [
    ("I love this product!", "positive"),
    ("This is terrible.", "negative"),
    ("It's okay, nothing special.", "neutral"),
]

def build_few_shot_prompt(examples: list[tuple[str, str]], input_text: str) -> str:
    """Build a few-shot prompt from example pairs."""
    examples_text = "\n".join(
        f'Example {i+1}: "{input_text}" -> {label}'
        for i, (input_text, label) in enumerate(examples)
    )
    return f"""Classify the sentiment as positive, negative, or neutral.

{examples_text}

Input: "{input_text}"
Classification:"""

def classify_sentiment(text: str) -> str:
    return llm.complete(build_few_shot_prompt(SENTIMENT_EXAMPLES, text))
```

### Simplify Prompt Output Format

```python
# Before - Complex parsing logic required
def extract_entities(text):
    prompt = f"""Extract all entities from the following text. Return them in
any format you like, just make sure to include the entity type and value.

Text: {text}"""
    response = llm.complete(prompt)
    # Complex parsing needed...
    return parse_entities(response)

# After - Structured output request
def extract_entities(text: str) -> list[dict]:
    prompt = f"""Extract all entities from the following text.

Return JSON array with {{"type": "...", "value": "..."}} format.

Text: {text}"""
    response = llm.complete(prompt)
    return json.loads(response)
```

---

## Single Responsibility Principle

Extract functions so each has one clear purpose:

```python
# Before - Multiple responsibilities
def process_order(items, tax_rate, user):
    subtotal = sum(item.price for item in items)
    tax = subtotal * tax_rate
    total = subtotal + tax
    send_email(user.email, f"Order total: {total}")
    update_inventory(items)
    return total

# After - Single responsibilities
def calculate_subtotal(items: list[Item]) -> float:
    return sum(item.price for item in items)

def calculate_tax(subtotal: float, tax_rate: float) -> float:
    return subtotal * tax_rate

def calculate_total(items: list[Item], tax_rate: float) -> float:
    subtotal = calculate_subtotal(items)
    return subtotal + calculate_tax(subtotal, tax_rate)
```

## Replace Magic Numbers with Constants

```python
# Before
def calculate_total(items):
    return sum(item.price for item in items) * 1.08

# After
DEFAULT_TAX_RATE = 0.08

def calculate_total(items: list[Item]) -> float:
    return sum(item.price for item in items) * (1 + DEFAULT_TAX_RATE)
```

## Prefer Functional Patterns

```python
# Before - Imperative
result = []
for item in items:
    if item.is_active:
        result.append(item.price)

# After - Functional
def get_active_item_prices(items: list[Item]) -> Iterator[float]:
    return (item.price for item in items if item.is_active)
```

## Separate Business Logic from I/O

```python
# Before - Mixed concerns
def process_user(user_id):
    user = db.query(User).get(user_id)
    formatted = f"Name: {user.name}, Email: {user.email}"
    print(formatted)

# After - Separated
def format_user_info(user: User) -> str:
    return f"Name: {user.name}, Email: {user.email}"

def display_user(user_id: int) -> None:
    user = db.query(User).get(user_id)
    print(format_user_info(user))
```
