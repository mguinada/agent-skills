# Debugging Tests

Strategies and tools for debugging Vitest tests.

## Debug Single Test

### VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
      "runtimeArgs": ["run", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
      "runtimeArgs": ["run", "${file}", "-t", "${selectedText}"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Node Inspector

```bash
# Inspect mode
vitest --inspect

# Break on start
vitest --inspect-brk
```

Then open `chrome://inspect` in Chrome.

### Debug Browser Tests

```bash
# Headed mode with DevTools
vitest --browser.headless=false
```

## Console Debugging

### Basic Logging

```typescript
test('debugging example', () => {
  const result = complexFunction()

  console.log('result:', result)
  console.dir(result, { depth: null })
  console.table([{ name: 'Alice' }, { name: 'Bob' }])

  expect(result).toBe(true)
})
```

### Conditional Logging

```typescript
import { DEBUG } from './config'

test('conditional debug', () => {
  if (DEBUG) {
    console.log('Debug info:', someValue)
  }
})
```

## Test Utilities

### test.skip for Isolation

```typescript
describe('problematic suite', () => {
  test.skip('skip this one', () => {
    // Skip to isolate issue
  })

  test('run this one', () => {
    // This runs
  })
})
```

### test.only for Focus

```typescript
describe('suite', () => {
  test('runs normally', () => {})

  test.only('focus on this', () => {
    // Only this test runs
  })
})
```

### test.todo for Planning

```typescript
test.todo('implement this later')
```

## Vitest UI Debugging

```bash
vitest --ui
```

Features:
- View test tree
- See test output
- Watch mode visualization
- Filter tests
- View module graph

## Debugging Flaky Tests

### Detect Flakiness

```typescript
test('potentially flaky', async () => {
  // Run multiple times
  for (let i = 0; i < 10; i++) {
    const result = await flakyOperation()
    expect(result).toBe(expected)
  }
})
```

### Retry Configuration

```typescript
export default defineConfig({
  test: {
    retry: 3  // Retry failed tests 3 times
  }
})
```

### Timeout Issues

```typescript
// Increase timeout for slow tests
test('slow test', async () => {
  // ...
}, 10000)  // 10 second timeout

// Or in config
export default defineConfig({
  test: {
    testTimeout: 10000
  }
})
```

## Common Debugging Scenarios

### Test Not Running

```typescript
// Check file pattern
// Default: **/*.test.* or **/*.spec.*

// Check if test is skipped
test.skip('this is skipped', () => {})

// Check for syntax errors
test('unclosed', () => {
  // Missing closing - test won't run
```

### Wrong Import Path

```typescript
// ❌ Wrong
import { foo } from './foo'

// ✅ Correct (check extension)
import { foo } from './foo.js'
import { foo } from './foo.ts'
```

### Async Issues

```typescript
// ❌ Missing await
test('async issue', () => {
  const promise = asyncOperation()
  expect(promise).resolves.toBe('value')  // Not awaited
})

// ✅ Correct
test('async fixed', async () => {
  await expect(asyncOperation()).resolves.toBe('value')
})
```

### Mock Issues

```typescript
// Check mock is set up before import
vi.mock('./module')  // Must be before import
import { foo } from './module'

// Check mock is cleared
beforeEach(() => {
  vi.clearAllMocks()
})
```

### Timer Issues

```typescript
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()  // Don't forget to restore
})
```

## Snapshot Debugging

```typescript
test('snapshot issue', () => {
  const result = render()

  // View the actual vs expected
  expect(result).toMatchSnapshot()

  // Use inline for debugging
  expect(result).toMatchInlineSnapshot(`
    Object {
      "key": "value"
    }
  `)
})
```

Update snapshots:
```bash
vitest -u
```

## Debug Reporters

### Verbose Output

```bash
vitest --reporter=verbose
```

### Hanging Process Reporter

```typescript
export default defineConfig({
  test: {
    reporters: ['default', 'hanging-process']
  }
})
```

Shows processes preventing exit.

## Error Stack Traces

### Better Stack Traces

```typescript
// Enable source maps
export default defineConfig({
  test: {
    sourcemap: true
  }
})
```

### Custom Error Messages

```typescript
test('with custom message', () => {
  expect(value, 'value should be truthy').toBeTruthy()
})
```

## Performance Debugging

### Slow Tests

```typescript
export default defineConfig({
  test: {
    slowTestThreshold: 300  // Mark tests >300ms as slow
  }
})
```

### Module Graph Analysis

```bash
vitest --ui
# Click on Module Graph tab
```

### Timing Breakdown

```bash
vitest run --reporter=verbose
```

Output includes:
```
Duration  1.26s (transform 35ms, setup 1ms, collect 90ms, tests 1.47s, environment 0ms)
```

## Debug in Browser

### Using Playwright

```typescript
import { page } from 'vitest/browser/context'

test('browser debug', async () => {
  await page.goto('/test-page')

  // Take screenshot
  await page.screenshot({ path: 'debug.png' })

  // Get page content
  const html = await page.content()
  console.log(html)
})
```

### Browser DevTools

```bash
vitest --browser.headless=false
```

Opens browser with DevTools access.

## Debugging Checklist

1. **Run single test**: `vitest run file.test.ts`
2. **Check imports**: Verify file paths and extensions
3. **Check async**: Ensure all promises are awaited
4. **Check mocks**: Verify mock setup order
5. **Check timers**: Restore real timers in afterEach
6. **Check isolation**: Disable parallelism to find race conditions
7. **Check timeouts**: Increase for slow operations
8. **Use verbose reporter**: See all test output
9. **Check snapshots**: Update if expected changed
10. **Use debugger**: `--inspect` or VS Code launch config
