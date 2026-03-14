# Code Coverage

Configure and manage code coverage in Vitest.

## Table of Contents
- [Configuration](#configuration)
- [Coverage Providers](#coverage-providers)
- [Reporters](#reporters)
- [Thresholds](#thresholds)
- [CI Integration](#ci-integration)

---

## Configuration

### Basic Setup
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
})
```

### Run with Coverage
```bash
vitest run --coverage
```

---

## Coverage Providers

### V8 (Default)
```typescript
coverage: {
  provider: 'v8',
}
```

- Faster
- Requires Node.js 10.12+

### Istanbul
```typescript
coverage: {
  provider: 'istanbul',
  // All istanbul options available
}
```

- More compatible
- Better for older environments

---

## Reporters

### Available Reporters
```typescript
reporter: [
  'text',      // Console output
  'json',      // JSON file
  'html',      // HTML report
  'lcov',      // lcov format for Codecov
  'cobertura', // For Jenkins
]
```

### Custom Reporter Path
```typescript
reporter: [
  ['lcov', { outputFile: 'coverage/lcov.info' }],
  ['json', { outputFile: 'coverage/coverage.json' }],
]
```

---

## Thresholds

### Set Minimum Coverage
```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,

    // Fail if below threshold
    'perFile': true,
    'autoUpdate': true,  // Auto-update thresholds
  },
}
```

### Per-File Thresholds
```typescript
thresholds: {
  '100': ['src/critical/**/*.ts'],
  '80': ['src/utils/**/*.ts'],
  '50': ['src/legacy/**/*.ts'],
}
```

---

## CI Integration

### GitHub Actions
```yaml
- run: npx vitest run --coverage
- uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
```

### Summary Output
```bash
# Output summary to console
vitest run --coverage --reporter=json-summary
```
