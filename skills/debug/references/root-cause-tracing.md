# Root Cause Tracing

When an error is deep in a call stack, don't start at the error site — trace backward to find where the bad value originates.

## The Backward Tracing Technique

```
Error at layer N
  ← What called layer N with bad data?
  ← What called that with bad data?
  ← Keep going until you find the origin
  → Fix at the origin, not at layer N
```

### Example: Nil/null pointer deep in a call stack

You see: `NoMethodError: undefined method 'name' for nil`

**Don't** add a nil guard at the error site. Instead:

1. Read the stack trace top to bottom — find the first line in *your* code
2. Look at what that method received — is `user` nil here?
3. Trace who called that method — what passed in `user`?
4. Keep going up: where was `user` last assigned a non-nil value?
5. What happened between assignment and this call? Nil assignment? Reassignment? Scope issue?

### Example: Wrong value passed to a function

```
# Error: "Expected string, got integer at payments/processor.rb:42"

# Step 1: Look at processor.rb:42
def charge(amount)
  api.charge(amount)  # amount is integer here, should be string
end

# Step 2: Who calls charge()?
PaymentService.charge(order.total)  # order.total returns Integer

# Step 3: Where is order.total defined?
def total
  line_items.sum(:price)  # ActiveRecord sum returns Integer
end

# Root cause: sum(:price) returns Integer, but charge() expects String
# Fix: convert at the boundary — charge(order.total.to_s) or fix the type contract
```

## Multi-Component Boundary Tracing

For distributed systems or pipelines, add logging at each boundary:

```bash
# CI pipeline example: find where a variable disappears
echo "=== GitHub Actions env ==="
printenv | grep MY_VAR

echo "=== After docker build ==="
docker run --rm myimage printenv | grep MY_VAR

echo "=== Inside script ==="
docker run --rm myimage sh -c 'echo ${MY_VAR:-UNSET}'
```

Run it once to find the boundary where the value disappears. Then investigate that specific handoff.

## When the Stack Trace Is Unhelpful

Sometimes the stack trace points to library code, not your code. Strategy:

1. Find the first frame that is in *your* codebase
2. Add logging just before that call: log every argument passed
3. Rerun — now you know what bad data entered the library
4. Trace backward from there

## Signs You've Found the Root Cause

- You can explain in one sentence why the bug occurs
- You know what the correct value/state should be
- Fixing it at this location would prevent the symptom (not just hide it)
- No other symptoms are introduced by the fix
