# Test Patterns

Common testing patterns and best practices.

## Table of Contents
- [Test Organization](#test-organization)
- [Test Tags](#test-tags)
- [Test Fixtures](#test-fixtures)
- [Test Filtering](#test-filtering)
- [Parameterized Tests](#parameterized-tests)

---

## Test Organization

### Describe Blocks
```typescript
describe('UserService', () => {
  describe('create', () => {
    it('creates a new user', () => {})
    it('validates email', () => {})
  })

  describe('delete', () => {
    it('removes user', () => {})
  })
})
```

### Nested Describe
```typescript
describe('API', () => {
  describe('GET /users', () => {
    describe('when authenticated', () => {
      it('returns users', () => {})
    })

    describe('when not authenticated', () => {
      it('returns 401', () => {})
    })
  })
})
```

---

## Test Tags

### Adding Tags
```typescript
test('fast test', { tags: ['@fast'] }, () => {})

test('slow test', { tags: ['@slow', '@integration'] }, () => {})

describe('group', { tags: ['@unit'] }, () => {
  test('inherits tag', () => {})
})
```

### Running by Tag
```bash
# Run only fast tests
vitest run --tag=@fast

# Exclude slow tests
vitest run --tag='!@slow'

# Multiple tags (AND)
vitest run --tag=@fast --tag=@unit
```

---

## Test Fixtures

### Basic Fixture
```typescript
import { test as base } from 'vitest'

interface Fixture {
  user: User
  token: string
}

export const test = base.extend<Fixture>({
  user: async ({}, use) => {
    const user = await createUser()
    await use(user)
    await deleteUser(user.id)
  },
  token: async ({ user }, use) => {
    const token = generateToken(user)
    await use(token)
  },
})

test('with fixtures', ({ user, token }) => {
  expect(user).toBeDefined()
  expect(token).toBeDefined()
})
```

### Auto-Setup Fixtures
```typescript
const test = base.extend({
  database: [async ({}, use) => {
    const db = await setupDatabase()
    await use(db)
    await db.close()
  }, { auto: true }],  // Runs automatically
})
```

---

## Test Filtering

### By File
```bash
vitest run tests/auth.test.ts
vitest run tests/auth/
```

### By Name Pattern
```bash
vitest run -t "should login"
vitest run -t "/login/"
```

### By Line Number
```bash
vitest run tests/auth.test.ts:45
```

### By Project
```bash
vitest run --project=unit
```

---

## Parameterized Tests

### test.each
```typescript
test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 2, 4],
])('add(%i, %i) = %i', (a, b, expected) => {
  expect(a + b).toBe(expected)
})
```

### describe.each
```typescript
describe.each([
  { input: 1, expected: 2 },
  { input: 2, expected: 4 },
])('double($input)', ({ input, expected }) => {
  test(`returns ${expected}`, () => {
    expect(double(input)).toBe(expected)
  })
})
```

### Object-Based
```typescript
test.each({
  'empty string': { input: '', expected: 0 },
  'single word': { input: 'hello', expected: 5 },
  'multiple words': { input: 'hello world', expected: 11 },
})('$name', ({ input, expected }) => {
  expect(countChars(input)).toBe(expected)
})
```
