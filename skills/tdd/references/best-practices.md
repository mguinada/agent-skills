# TDD Best Practices

Test writing, organization, and code quality guidelines for TDD.

## Test Writing

- **Use descriptive test names**: `test_<function>_<scenario>_<expected_result>`
- **Focus on behavior**, not implementation details
- **Don't test private methods**
- **Use meaningful assertions** with clear error messages
- **Keep tests independent** and isolated
- **Avoid A/A/A comments** - test structure should be self-evident

## Test Organization

- **Place fixtures first** at the top of test files
- **Mirror source structure** in test directory layout
- **Group related tests** in classes or modules
- **Use appropriate fixture scopes** (function, class, module, session)
- **Parametrized tests last** in the file

## Code Quality

- **Use type hints** for all test function parameters
- **Use f-strings** for string formatting
- **Follow PEP 8** naming conventions
- **Use Google-style docstrings** for test classes
- **Never use mutable default arguments**
