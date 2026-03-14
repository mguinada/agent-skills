# Test Annotations

Add contextual information to your tests for debugging, reporting, and integration with CI/CD.

## Overview

Test annotations are a way to attach additional information to tests that will be displayed by reporters. They are useful for:
- Adding context to test failures
- Linking to external resources (GitHub issues, PRs, docs)
- Attaching screenshots or logs
- Categorizing tests

## Usage

### Basic Annotation

```typescript
import { test, expect } from 'vitest'

test('user login', async ({ annotate }) => {
  await annotate('This test requires a valid test user')
  // test code
})
```

### Annotation with Type

```typescript
test('payment processing', async ({ annotate }) => {
  await annotate('https://github.com/myorg/payments/issues/42', 'issue')
  // test code
})
```

### Multiple Annotations

```typescript
test('complex scenario', async ({ context }) => {
  const { annotate } = context
  await annotate('First step completed')
  await annotate('Second step completed')
  await annotate('Final verification')
  // test code
})
```

## Annotation API

### Syntax

```typescript
function annotate(
  message: string,
  type?: string,
  attachment?: TestAttachment
): Promise<TestAnnotation>

// Or with object parameter
function annotate(
  message: string,
  attachment?: TestAttachment
): Promise<TestAnnotation>
```

### TestAttachment

```typescript
interface TestAttachment {
  body?: string  // Content string
  path?: string  // Path to file
  content_type?: string  // MIME type
}
```

## Examples

### Link to Issue

```typescript
import { test, expect } from 'vitest'

test('fixes authentication bug', async ({ annotate }) => {
  await annotate('https://github.com/vitest-dev/vitest/issues/7953', 'issue')

  // Test that verifies the fix
  const auth = new AuthService()
  expect(auth.isAuthenticated()).toBe(true)
})
```

### Attach Screenshots

```typescript
import { page, test, expect } from 'vitest/browser'

test('UI renders correctly', async ({ annotate }) => {
  await page.goto('/dashboard')

  const screenshot = await page.screenshot()
  await annotate('Dashboard screenshot', 'image', {
    body: screenshot.toString('base64'),
    content_type: 'image/png'
  })
})

// Or from file
test('visual regression', async ({ annotate }) => {
  await annotate('Expected UI', 'image', {
    path: './fixtures/expected-dashboard.png',
    content_type: 'image/png'
  })
})
```

### Attach Log Files

```typescript
test('server response', async ({ annotate }) => {
  const logs = await captureLogs(() => {
    // run test
  })

  await annotate('Server logs', 'log', {
    body: logs.join('\n'),
    content_type: 'text/plain'
  })
})
```

### Documentation Links

```typescript
test('API endpoint', async ({ annotate }) => {
  await annotate('https://docs.myapp.com/api/users', 'documentation')
  await annotate('API must return within 100ms', 'requirement')

  const start = Date.now()
  const response = await fetch('/api/users')
  const duration = Date.now() - start

  expect(duration).toBeLessThan(100)
})
```

## Viewing Annotations

### In Reporters

The `verbose` reporter shows annotations for passing tests:

```bash
vitest --reporter=verbose
```

### In GitHub Actions

Annotations appear as workflow annotations when using the `github-actions` reporter:

```typescript
export default defineConfig({
  test: {
    reporters: ['github-actions', 'verbose']
  }
})
```

Output in GitHub:
```
Error: test/api.test.ts
  └─ API endpoint
     └─ https://docs.myapp.com/api/users
```

Disable inline annotations:
```typescript
export default defineConfig({
  test: {
    reporters: [['github-actions', { displayAnnotations: false }]]
  }
})
```

### In Custom Reporters

Access annotations via the `Task` object:

```typescript
import type { Reporter, Test } from 'vitest/reporters'

export default class MyReporter implements Reporter {
  onTaskUpdate(packs) {
    packs.forEach(pack => {
      if (pack[1] !== undefined) {
        const test = pack[1] as Test
        console.log('Annotations:', test.annotations)
      }
    })
  }
}
```

## Annotation Types

Common conventions:

| Type | Use Case |
|------|----------|
| `issue` | Link to bug/feature tracking |
| `documentation` | Link to docs |
| `image` | screenshot attachment |
| `log` | Log file attachment |
| `requirement` | Business requirements |
| `note` | General note |

## Custom Annotation Types

You can define any type:

```typescript
test('custom annotation', async ({ annotate }) => {
  await annotate('Performance metrics', 'perf', {
    body: JSON.stringify({ fps: 60, memory: '50MB' }),
    content_type: 'application/json'
  })
})
```

## TypeScript Support

For type checking annotation types:

```typescript
// vitest.d.ts
import 'vitest'

declare module 'vitest'  {
  interface TestAnnotations {
    // Extend to add your custom types
    type: 'issue' | 'documentation' | 'image' | 'log' | 'requirement' | 'note'
  }
}
```
