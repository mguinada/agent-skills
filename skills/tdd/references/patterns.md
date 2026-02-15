# TDD Refactoring Patterns

Test refactoring patterns to reduce redundancy and improve maintainability.

## Parametrization

Replace multiple similar tests with a single parametrized test.

**Before**:
```python
def test_create_model_groq():
    """Test creating a Groq model."""
    with patch("agno.models.groq.Groq", create=True):
        result = create_model(ModelProvider.GROQ, "llama-3.3-70b")
        assert result is not None

def test_create_model_openrouter():
    """Test creating an OpenRouter model."""
    with patch("agno.models.openrouter.OpenRouter", create=True):
        result = create_model(ModelProvider.OPENROUTER, "deepseek/r1")
        assert result is not None
```

**After**:
```python
@pytest.mark.parametrize("provider,model_class,base_id", [
    (ModelProvider.GROQ, "agno.models.groq.Groq", "llama-3.3-70b"),
    (ModelProvider.OPENROUTER, "agno.models.openrouter.OpenRouter", "deepseek/r1"),
], ids=["groq", "openrouter"])
def test_create_model_for_providers(provider, model_class, base_id):
    """Test creating models for all providers."""
    with patch(model_class, create=True):
        result = create_model(provider, base_id)
        assert result is not None
```

## Shared Fixtures

Extract duplicated fixtures to `tests/conftest.py`.

**Before** (duplicated in multiple files):
```python
# In test_file1.py
@pytest.fixture
def sample_token():
    return "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"

# In test_file2.py
@pytest.fixture
def sample_token():
    return "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
```

**After** (in `tests/conftest.py`):
```python
@pytest.fixture
def sample_token() -> str:
    """Provide sample Telegram bot token for testing."""
    return "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
```

## Custom Markers

Use markers for test categorization.

```python
@pytest.mark.slow
def test_heavy_computation():
    result = perform_heavy_calculation()
    assert result > 0

@pytest.mark.integration
def test_database_connection():
    db = connect_to_database()
    assert db.is_connected()

# Run fast tests only: pytest -m "not slow"
# Run integration tests: pytest -m integration
```
