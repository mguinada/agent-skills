# Vitest Reporters

Configure how test results are displayed and output.

## Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['verbose']
  }
})
```

## Built-in Reporters

### Default Reporter
Shows test summary with status at bottom.

```typescript
export default defineConfig({
  test: {
    reporters: ['default']
  }
})
```

Disable summary:
```typescript
export default defineConfig({
  test: {
    reporters: [['default', { summary: false }]]
  }
})
```

Output:
```
 ✓ test/example-1.test.ts (5 tests | 1 skipped) 306ms
 ✓ test/example-2.test.ts (5 tests | 1 skipped) 307ms

 Test Files  2 passed (4)
      Tests  10 passed | 3 skipped (65)
   Start at  11:01:36
   Duration  2.00s
```

### Verbose Reporter
Prints every test case with error messages immediately.

```typescript
export default defineConfig({
  test: {
    reporters: [['verbose', { summary: false }]]
  }
})
```

Output:
```
✓ __tests__/file1.test.ts > first test file > 2 + 2 should equal 4 1ms
✓ __tests__/file1.test.ts > first test file > 4 - 2 should equal 2 1ms
✓ __tests__/file2.test.ts > second test file > 1 + 1 should equal 2 1ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

### Tree Reporter
Shows hierarchical test structure.

```typescript
export default defineConfig({
  test: {
    reporters: ['tree']
  }
})
```

Output:
```
✓ __tests__/example-1.test.ts (2) 725ms
   ✓ first test file (2) 725ms
     ✓ 2 + 2 should equal 4
     ✓ 4 - 2 should equal 2
```

### Dot Reporter
Minimal output - one dot per test.

```typescript
export default defineConfig({
  test: {
    reporters: ['dot']
  }
})
```

Output:
```
....

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

### JSON Reporter
Outputs results in Jest-compatible JSON format.

```typescript
export default defineConfig({
  test: {
    reporters: ['json'],
    outputFile: './test-output.json'
  }
})
```

Output includes coverage if enabled (since Vitest 3):
```json
{
  "numTotalTestSuites": 4,
  "numPassedTestSuites": 2,
  "numFailedTestSuites": 1,
  "testResults": [...],
  "coverageMap": {}
}
```

### HTML Reporter
Generates interactive HTML report (Vitest UI).

```typescript
export default defineConfig({
  test: {
    reporters: ['html'],
    outputFile: './html/index.html'  // Default
  }
})
```

Requires `@vitest/ui` package:
```bash
npm i -D @vitest/ui
```

Preview with Vite:
```bash
npx vite preview --outDir ./html
```

### JUnit Reporter
XML output for CI systems.

```typescript
export default defineConfig({
  test: {
    reporters: [['junit', {
      suiteName: 'UI tests',
      classnameTemplate: 'filename:{filename} - filepath:{filepath}'
    }]],
    outputFile: './junit.xml'
  }
})
```

Output:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<testsuites name="vitest tests" tests="2" failures="1">
    <testsuite name="__tests__/test-file-1.test.ts" tests="2">
        <testcase name="2 + 2 should equal 4">
            <failure message="expected 5 to be 4">
                AssertionError: expected 5 to be 4
            </failure>
        </testcase>
    </testsuite>
</testsuites>
```

### TAP Reporter
Test Anything Protocol format.

```typescript
export default defineConfig({
  test: {
    reporters: ['tap']
  }
})
```

Output:
```
TAP version 13
1..1
not ok 1 - __tests__/test-file-1.test.ts {
    1..2
    ok 1 - first test
    not ok 2 - second test
}
```

### TAP Flat Reporter
TAP format without nesting.

```typescript
export default defineConfig({
  test: {
    reporters: ['tap-flat']
  }
})
```

### GitHub Actions Reporter
Auto-enabled in GitHub Actions. Provides workflow commands for test failures.

```typescript
export default defineConfig({
  test: {
    reporters: process.env.GITHUB_ACTIONS === 'true'
      ? ['dot', 'github-actions']
      : ['dot']
  }
})
```

Features:
- Error annotations in PR
- Job summary with statistics
- Flaky test highlights
- Permalinks to source lines

### Agent Reporter
Optimized for AI coding assistants. Minimal output, only failures shown.

```typescript
export default defineConfig({
  test: {
    reporters: ['agent']
  }
})
```

Auto-enabled when running inside AI agents.

### Blob Reporter
Stores results for later merging.

```bash
# On CI machines
vitest --reporter=blob --outputFile=reports/blob-1.json

# Merge later
vitest --merge-reports=reports --reporter=json --reporter=default
```

Useful with sharding:
```bash
vitest run --shard=1/3 --reporter=blob --outputFile=reports/shard-1.json
```

### Hanging Process Reporter
Shows processes preventing exit (debugging).

```typescript
export default defineConfig({
  test: {
    reporters: ['hanging-process']
  }
})
```

## Combining Reporters

Multiple reporters with different outputs:

```typescript
export default defineConfig({
  test: {
    reporters: ['junit', 'json', 'verbose'],
    outputFile: {
      junit: './junit-report.xml',
      json: './json-report.json',
    }
  }
})
```

Terminal + file output:
```typescript
export default defineConfig({
  test: {
    reporters: ['default', 'json'],
    outputFile: './test-output.json'
  }
})
```

## Custom Reporters

From NPM:
```typescript
export default defineConfig({
  test: {
    reporters: ['some-published-vitest-reporter']
  }
})
```

Local file:
```bash
vitest --reporter=./path/to/reporter.ts
```

Implement the Reporter interface:
```typescript
// custom-reporter.ts
import type { Reporter } from 'vitest/reporters'

export default class CustomReporter implements Reporter {
  onInit(ctx) {
    // Called when Vitest starts
  }

  onFinished(files, errors) {
    // Called when all tests finish
  }

  onTaskUpdate(packs) {
    // Called when test status changes
  }

  onCollected(files) {
    // Called when tests are collected
  }
}
```

## Output File Configuration

```typescript
export default defineConfig({
  test: {
    reporters: ['json'],
    outputFile: {
      json: './reports/test-results.json',
      html: './reports/index.html'
    }
  }
})
```

## Reporter Options Summary

| Reporter | Options |
|----------|---------|
| default | `summary: boolean` |
| verbose | `summary: boolean` |
| tree | `summary: boolean` |
| junit | `suiteName: string`, `classnameTemplate: string \| function` |
| github-actions | `displayAnnotations: boolean`, `jobSummary: { enabled, outputPath }` |
| blob | N/A |
| html | Uses `outputFile` |
| json | Uses `outputFile` |
