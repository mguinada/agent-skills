---
name: vitest
description: "Vitest testing framework for unit tests, component tests, and browser/E2E tests powered by Vite. **PROACTIVE ACTIVATION**: Auto-invoke when editing test files (*.test.*, *.spec.*), working with vitest.config.*, adding tests to Vite projects, or when user mentions testing, unit tests, component tests, or E2E tests in a JavaScript/TypeScript project. **DETECTION**: Check for vitest in package.json, vitest.config.* file, *.test.* or *.spec.* files with vitest imports, or vite.config.* with test property. **USE CASES**: Writing and running tests, component testing (React/Vue/Svelte), browser mode and E2E testing, mocking (functions, modules, globals, timers, file system, requests, dates, classes), snapshots, code coverage, test fixtures, in-source testing, type testing with expectTypeOf, parallelism, reporters, debugging, test annotations, flaky test handling, and CI/CD integration."
author: mguinada
version: 1.2.0
tags: [vitest, testing, unit-test, e2e, browser, vite, jest-compatible, mocking, coverage, snapshot, parallelism, reporters, debugging]
---

# Vitest Testing Framework

Vitest is a next-generation testing framework powered by Vite, offering fast tests with native ESM, TypeScript, and JSX support. This skill covers unit testing, component testing, and browser/E2E testing with progressive disclosure.

## Quick Reference

### Installation
```bash
npm install -D vitest
# For browser/E2E testing
npx vitest init browser
```

### Essential Commands
```bash
vitest                  # Run tests in watch mode
vitest run              # Run tests once
vitest run --coverage   # Run with coverage
vitest --ui             # Open Vitest UI
vitest --browser        # Run browser tests
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### Verification Commands
```bash
npx vitest --version   # Check version
npx vitest --help      # List all options
```

**Test verification:** After `vitest run`, all tests should pass with green checkmarks. Failed tests show diff output.

### File Conventions
| Type | Pattern |
|------|---------|
| Test files | `*.test.*` or `*.spec.*` |
| Config | `vitest.config.ts` or `vite.config.ts` |
| Setup | `setup.ts` or `src/setup-tests.ts` |
| Snapshots | `__snapshots__/*.snap` |

---

## Writing Tests

### Basic Test Structure
```typescript
import { describe, it, expect } from 'vitest'

describe('Math operations', () => {
  it('adds two numbers', () => {
    expect(1 + 2).toBe(3)
  })

  it('handles async operations', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })
})
```

### Test Functions
```typescript
import { test, it, describe, bench } from 'vitest'

// it and test are aliases
it('simple test', () => {})

// Skip tests
it.skip('skipped test', () => {})
it.skipIf(process.env.CI)('skip in CI', () => {})

// Only run specific tests
it.only('run only this', () => {})
it.todo('implement later')

// Concurrent tests
it.concurrent('runs in parallel', () => {})

// Benchmarks
bench('sorting array', () => {
  ;[1, 5, 3, 2, 4].sort()
})
```

### Hooks
```typescript
import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  // Run once before all tests
})

beforeEach(() => {
  // Run before each test
})

afterEach(() => {
  // Run after each test
})

afterAll(() => {
  // Run once after all tests
})
```

For detailed test patterns (tags, filtering, fixtures), see `references/test-patterns.md`.

---

## Assertions (Expect)

### Common Assertions
```typescript
import { expect } from 'vitest'

// Equality
expect(actual).toBe(expected)           // Strict equality (===)
expect(actual).toEqual(expected)        // Deep equality
expect(actual).toStrictEqual(expected)  // Strict deep equality

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(5)
expect(value).toBeLessThan(10)
expect(value).toBeCloseTo(0.3, 5)       // Floating point

// Strings
expect(str).toContain('substring')
expect(str).toMatch(/regex/)
expect(str).toHaveLength(5)

// Arrays
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toContainEqual({ id: 1 })

// Objects
expect(obj).toHaveProperty('nested.path')
expect(obj).toMatchObject({ name: 'test' })

// Errors
expect(() => fn()).toThrow()
expect(() => fn()).toThrow(Error)
expect(() => fn()).toThrow('error message')

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

### Negation
```typescript
expect(value).not.toBe(true)
expect(array).not.toContain(item)
```

For detailed assertions and custom matchers, see `references/assertions.md`.

---

## Mocking

### Function Mocks
```typescript
import { vi } from 'vitest'

// Create mock function
const mockFn = vi.fn()
mockFn('hello')
expect(mockFn).toHaveBeenCalledWith('hello')

// Mock implementation
const mock = vi.fn(() => 'default')
mock.mockReturnValue('value')
mock.mockImplementation(() => 'impl')
mock.mockResolvedValue('async value')
```

### Module Mocks
```typescript
import { vi } from 'vitest'

// Mock entire module
vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1 })),
  fetchPosts: vi.fn(() => Promise.resolve([]))
}))

// Partial mock (keep some originals)
vi.mock('./utils', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    formatDate: vi.fn(() => 'mocked date')
  }
})
```

### Spy On
```typescript
import { vi } from 'vitest'
import * as utils from './utils'

vi.spyOn(utils, 'formatDate').mockReturnValue('2024-01-01')
vi.spyOn(console, 'log').mockImplementation(() => {})
```

### Timers
```typescript
import { vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('advances time', () => {
  const callback = vi.fn()
  setTimeout(callback, 1000)
  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalled()
})
```

For detailed mocking (globals, dates, file system), see `references/mocking.md`.

---

## Configuration

### Basic Config
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

### Using Vite Config
```typescript
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup-tests.ts',
  },
})
```

### Environment Options
| Environment | Use Case |
|-------------|----------|
| `node` | Backend/Node.js code |
| `jsdom` | DOM simulation |
| `happy-dom` | Faster DOM alternative |
| `edge-runtime` | Edge workers |
| `browser` | Real browser testing |

For detailed configuration, see `references/configuration.md`.

---

## Component Testing (Browser Mode)

### Setup
```bash
npx vitest init browser
# or manually
npm install -D @vitest/browser-playwright
```

### Configuration
```typescript
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
```

### React Component Test
```typescript
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { expect, test } from 'vitest'
import LoginForm from './LoginForm'

test('login form submits credentials', async () => {
  const onSubmit = vi.fn()
  const screen = render(<LoginForm onSubmit={onSubmit} />)

  await screen.getByLabelText(/email/i).fill('user@example.com')
  await screen.getByLabelText(/password/i).fill('password123')
  await screen.getByRole('button', { name: /login/i }).click()

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'user@example.com',
    password: 'password123'
  })
})
```

### Vue Component Test
```typescript
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import Counter from './Counter.vue'

test('counter increments', async () => {
  const screen = render(Counter, { count: 0 })

  await expect.element(screen.getByText('0')).toBeInTheDocument()
  await screen.getByRole('button', { name: /increment/i }).click()
  await expect.element(screen.getByText('1')).toBeInTheDocument()
})
```

### Browser Assertions
```typescript
import { page, expect } from 'vitest/browser'

// DOM assertions
await expect.element(page.getByText('Hello')).toBeInTheDocument()
await expect.element(page.getByRole('button')).toBeVisible()
await expect.element(page.getByLabelText('Email')).toBeEnabled()
await expect.element(page.getByRole('heading')).toHaveTextContent('Title')
await expect.element(page.getByTestId('alert')).toHaveClass('error')
```

For detailed browser testing (locators, interactions, visual regression), see `references/browser-testing.md`.

---

## Snapshots

### Creating Snapshots
```typescript
import { expect, test } from 'vitest'

test('matches snapshot', () => {
  const ui = renderComponent()
  expect(ui).toMatchSnapshot()
})

test('matches inline snapshot', () => {
  expect({ name: 'test' }).toMatchInlineSnapshot(`
    {
      "name": "test"
    }
  `)
})
```

### Updating Snapshots
```bash
vitest -u                    # Update all snapshots
vitest -u --run              # Update without watch mode
```

For detailed snapshot patterns, see `references/snapshots.md`.

---

## Debugging Failed Tests

When a test fails, follow this systematic workflow:

### Step 1: Isolate the Failure
```bash
# Run only the failing test file
vitest run path/to/failing.test.ts

# Run specific test by name
vitest run -t "test name pattern"

# Disable parallelism for clearer errors
vitest run --no-threads
```

### Step 2: Examine the Output
```bash
# Use verbose reporter for details
vitest run --reporter=verbose

# The diff output shows expected vs received
# Example output:
# AssertionError: expected 2 to deeply equal 3
# - Expected: 3
# + Received: 2
```

### Step 3: Common Fixes

| Error Pattern | Likely Cause | Fix |
|---------------|--------------|-----|
| `expected X to equal Y` | Wrong value or logic error | Check the assertion and code logic |
| `Cannot read property X of undefined` | Missing mock or initialization | Add setup or mock |
| `Timeout exceeded` | Async not completing | Add `await` or increase timeout |
| `vi.mock is not hoisted` | Import before mock | Move mock to top of file |
| `Snapshot is outdated` | Intentional change | Run `vitest -u` to update |

### Step 4: Fix and Verify
```bash
# After fixing, run the test again
vitest run path/to/failing.test.ts

# Then run full suite to catch regressions
vitest run
```

### Step 5: Debug with Breakpoints (if needed)
```bash
# Debug in VS Code: click "Debug Test" above the test
# Or use Node inspector:
node --inspect-brk ./node_modules/.bin/vitest run --no-threads
```

For detailed debugging techniques, see `references/debugging.md`.

---

## Coverage

### Configuration
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

### Running Coverage
```bash
vitest run --coverage
vitest run --coverage --reporter=json
```

### Coverage Validation Checkpoint

After running coverage, verify thresholds passed before proceeding:

```bash
# Exit code 0 = all thresholds met
vitest run --coverage && echo "✅ Coverage thresholds passed"

# Check specific coverage in CI
if vitest run --coverage; then
  echo "Coverage check passed - safe to merge"
else
  echo "Coverage check failed - review report"
  exit 1
fi
```

**Coverage report locations:**
- `coverage/index.html` — Visual report
- `coverage/lcov.info` — For codecov/upload

For detailed coverage configuration, see `references/coverage.md`.

---

## Test Projects (Monorepo)

### Workspace Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
```

For detailed workspace patterns, see `references/projects.md`.

---

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx vitest run --coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

### Browser Tests in CI
```yaml
- run: npx playwright install --with-deps chromium
- run: npx vitest run --browser.headless
```

For detailed CI/CD patterns, see `references/ci-cd.md`.

---

## Reference Files

For deep dives into specific topics, read these files:

### Getting Started
- `references/cli.md` — Complete CLI reference, all commands and options
- `references/configuration.md` — All config options, environments, setup files
- `references/ide-integration.md` — VS Code, JetBrains, and other IDE setup

### Writing Tests
- `references/test-patterns.md` — Tags, filtering, fixtures, test context
- `references/test-annotations.md` — Adding context to tests for debugging and reporting
- `references/snapshots.md` — Snapshot patterns, property matchers

### Assertions & Mocking
- `references/assertions.md` — All matchers, custom matchers, extending expect
- `references/mocking.md` — Functions, modules, globals, timers, file system, requests, classes, dates

### Running Tests
- `references/parallelism.md` — File and test parallelism configuration
- `references/reporters.md` — All built-in reporters and custom reporter creation
- `references/coverage.md` — Coverage providers, thresholds, reporters

### Browser & E2E
- `references/browser-testing.md` — Locators, interactions, visual regression, providers
- `references/component-testing.md` — React, Vue, Svelte testing patterns

### Advanced
- `references/projects.md` — Monorepo, workspaces, multiple configs
- `references/testing-types.md` — Type checking with `expectTypeOf` and `assertType`
- `references/in-source-testing.md` — Inline testing within source files

### Troubleshooting
- `references/debugging.md` — Debug tools, breakpoints, and techniques
- `references/flaky-tests.md` — Flaky test detection, handling, quarantine
- `references/common-errors.md` — Solutions to frequent issues
- `references/ci-cd.md` — GitHub Actions, Docker, caching, parallelization

---

## Official Documentation

- Vitest Docs: https://vitest.dev/
- API Reference: https://vitest.dev/api/
- Configuration: https://vitest.dev/config/
- GitHub: https://github.com/vitest-dev/vitest
