# Snapshot Testing

Guide to snapshot testing patterns in Vitest.

## Table of Contents
- [Basic Snapshots](#basic-snapshots)
- [Inline Snapshots](#inline-snapshots)
- [Property Matchers](#property-matchers)
- [Error Snapshots](#error-snapshots)
- [Managing Snapshots](#managing-snapshots)

---

## Basic Snapshots

### Creating Snapshots
```typescript
import { expect, test } from 'vitest'

test('snapshot example', () => {
  const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
  }

  expect(user).toMatchSnapshot()
})
```

### Named Snapshots
```typescript
test('multiple snapshots', () => {
  expect(user.name).toMatchSnapshot('user name')
  expect(user.email).toMatchSnapshot('user email')
})
```

### File Location
```
src/
  user.test.ts
  __snapshots__/
    user.test.snap
```

---

## Inline Snapshots

### Basic Inline
```typescript
test('inline snapshot', () => {
  expect(user).toMatchInlineSnapshot()
})
```

After first run, Vitest fills in:
```typescript
test('inline snapshot', () => {
  expect(user).toMatchInlineSnapshot(`
    {
      "id": 1,
      "name": "Alice",
    }
  `)
})
```

### Benefits
- Snapshot visible in code
- Better for code review
- No separate files

---

## Property Matchers

### Handling Dynamic Values
```typescript
test('user with dynamic fields', () => {
  const user = {
    id: generateId(),  // Random
    name: 'Alice',
    createdAt: new Date(),  // Dynamic
  }

  expect(user).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date),
  })
})
```

### Common Matchers
```typescript
expect(data).toMatchSnapshot({
  id: expect.any(String),
  timestamp: expect.any(Number),
  createdAt: expect.any(Date),
  email: expect.stringContaining('@'),
  count: expect.any(Number),
  items: expect.arrayContaining([1, 2]),
  metadata: expect.objectContaining({ version: '1.0' }),
})
```

---

## Error Snapshots

### Thrown Errors
```typescript
test('error snapshot', () => {
  expect(() => throwError()).toThrowErrorMatchingSnapshot()
})

// Inline version
test('error inline', () => {
  expect(() => throwError()).toThrowErrorMatchingInlineSnapshot()
})
```

---

## Managing Snapshots

### Update Snapshots
```bash
# Update all failing snapshots
vitest -u

# Update specific file
vitest -u user.test.ts

# Update without watch mode
vitest -u --run
```

### Review Changes
```bash
# See what changed
git diff '**/*.snap'

# Interactive review
vitest -u --run
```

### Best Practices
1. Keep snapshots small and focused
2. Use property matchers for dynamic values
3. Review snapshot diffs in PRs
4. Don't use snapshots for all tests
