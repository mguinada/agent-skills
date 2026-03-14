# Test Projects & Workspaces

Configure multiple test configurations in a single Vitest instance.

## Table of Contents
- [Basic Projects](#basic-projects)
- [Project Configuration](#project-configuration)
- [Running Specific Projects](#running-specific-projects)
- [Shared Configuration](#shared-configuration)

---

## Basic Projects

### Inline Configuration
```typescript
export default defineConfig({
  test: {
    projects: [
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

### Directory-Based Projects
```typescript
export default defineConfig({
  test: {
    projects: [
      'packages/core',
      'packages/ui',
      'packages/utils',
    ],
  },
})
```

---

## Project Configuration

### Separate Config Files
```
project/
├── vitest.config.ts      # Main config
├── packages/
│   ├── core/
│   │   └── vitest.config.ts
│   └── ui/
│       └── vitest.config.ts
```

### Project-Specific Options
```typescript
{
  test: {
    name: 'core',
    include: ['src/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./setup.ts'],
    coverage: {
      include: ['src/**/*.ts'],
    },
  },
}
```

---

## Running Specific Projects

### CLI
```bash
# Run all projects
vitest run

# Run specific project
vitest run --project=unit
vitest run --project=browser

# Run multiple projects
vitest run --project=unit --project=integration
```

### In Code
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
    ],
  },
})
```

---

## Shared Configuration

### Base Configuration
```typescript
const baseConfig = {
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
    },
  },
}

export default defineConfig({
  test: {
    projects: [
      {
        ...baseConfig,
        test: {
          ...baseConfig.test,
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        ...baseConfig,
        test: {
          ...baseConfig.test,
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
