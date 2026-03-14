# Assertions & Matchers

Complete reference for Vitest assertions and custom matchers.

## Table of Contents
- [Basic Assertions](#basic-assertions)
- [Truthiness](#truthiness)
- [Numbers](#numbers)
- [Strings](#strings)
- [Arrays & Objects](#arrays--objects)
- [Errors](#errors)
- [Async](#async)
- [Snapshots](#snapshots)
- [Custom Matchers](#custom-matchers)

---

## Basic Assertions

### Equality
```typescript
expect(actual).toBe(expected)           // Strict equality (===)
expect(actual).toEqual(expected)        // Deep equality
expect(actual).toStrictEqual(expected)  // Deep equality, checks undefined properties
```

### Negation
```typescript
expect(actual).not.toBe(expected)
expect(actual).not.toEqual(expected)
```

---

## Truthiness

```typescript
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()
expect(value).toBeTruthy()   // !!value === true
expect(value).toBeFalsy()    // !value === true
expect(value).toBeNaN()
```

---

## Numbers

```typescript
expect(value).toBeGreaterThan(10)
expect(value).toBeGreaterThanOrEqual(10)
expect(value).toBeLessThan(10)
expect(value).toBeLessThanOrEqual(10)

// Floating point comparison
expect(0.1 + 0.2).toBeCloseTo(0.3)       // Default precision: 2
expect(0.1 + 0.2).toBeCloseTo(0.3, 5)    // Custom precision

// Check if number
expect(value).toBeNumber()
expect(value).toBeInteger()
expect(value).toBeFinite()
```

---

## Strings

```typescript
expect(str).toBe('exact string')
expect(str).toContain('substring')
expect(str).toHaveLength(5)

// Regex
expect(str).toMatch(/pattern/)
expect(str).toMatch(/^hello.*world$/)

// Type checks
expect(value).toBeString()
expect(value).toBeEmpty()
```

---

## Arrays & Objects

### Arrays
```typescript
expect(arr).toContain(item)
expect(arr).toContainEqual({ id: 1 })  // Deep equality
expect(arr).toHaveLength(3)
expect(arr).toBeArray()
expect(arr).toBeArrayOfSize(3)

// Check all items
expect(arr).toSatisfyAll(item => item > 0)
```

### Objects
```typescript
expect(obj).toHaveProperty('name')
expect(obj).toHaveProperty('address.city')
expect(obj).toHaveProperty('items', [1, 2, 3])

expect(obj).toMatchObject({
  name: 'Alice',
  age: expect.any(Number),
})

// Type checks
expect(obj).toBeObject()
expect(obj).toBeEmpty()
```

### Sets & Maps
```typescript
expect(set).toContain(item)
expect(map).toContainKey('key')
expect(map).toContainValue('value')
expect(map).toContainEntry(['key', 'value'])
```

---

## Errors

### Sync Errors
```typescript
// Function must throw
expect(() => throwError()).toThrow()
expect(() => throwError()).toThrow(Error)
expect(() => throwCustomError()).toThrow(CustomError)

// Error message
expect(() => throwError()).toThrow('error message')
expect(() => throwError()).toThrow(/message pattern/)

// Use function reference
expect(throwError).toThrow()
```

### Async Errors
```typescript
// Promise rejection
await expect(asyncFn()).rejects.toThrow()
await expect(asyncFn()).rejects.toThrow(Error)
await expect(asyncFn()).rejects.toThrow('message')

// Or with function
await expect(() => asyncFn()).rejects.toThrow()
```

---

## Async

### Resolves
```typescript
await expect(promise).resolves.toBe(value)
await expect(promise).resolves.toEqual({ id: 1 })
```

### Rejects
```typescript
await expect(promise).rejects.toThrow()
await expect(promise).rejects.toEqual({ error: 'message' })
```

---

## Snapshots

### Inline Snapshots
```typescript
expect(value).toMatchInlineSnapshot()
// After first run, Vitest fills in the snapshot:
expect(value).toMatchInlineSnapshot(`
  {
    "id": 1,
    "name": "Test",
  }
`)

// Property matchers
expect(user).toMatchInlineSnapshot({
  createdAt: expect.any(Date),
  id: expect.any(String),
})
```

### File Snapshots
```typescript
expect(value).toMatchSnapshot()
expect(value).toMatchSnapshot('optional name')

// Property matchers for dynamic values
expect(user).toMatchSnapshot({
  id: expect.any(String),
  createdAt: expect.any(Date),
})

// Throws snapshot
expect(value).toThrowErrorMatchingSnapshot()
expect(value).toThrowErrorMatchingInlineSnapshot()
```

### Updating Snapshots
```bash
vitest -u              # Update all snapshots
vitest -u --run        # Update without watch mode
```

---

## Custom Matchers

### expect.extend
```typescript
import { expect } from 'vitest'

expect.extend({
  toBeDivisibleBy(received, divisor) {
    const pass = received % divisor === 0
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be divisible by ${divisor}`
          : `expected ${received} to be divisible by ${divisor}`,
    }
  },
})

// Usage
expect(10).toBeDivisibleBy(5)
expect(7).not.toBeDivisibleBy(3)
```

### TypeScript Types
```typescript
declare module 'vitest' {
  interface Assertion {
    toBeDivisibleBy(divisor: number): void
  }
}
```

### Async Custom Matchers
```typescript
expect.extend({
  async toBeValidEmail(received) {
    const { default: validator } = await import('validator')
    const pass = validator.isEmail(received)
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
    }
  },
})
```

---

## Assertion Utilities

### expect.any
```typescript
expect(value).toEqual({
  id: expect.any(Number),
  name: expect.any(String),
  date: expect.any(Date),
})
```

### expect.anything
```typescript
expect(value).toEqual({
  id: 1,
  extra: expect.anything(),  // Matches anything except undefined/null
})
```

### expect.arrayContaining
```typescript
expect([1, 2, 3, 4]).toEqual(
  expect.arrayContaining([1, 3])
)
```

### expect.objectContaining
```typescript
expect(user).toEqual(
  expect.objectContaining({
    name: 'Alice',
    // Other properties ignored
  })
)
```

### expect.stringContaining
```typescript
expect(message).toEqual(
  expect.stringContaining('hello')
)
```

### expect.stringMatching
```typescript
expect(message).toEqual(
  expect.stringMatching(/hello.*world/i)
)
```

### expect.extend with Matchers
```typescript
// Chain matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    return {
      pass,
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
      actual: received,
      expected: `${floor} - ${ceiling}`,
    }
  },
})
```
