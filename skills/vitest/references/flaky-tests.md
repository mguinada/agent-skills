# Flaky Test Patterns

How to identify, handle, and prevent flaky tests in Vitest, especially for browser/E2E testing.

## Table of Contents
- [Identifying Flaky Tests](#identifying-flaky-tests)
- [Common Causes](#common-causes)
- [Handling Flaky Tests](#handling-flaky-tests)
- [Retry Patterns](#retry-patterns)
- [Quarantine Strategies](#quarantine-strategies)
- [Browser-Specific Flakiness](#browser-specific-flakiness)
- [Debugging Flaky Tests](#debugging-flaky-tests)

---

## Identifying Flaky Tests

### Run Tests Multiple Times
```bash
# Run a single test 10 times
npx vitest run tests/auth.test.ts --repeat-each=10

# Run with retries to see if tests pass on retry
npx vitest run --retries=3
```

### Vitest Configuration for Detection
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Enable retries in CI to detect flaky tests
    retry: process.env.CI ? 3 : 0,
    // Report flaky tests
    reportOn: ['fail', 'error', 'flaky'],
  },
})
```

### Check for Flaky Patterns
- Tests that pass locally but fail in CI
- Tests that fail intermittently
- Tests with random timeouts
- Tests that depend on execution order

---

## Common Causes

### 1. Race Conditions

**Problem:** Tests assume elements are ready before they appear.
```typescript
// BAD: Click before element is ready
await page.click('[data-testid="button"]')

// GOOD: Use auto-waiting locators
await page.getByRole('button').click()

// GOOD: Explicitly wait for element
await expect.element(page.getByText('Loading')).not.toBeInTheDocument()
await page.getByRole('button').click()
```

### 2. Network Timing

**Problem:** Tests don't wait for API responses.
```typescript
// BAD: Arbitrary timeout
await vi.waitFor(5000)
expect(data).toBeDefined()

// GOOD: Wait for specific condition
await vi.waitFor(() => expect(fetchUser).toHaveBeenCalled())
await expect.poll(() => store.getState().user).toBeDefined()

// GOOD: Wait for API response
await expect.poll(() => mockFetch.mock.calls.length).toBeGreaterThan(0)
```

### 3. Animation Timing

**Problem:** Interacting with elements during animations.
```typescript
// BAD: Click during animation
await page.getByRole('menuitem').click()

// GOOD: Wait for animation to complete
await page.getByRole('menuitem').waitFor({ state: 'visible' })
await page.getByTestId('container').waitFor({ state: 'stable' })
await page.getByRole('menuitem').click()
```

### 4. Shared State

**Problem:** Tests share mutable state.
```typescript
// BAD: Shared mutable state
let user = { name: 'test' }

test('test 1', () => {
  user.name = 'modified'
})

test('test 2', () => {
  // May fail if test 1 runs first
  expect(user.name).toBe('test')
})

// GOOD: Isolated state
beforeEach(() => {
  user = { name: 'test' }
})

// Or use test fixtures
test('test 1', ({ user }) => {
  user.name = 'modified'
})
```

### 5. Async Cleanup

**Problem:** Cleanup doesn't complete before next test.
```typescript
// BAD: Fire-and-forget cleanup
afterEach(() => {
  database.clear()  // Not awaited
})

// GOOD: Wait for cleanup
afterEach(async () => {
  await database.clear()
})

// GOOD: Ensure cleanup even on failure
afterEach.always(async () => {
  await database.clear()
})
```

---

## Handling Flaky Tests

### Skip in CI Temporarily
```typescript
test.skipIf(process.env.CI)('flaky test - Issue #123', async () => {
  // Test code...
})
```

### Mark as Fixme
```typescript
test.fixme('flaky: complex search', async () => {
  // Test code...
})

// Conditional fixme
test.fixme(browserName === 'webkit', 'Flaky on Safari - Issue #456')
```

### Increase Timeout
```typescript
test('slow test', async () => {
  // ...
}, { timeout: 30000 })

// Or for specific operations
await page.waitForSelector('.loaded', { timeout: 10000 })
```

### Add Retry to Specific Test
```typescript
test('flaky test', async () => {
  // ...
}, { retry: 3 })
```

---

## Retry Patterns

### Configuration-Level Retries
```typescript
export default defineConfig({
  test: {
    // Retry failed tests 3 times in CI
    retry: process.env.CI ? 3 : 0,

    // For browser tests specifically
    browser: {
      headless: true,
      // Browser-specific retries
      poolOptions: {
        threads: {
          singleThread: true,
          minThreads: 1,
          maxThreads: 1,
        },
      },
    },
  },
})
```

### Test-Level Retry
```typescript
test('unstable API test', async () => {
  const result = await fetchUnstableAPI()
  expect(result).toBeDefined()
}, {
  retry: 5,
  timeout: 10000,
})

// Conditional retry
test('flaky on webkit', async () => {
  // ...
}, {
  retry: context.browser === 'webkit' ? 5 : 0,
})
```

### Custom Retry Logic
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Should not reach here')
}

test('retries API calls', async () => {
  const result = await retryWithBackoff(() => api.fetchData())
  expect(result).toBeDefined()
})
```

---

## Quarantine Strategies

### Skip with Issue Reference
```typescript
test.skip('flaky: complex search', () => {
  // Reference the issue tracking the fix
})

test('conditional skip', () => {
  test.skip(process.env.CI, 'Flaky in CI - Issue #123')
  // Test code...
})
```

### Dedicated Flaky Test File
```
tests/
├── unit/
├── browser/
└── flaky/
    ├── auth.test.ts  # Known flaky tests
    └── payment.test.ts
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          exclude: ['tests/flaky/**'],
        },
      },
      {
        test: {
          name: 'flaky',
          include: ['tests/flaky/**/*.test.ts'],
          retry: 5,
          timeout: 60000,
        },
      },
    ],
  },
})
```

### Tag Flaky Tests
```typescript
// Tag as flaky for filtering
test('unstable test', { tags: ['@flaky'] }, async () => {
  // ...
})

// Run only non-flaky tests
// npx vitest run --exclude='**/*(@flaky)*'
```

---

## Browser-Specific Flakiness

### Wait for Network Idle
```typescript
test('waits for page load', async () => {
  await page.goto('/dashboard')

  // Wait for network to settle
  await page.waitForLoadState('networkidle')

  // Or wait for specific response
  await page.waitForResponse(
    resp => resp.url().includes('/api/data') && resp.status() === 200
  )

  // Now safe to interact
  await page.getByRole('button').click()
})
```

### Handle Slow Rendering
```typescript
// Wait for element to be stable
const element = page.getByTestId('dynamic-content')
await element.waitFor({ state: 'visible' })

// Wait for content to stabilize
await expect.poll(async () => {
  const text = await element.text()
  return text.length
}).toBeGreaterThan(0)

// Then interact
await element.click()
```

### Handle Multiple Browsers
```typescript
test.describe('cross-browser test', () => {
  test('works on all browsers', async ({ page, browserName }) => {
    // Skip known issue
    test.skipIf(browserName === 'webkit')('Safari has timing issues - Issue #789')

    // Or adjust timeout per browser
    const timeout = browserName === 'webkit' ? 10000 : 5000

    await page.goto('/')
    await expect.element(page.getByText('Loaded')).toBeInTheDocument()
  })
})
```

---

## Debugging Flaky Tests

### Capture Screenshots on Failure
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    browser: {
      screenshotOnFailure: true,
    },
  },
})

// Or manually in test
afterEach.always(async ({ page }, testInfo) => {
  if (testInfo.isFailed()) {
    const screenshot = await page.screenshot()
    testInfo.attach('failure-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    })
  }
})
```

### Log on Failure
```typescript
afterEach.always(({ page }, testInfo) => {
  if (testInfo.isFailed()) {
    console.log('Page URL:', page.url())
    console.log('Console logs:', page.consoleLogs)
  }
})
```

### Save Trace
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      // Save trace on failure
      saveTrace: 'on-failure',
    },
  },
})
```

### Debug Mode
```bash
# Run with debug output
DEBUG=vitest:* npx vitest run tests/flaky.test.ts

# Run in headed mode for browser tests
npx vitest run --browser.headless=false
```

---

## Prevention Checklist

Before marking a test as stable, verify:

- [ ] No shared mutable state between tests
- [ ] All async operations are properly awaited
- [ ] No arbitrary timeouts (use explicit waits)
- [ ] Cleanup completes before next test
- [ ] No race conditions in element interactions
- [ ] Network requests are mocked or have explicit waits
- [ ] Animation timing is handled
- [ ] Browser-specific behavior is accounted for
- [ ] Test runs successfully 10+ times in a row
- [ ] Test passes in CI environment consistently

---

## Test Report Template

```markdown
# Flaky Test Report

**Test:** `tests/e2e/checkout.test.ts:45`
**Date:** 2024-01-15
**Environment:** CI (GitHub Actions, Ubuntu)

## Frequency
- Failed 3 out of 10 runs
- Always passes locally

## Error Pattern
```
Error: Element not found: [data-testid="submit-button"]
```

## Likely Cause
Race condition - button appears after API response

## Recommended Fix
Add explicit wait for API response before clicking:
```typescript
await page.waitForResponse(r => r.url().includes('/api/validate'))
await page.getByTestId('submit-button').click()
```

## Temporary Mitigation
- [ ] Increased retry count to 3
- [ ] Added 2s delay before interaction
- [ ] Marked as skip in CI temporarily
```
