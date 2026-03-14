---
name: tdd
description: "Guide Test-Driven Development workflow (Red-Green-Refactor) for new features, bug fixes, and refactoring. Supports both Python (pytest) and Ruby (RSpec). Use when writing tests, implementing features, or following TDD methodology. **PROACTIVE ACTIVATION**: Auto-invoke when implementing features or fixing bugs in projects with test infrastructure. **DETECTION**: Check for tests/ directory, pytest.ini, pyproject.toml with pytest config, spec/ directory, .rspec file, or *_spec.rb files. **USE CASES**: Writing production code, fixing bugs, adding features, legacy code characterization."
author: mguinada
version: 2.3.0
tags: [TDD, test driven development, testing, red-green-refactor, rspec, pytest, code-quality, coverage]
---

# Test-Driven Development

Guide for Red-Green-Refactor workflow. Supports Python (pytest) and Ruby (RSpec).

## Quick Reference

| | Python (pytest) | Ruby (RSpec) |
|---|---|---|
| **Naming** | `test_<fn>_<scenario>_<expected>` | `describe ".method"` / `"#method"` |
| **Structure** | Mirror `src/` in `tests/` | One expectation per `it` |
| **Data** | `@pytest.fixture` + type hints | `let` / `let!` |
| **Variants** | `@pytest.mark.parametrize` | `context` blocks |
| **Exceptions** | `pytest.raises(Error, match=)` | `expect { }.to raise_error` |
| **Run** | `uv run pytest` | `bundle exec rspec` |
| **Lint** | `uv run ruff check src/` | `bundle exec rubocop` |

---

## The Cycle

### 🔴 RED → Write a failing test

Write the smallest test that defines the desired behavior. Confirm it fails.

### 🟢 GREEN → Make it pass

Write minimal production code. Run tests until they pass.

### 🔵 REFACTOR → Improve

Clean up test and production code. Ensure tests still pass.

> **Use the `refactor` skill** for systematic code improvement during this phase.

---

## Scenarios

### New Feature

Follow the Red-Green-Refactor cycle. Start with one test, make it pass, then add the next.

<details>
<summary>Example: Testing a new function</summary>

**Python:**
```python
import pytest
from src.cart import calculate_total, Item


class TestCalculateTotal:
    @pytest.mark.parametrize("items,expected", [
        ([], 0.0),
        ([Item("Coke", 1.50)], 1.50),
    ], ids=["empty", "single"])
    def test_with_valid_items_returns_total(
        self, items: list[Item], expected: float
    ) -> None:
        assert calculate_total(items) == expected

    def test_with_negative_price_raises_error(self) -> None:
        with pytest.raises(ValueError, match="Price cannot be negative"):
            calculate_total([Item("Coke", -1.50)])
```

**Ruby:**
```ruby
RSpec.describe Cart do
  describe '#calculate_total' do
    subject { described_class.calculate_total(items) }

    context 'when cart is empty' do
      let(:items) { [] }
      it { is_expected.to eq(0.0) }
    end

    context 'when item has negative price' do
      let(:items) { [Item.new(name: 'Coke', price: -1.50)] }
      it { expect { subject }.to raise_error(ArgumentError, /Price cannot be negative/) }
    end
  end
end
```
</details>

### Bug Fix

**Never fix a bug without writing a test first.**

1. Write test reproducing the bug
2. Confirm test fails
3. Fix the bug
4. Confirm test passes

<details>
<summary>Example: Bug fix test</summary>

**Python:**
```python
def test_calculate_total_with_negative_price_raises_value_error(self) -> None:
    """Regression test for issue #123: negative prices should raise."""
    items = [Item(name="Coke", price=-1.50)]
    with pytest.raises(ValueError, match="Price cannot be negative"):
        calculate_total(items)
```

**Ruby:**
```ruby
context 'when item has negative price' do
  # Regression test for issue #123
  let(:items) { [Item.new(name: 'Coke', price: -1.50)] }

  it 'raises ArgumentError' do
    expect { subject }.to raise_error(ArgumentError, /Price cannot be negative/)
  end
end
```
</details>

### Legacy Code

1. Write characterization tests capturing current behavior
2. Run tests to establish baseline
3. Make small changes with test coverage
4. Refactor incrementally

---

## Refactoring Opportunities

After each cycle, check for:

**Implementation:**
- Duplicate logic → Consolidate
- Long functions → Break down
- Unclear naming → Rename
- Complex conditionals → Simplify

**Tests:**
- Redundant tests → Parametrize
- Duplicate fixtures → Extract to shared
- Testing private methods → Test public interface instead
- Vague assertions → Make specific

---

## Best Practices

<details>
<summary><strong>Python (pytest)</strong></summary>

### Organization
- `test_*.py` naming, mirror `src/` structure
- Group related tests in classes

### Naming
```python
# Good
def test_calculate_tax_with_negative_amount_raises_value_error():
    pass

# Bad - too vague
def test_calculate_tax():  # ❌
    pass
```

### Fixtures
```python
@pytest.fixture
def sample_user() -> dict[str, str]:
    """Provide sample user data."""
    return {"id": "123", "name": "John Doe"}
```

### Parametrization
```python
@pytest.mark.parametrize("input,expected", [
    (0, 0), (1, 1), (2, 4),
], ids=["zero", "one", "two"])
def test_square(input: int, expected: int) -> None:
    assert square(input) == expected
```

### Exceptions
```python
def test_divide_by_zero_raises_error() -> None:
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)
```

### Mocking
```python
def test_fetch_user(mocker) -> None:
    mock_get = mocker.patch('requests.get')
    mock_get.return_value.json.return_value = {"id": 1}

    result = fetch_user(1)

    mock_get.assert_called_once_with("https://api.example.com/users/1")
```

</details>

<details>
<summary><strong>Ruby (RSpec)</strong></summary>

### Structure
- Test class methods (`.method`) before instance methods (`#method`)
- One expectation per `it` block

```ruby
RSpec.describe User do
  describe '.find' do
    # Class methods first
  end

  describe '#full_name' do
    # Instance methods second
  end
end
```

### Test Variables
Use `let` instead of instance variables:
```ruby
# Good
let(:user) { described_class.new(name: "John") }

# Bad
before { @user = User.new(name: "John") }  # ❌
```

### Subject
```ruby
describe '#full_name' do
  subject { user.full_name }
  it { is_expected.to eq "John Doe" }
end
```

### Predicate Matchers
```ruby
# Good
it { is_expected.to be_admin }

# Bad
it "returns true" do
  expect(subject.admin?).to be true  # ❌
end
```

### Doubles
```ruby
# Good
let(:notifier) { instance_double(Notifier) }

# Bad
let(:notifier) { double("notifier") }  # ❌
```

### Private Methods
Don't test private methods unless explicitly required. Test the public interface.

</details>

---

## Verification

<details>
<summary><strong>Python (pytest) Commands</strong></summary>

```bash
uv run pytest                              # All tests
uv run pytest tests/models/test_user.py -v # Specific file
uv run pytest tests/test_file.py::TestClass::test_fn -vv  # Specific test
uv run pytest --cov=src --cov-report=term-missing  # With coverage
uv run pytest --durations=10               # Check timing
uv run pytest -m "not slow"                # Fast tests only
uv run mypy src/                           # Type check
uv run ruff check src/                     # Lint
```
</details>

<details>
<summary><strong>Ruby (RSpec) Commands</strong></summary>

```bash
bundle exec rspec                              # All tests
bundle exec rspec spec/models/user_spec.rb     # Specific file
bundle exec rspec spec/models/user_spec.rb:42  # Specific line
bundle exec rspec --format documentation       # Doc format
COVERAGE=true bundle exec rspec                # With coverage
bundle exec rspec --profile                    # Check timing
bundle exec rspec --tag ~slow                  # Fast tests only
bundle exec rubocop                            # Lint
bundle exec rubocop --autocorrect              # Auto-fix
```
</details>

---

## Checklist

| | Python | Ruby |
|---|---|---|
| Tests pass | `uv run pytest` | `bundle exec rspec` |
| Coverage ok | `uv run pytest --cov=src` | `COVERAGE=true bundle exec rspec` |
| No lint errors | `uv run ruff check src/` | `bundle exec rubocop` |
| Types check | `uv run mypy src/` | — |

---

## Key Principles

1. **Test First** — Write tests before implementation
2. **Verify Red** — Confirm tests fail before implementing
3. **One at a Time** — Focus on one failing test
4. **Maintain Coverage** — Never decrease coverage
5. **Small Changes** — Incremental changes, run tests frequently
