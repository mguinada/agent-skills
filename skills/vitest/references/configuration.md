# Configuration Reference

Complete Vitest configuration options.

## Table of Contents
- [Basic Configuration](#basic-configuration)
- [Test Options](#test-options)
- [Environment Options](#environment-options)
- [Coverage Options](#coverage-options)
- [Browser Options](#browser-options)
- [Advanced Options](#advanced-options)

---

## Basic Configuration

### Configuration File
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Test options here
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
    // Test options
  },
})
```

### Merge Configs
```typescript
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    // Vitest-specific options
  },
}))
```

---

## Test Options

### File Patterns
```typescript
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '**/*.d.ts'],
    includeSource: ['src/**/*.ts'],  // For in-source testing
  },
})
```

### Test Name Patterns
```typescript
export default defineConfig({
  test: {
    testNamePattern: /^((?!@skip).)*$/,  // Skip tests with @skip tag
  },
})
```

### Globals
```typescript
export default defineConfig({
  test: {
    globals: true,  // Enable global APIs (describe, it, expect, vi)
  },
})
```

### Setup Files
```typescript
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts', './tests/mocks.ts'],
  },
})
```

### Global Setup
```typescript
export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
  },
})
```

```typescript
// tests/global-setup.ts
export default function setup() {
  return {
    setup() {
      // Runs once before all tests
    },
    teardown() {
      // Runs once after all tests
    },
  }
}
```

---

## Environment Options

### Environment
```typescript
export default defineConfig({
  test: {
    environment: 'node',  // 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime'
  },
})
```

### Environment Options
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'https://example.com',
        pretendToBeVisual: true,
      },
    },
  },
})
```

### Happy-DOM
```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        url: 'https://example.com',
        settings: {
          enableJavaScriptEvaluation: true,
        },
      },
    },
  },
})
```

---

## Coverage Options

### Basic Coverage
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',  // 'v8' | 'istanbul'
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
})
```

### Include/Exclude
```typescript
export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
      ],
    },
  },
})
```

### Thresholds
```typescript
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        perFile: true,
        autoUpdate: true,
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
```

### Istanbul Provider
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      customCoverageModule: 'custom-coverage-module',
    },
  },
})
```

---

## Browser Options

### Basic Browser Config
```typescript
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
```

### Browser Instances
```typescript
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
        // With options
        {
          browser: 'chromium',
          context: {
            viewport: { width: 1920, height: 1080 },
          },
        },
        // Mobile emulation
        {
          browser: 'chromium',
          context: {
            ...devices['Pixel 5'],
          },
        },
      ],
    },
  },
})
```

### Browser Viewport
```typescript
export default defineConfig({
  test: {
    browser: {
      viewport: {
        width: 1280,
        height: 720,
      },
    },
  },
})
```

### Browser API Port
```typescript
export default defineConfig({
  test: {
    browser: {
      api: {
        port: 63315,
      },
    },
  },
})
```

### Screenshot Options
```typescript
export default defineConfig({
  test: {
    browser: {
      screenshotFailures: true,
      expect: {
        toMatchScreenshot: {
          threshold: 0.1,
        },
      },
    },
  },
})
```

---

## Advanced Options

### Parallelism
```typescript
export default defineConfig({
  test: {
    fileParallelism: true,  // Run test files in parallel
    maxConcurrency: 5,      // Max concurrent tests per file
    pool: 'threads',        // 'threads' | 'forks' | 'vmThreads' | 'vmForks'
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
  },
})
```

### Isolation
```typescript
export default defineConfig({
  test: {
    isolate: true,  // Isolate test files
    watch: false,   // Disable watch mode
  },
})
```

### Mock Options
```typescript
export default defineConfig({
  test: {
    deps: {
      interopDefault: true,
      moduleDirectories: ['node_modules'],
    },
    mockReset: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
})
```

### Cache
```typescript
export default defineConfig({
  test: {
    cache: {
      dir: 'node_modules/.vitest',
    },
  },
})
```

### Reporters
```typescript
export default defineConfig({
  test: {
    reporters: [
      'default',
      'html',
      'json',
      'junit',
      ['github-actions', { reportTestProgress: true }],
    ],
    outputFile: {
      json: './test-results.json',
      junit: './junit.xml',
      html: './html-report',
    },
  },
})
```

### Watch Mode
```typescript
export default defineConfig({
  test: {
    watch: true,
    watchExclude: ['**/node_modules/**', '**/dist/**'],
  },
})
```

### Sequence
```typescript
export default defineConfig({
  test: {
    sequence: {
      shuffle: true,  // Randomize test order
      concurrent: true,  // Run tests concurrently
    },
  },
})
```

### Test Context
```typescript
export default defineConfig({
  test: {
    context: {
      // Custom context options
    },
  },
})
```

### Benchmark
```typescript
export default defineConfig({
  test: {
    benchmark: {
      include: ['**/*.bench.ts'],
      exclude: ['node_modules'],
    },
  },
})
```

### Type Checking
```typescript
export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      include: ['src/**/*.ts'],
      tsconfig: './tsconfig.json',
    },
  },
})
```
