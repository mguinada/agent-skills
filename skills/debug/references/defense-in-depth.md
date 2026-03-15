# Defense in Depth

After finding and fixing a root cause, harden the code so the same class of bug can't recur silently.

## The Principle

A single validation point fails when:
- Data enters the system through a path you didn't anticipate
- A future refactor moves the validation away from the new entry point
- Integration with external systems bypasses your assumptions

Defense in depth means validating at *multiple* layers so bugs surface with a clear error message rather than producing silent corruption.

## Where to Add Validation

```
External input (HTTP, file, queue message)
  → Validate at the boundary (schema validation, type coercion)
    → Business logic
      → Validate pre-conditions (assert expected types/ranges)
        → Persistence layer
          → Validate constraints (DB constraints, not-null, foreign keys)
```

You don't need all four on every path, but consider: which layers are actually enforcing your invariants?

## Practical Patterns

### Input boundary (HTTP)
```ruby
# Rails: strong params + type coercion at the controller
def order_params
  params.require(:order).permit(:amount, :currency).tap do |p|
    p[:amount] = Integer(p[:amount])  # raise if not numeric
  end
end
```

### Business logic pre-conditions
```python
def charge(amount: int, currency: str) -> Receipt:
    assert isinstance(amount, int), f"amount must be int, got {type(amount)}"
    assert amount > 0, f"amount must be positive, got {amount}"
    assert len(currency) == 3, f"currency must be ISO 3-letter code, got {currency!r}"
    # ...
```

### Persistence constraints
```sql
ALTER TABLE orders
  ADD CONSTRAINT amount_positive CHECK (amount > 0),
  ADD CONSTRAINT currency_format CHECK (currency ~ '^[A-Z]{3}$');
```

## When to Apply

Apply defense in depth *after* fixing the root cause — not instead of it. The sequence is:

1. Find root cause (Phase 1–2)
2. Fix at the origin (Phase 4)
3. Add boundary validation to catch the same class of error earlier next time

Don't use defense in depth as a substitute for finding the root cause. Adding a nil guard at the error site without fixing why nil is produced just papers over the bug.
