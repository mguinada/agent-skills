# Parallelism in Vitest

Control how tests run in parallel for optimal performance.

## File Parallelism

By default, Vitest runs **test files** in parallel using workers:

| Pool | Mechanism |
|------|-----------|
| `forks` (default) | Child processes |
| `vmForks` | VM contexts in child processes |
| `threads` | Worker threads |
| `vmThreads` | VM contexts in worker threads |

### Configure Workers

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads',
    minWorkers: 1,
    maxWorkers: 4
  }
})
```

### Disable File Parallelism

```typescript
export default defineConfig({
  test: {
    fileParallelism: false  // Run files sequentially
  }
})
```

CLI:
```bash
vitest --no-file-parallelism
vitest --single-thread
```

## Test Parallelism

By default, **tests within a file** run sequentially. Enable concurrent execution:

### Per-Test Concurrent

```typescript
import { test, describe } from 'vitest'

// This test runs concurrently with other concurrent tests
test.concurrent('async operation', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})

// Suite with concurrent tests
describe.concurrent('API tests', () => {
  test('fetches users', async () => {
    // Runs concurrently
  })

  test('fetches posts', async () => {
    // Runs concurrently
  })
})
```

### Global Concurrent

```typescript
export default defineConfig({
  test: {
    sequence: {
      concurrent: true  // All tests run concurrently
    }
  }
})
```

### Concurrent Limits

```typescript
export default defineConfig({
  test: {
    maxConcurrency: 5  // Max concurrent tests per file
  }
})
```

## How Concurrent Works

Vitest groups concurrent tests and runs with `Promise.all`:

```typescript
// These run in parallel (async operations)
test.concurrent('test 1', async () => {
  await delay(100)
  console.log('test 1 done')
})

test.concurrent('test 2', async () => {
  await delay(100)
  console.log('test 2 done')
})

// These still run sequentially (synchronous)
test.concurrent('sync 1', () => {
  expect(1).toBe(1)  // Completes immediately
})

test.concurrent('sync 2', () => {
  expect(2).toBe(2)  // Waits for sync 1
})
```

**Important**: Synchronous concurrent tests still run one after another. Concurrent helps with async operations.

## Hook Execution

Control hook execution order within concurrent groups:

```typescript
export default defineConfig({
  test: {
    sequence: {
      hooks: 'parallel'  // Run hooks in parallel
    }
  }
})
```

Default: `'stack` (run after previous)
Options: `'stack'`, `'list'`, `'parallel'`

## Isolation

Each test file runs in isolation by default:

```typescript
export default defineConfig({
  test: {
    isolate: true  // Each file in fresh context
  }
})
```

Disable for faster startup (shared state):

```typescript
export default defineConfig({
  test: {
    isolate: false
  }
})
```

**Warning**: Without isolation, tests can affect each other.

## Performance Tuning

### Identify Bottlenecks

```bash
# Profile test performance
vitest run --reporter=verbose
```

### Optimize Parallelism

```typescript
export default defineConfig({
  test: {
    // CPU-bound tests: fewer workers
    maxWorkers: Math.floor(cpus.length / 2),

    // IO-bound tests: more workers
    maxWorkers: cpus.length * 2,

    // Mixed: match CPU count
    maxWorkers: cpus.length
  }
})
```

### Memory Considerations

```typescript
export default defineConfig({
  test: {
    // Lower memory: fewer workers
    maxWorkers: 2,

    // Use forks instead of threads
    pool: 'forks',

    // Disable isolation
    isolate: false
  }
})
```

## Sharding

Split tests across CI jobs:

```bash
# Run first half
vitest run --shard=1/2

# Run second half
vitest run --shard=2/2
```

Combine with blob reporter:

```bash
# Job 1
vitest run --shard=1/4 --reporter=blob --outputFile=reports/1.json

# Job 2
vitest run --shard=2/4 --reporter=blob --outputFile=reports/2.json

# ...

# Merge results
vitest --merge-reports=reports --reporter=json
```

## Best Practices

### When to Use Concurrent

```typescript
// ✅ Good: Async operations benefit from concurrent
test.concurrent('fetches data', async () => {
  const data = await api.fetch()
  expect(data).toBeDefined()
})

// ❌ Doesn't help: Synchronous tests
test.concurrent('math works', () => {
  expect(1 + 1).toBe(2)
})
```

### When to Disable Parallelism

```typescript
// Tests with shared resources
describe.serial('database tests', () => {
  test('inserts data', () => { /* ... */ })
  test('reads data', () => { /* ... */ })
})

// Tests that modify global state
describe('global config', () => {
  beforeEach(() => {
    config.reset()
  })

  test('sets option A', () => { /* ... */ })
  test('sets option B', () => { /* ... */ })
})
```

### Mixed Approach

```typescript
describe('API integration', () => {
  // These can run in parallel
  describe.concurrent('read operations', () => {
    test('list users', async () => { /* ... */ })
    test('list posts', async () => { /* ... */ })
  })

  // These must run sequentially
  describe.serial('write operations', () => {
    test('create user', async () => { /* ... */ })
    test('update user', async () => { /* ... */ })
    test('delete user', async () => { /* ... */ })
  })
})
```

## Summary

| Setting | Default | Use When |
|---------|---------|----------|
| `fileParallelism` | `true` | Keep true unless debugging |
| `isolate` | `true` | Keep true for reliability |
| `sequence.concurrent` | `false` | Many async tests |
| `maxConcurrency` | `5` | Adjust for async workload |
| `maxWorkers` | CPU count | Memory constrained |

**Rule of thumb**: Start with defaults. Enable concurrent for async-heavy tests. Disable parallelism only when necessary for debugging or shared state.
