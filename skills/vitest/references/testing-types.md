# Testing Types with Vitest

Write tests for your TypeScript types using `expectTypeOf` and `assertType`.

## Setup

Enable type checking in your config:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    typecheck: {
      enabled: true
    }
  }
})
```

Or via CLI:
```bash
vitest --typecheck
```

## File Conventions

By default, type tests are in `*.test-d.ts` files:

```typescript
// utils.test-d.ts
import { expectTypeOf } from 'vitest'
import { add, greet } from './utils'

test('types', () => {
  expectTypeOf(add).toBeFunction()
  expectTypeOf(greet).toBeCallableWith('world')
})
```

Configure pattern:
```typescript
export default defineConfig({
  test: {
    typecheck: {
      include: ['**/*.test-d.ts']
    }
  }
})
```

## expectTypeOf API

### Function Types

```typescript
import { expectTypeOf } from 'vitest'

function greet(name: string): string {
  return `Hello, ${name}!`
}

test('greet function types', () => {
  expectTypeOf(greet).toBeFunction()
  expectTypeOf(greet).toBeCallableWith('world')
  expectTypeOf(greet).returns.toBeString()
  expectTypeOf(greet).parameter(0).toBeString()
  expectTypeOf(greet).parameters.toEqualTypeOf<[string]>()
})
```

### Object Types

```typescript
interface User {
  id: number
  name: string
  email?: string
}

test('user types', () => {
  expectTypeOf<User>().toHaveProperty('id')
  expectTypeOf<User>().toHaveProperty('name')
  expectTypeOf<User>().toHaveProperty('email')

  expectTypeOf<User['id']>().toBeNumber()
  expectTypeOf<User['name']>().toBeString()
  expectTypeOf<User['email']>().toEqualTypeOf<string | undefined>()
})
```

### Type Equality

```typescript
test('type equality', () => {
  // Exact type match
  expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>()

  // Extends (is assignable to)
  expectTypeOf({ a: 1, b: 2 }).toExtend<{ a: number }>()

  // Match using typeof
  const one = { a: 1 }
  const two = { a: 1, b: 2 }
  expectTypeOf(one).toEqualTypeOf<typeof two>() // Fails
})
```

### Primitive Types

```typescript
test('primitives', () => {
  expectTypeOf(42).toBeNumber()
  expectTypeOf('hello').toBeString()
  expectTypeOf(true).toBeBoolean()
  expectTypeOf(null).toBeNull()
  expectTypeOf(undefined).toBeUndefined()
  expectTypeOf(undefined).toBeVoid()
  expectTypeOf(Symbol()).toBeSymbol()
  expectTypeOf(BigInt(1)).toBeBigInt()
})
```

### Array Types

```typescript
test('arrays', () => {
  expectTypeOf([1, 2, 3]).toBeArray()
  expectTypeOf([1, 2, 3]).items.toBeNumber()
  expectTypeOf(['a', 'b']).items.toBeString()
})
```

### Promise Types

```typescript
async function fetchData(): Promise<string> {
  return 'data'
}

test('promise types', () => {
  expectTypeOf(fetchData).resolves.toBeString()
  expectTypeOf(Promise.resolve(42)).resolves.toBeNumber()
})
```

### Nullable Types

```typescript
test('nullable', () => {
  expectTypeOf<string | null>().toBeNullable()
  expectTypeOf<string | undefined>().toBeNullable()
  expectTypeOf<string>().not.toBeNullable()
})
```

### Extract/Exclude

```typescript
test('extract/exclude', () => {
  expectTypeOf<string | number>().extract<string>().toBeString()
  expectTypeOf<string | number>().exclude<string>().toBeNumber()
  expectTypeOf<'a' | 'b' | 'c'>().extract<'a' | 'b'>().toEqualTypeOf<'a' | 'b'>()
})
```

### Instance Types

```typescript
class MyClass {
  value = 42
  method() { return 'result' }
}

test('instance types', () => {
  expectTypeOf(MyClass).toBeConstructableWith()
  expectTypeOf(MyClass).instance.toHaveProperty('value')
  expectTypeOf(MyClass).instance.toHaveProperty('method')
  expectTypeOf(MyClass).instance.toMatchTypeOf<MyClass>()
})
```

### Parameters and Return Types

```typescript
function complex(a: string, b: number, c: boolean): { result: string } {
  return { result: a + b + c }
}

test('parameter and return types', () => {
  // All parameters as tuple
  expectTypeOf(complex).parameters.toEqualTypeOf<[string, number, boolean]>()

  // Individual parameters
  expectTypeOf(complex).parameter(0).toBeString()
  expectTypeOf(complex).parameter(1).toBeNumber()
  expectTypeOf(complex).parameter(2).toBeBoolean()

  // Return type
  expectTypeOf(complex).returns.toEqualTypeOf<{ result: string }>()
  expectTypeOf(complex).returns.toHaveProperty('result')
})
```

## assertType API

Simpler assertion style using TypeScript's inference:

```typescript
import { assertType } from 'vitest'

test('assertType', () => {
  const answer = 42
  assertType<number>(answer)

  // @ts-expect-error answer is not a string
  assertType<string>(answer)
})
```

### Guard Against Typos

```typescript
test('no typos', () => {
  const answer = 42

  // This passes but is a false positive (typo)
  // @ts-expect-error answwer is not defined
  assertType<string>(answwer)  // Typo!
})
```

Include type files in runtime tests to catch typos:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['**/*.test-d.ts'],  // Also run type files
    typecheck: {
      include: ['**/*.test-d.ts']
    }
  }
})
```

Now typos cause `ReferenceError` at runtime.

## Combining with Runtime Tests

Since Vitest 2.1, you can have both:

```typescript
// utils.test.ts - runtime tests
import { test, expect } from 'vitest'
import { add } from './utils'

test('add returns correct value', () => {
  expect(add(1, 2)).toBe(3)
})

// utils.test-d.ts - type tests
import { expectTypeOf } from 'vitest'
import { add } from './utils'

test('add has correct types', () => {
  expectTypeOf(add).toBeCallableWith(1, 2)
  expectTypeOf(add).returns.toBeNumber()
})
```

## Error Messages

When types don't match:

```typescript
expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: string }>()
```

Error:
```
Type '{ a: string; }' does not satisfy the constraint
'{ a: "Expected: string, Actual: number"; }'.
```

The message shows both expected and actual types.

## Configuration Options

```typescript
export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      include: ['**/*.test-d.ts'],
      exclude: ['node_modules'],
      ignoreSourceErrors: false,  // Don't report source errors
      tsconfig: './tsconfig.json' // Custom tsconfig
    }
  }
})
```

## Best Practices

1. **Use typeargs over concrete values:**
```typescript
// Better
expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>()

// Less helpful
expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 0 })
```

2. **Combine types with typeof:**
```typescript
const one = getValue1()
const two = getValue2()

expectTypeOf(one).toEqualTypeOf<typeof two>()
```

3. **Test edge cases:**
```typescript
expectTypeOf(greet).toBeCallableWith('name')
expectTypeOf(greet).toBeCallableWith('')
// @ts-expect-error
expectTypeOf(greet).toBeCallableWith(42)  // Should fail
```

4. **Test generics:**
```typescript
function identity<T>(value: T): T {
  return value
}

expectTypeOf(identity).toBeCallableWith('string')
expectTypeOf(identity<'a'>).returns.toBeString()
```
