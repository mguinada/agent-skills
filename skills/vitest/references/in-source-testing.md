# In-Source Testing

Write tests inside your source code files, similar to Rust's `#[cfg(test)]` modules.

## Overview

In-source testing allows tests to:
- Share the same closure as implementations
- Test private states without exporting
- Provide faster feedback during development

## Setup

### 1. Write Tests in Source

```typescript
// src/utils.ts
export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0)
}

// In-source tests at end of file
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
```

### 2. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}']
  }
})
```

### 3. TypeScript Support

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/importMeta"]
  }
}
```

## Running Tests

```bash
npx vitest
```

Vitest will pick up tests from source files matching `includeSource`.

## Production Builds

### Vite

```typescript
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}']
  },
  define: {
    'import.meta.vitest': 'undefined'
  }
})
```

### Rolldown

```javascript
// rolldown.config.js
import { defineConfig } from 'rolldown/config'

export default defineConfig({
  transform: {
    define: {
      'import.meta.vitest': 'undefined'
    }
  }
})
```

### Rollup

```javascript
// rollup.config.js
import replace from '@rollup/plugin-replace'

export default {
  plugins: [
    replace({
      'import.meta.vitest': 'undefined'
    })
  ]
}
```

### unbuild

```javascript
// build.config.js
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  replace: {
    'import.meta.vitest': 'undefined'
  }
})
```

### Webpack

```javascript
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'import.meta.vitest': 'undefined'
    })
  ]
}
```

## Testing Private Functions

```typescript
// src/counter.ts
let count = 0

function increment(): number {
  return ++count
}

function reset(): void {
  count = 0
}

export function getCount(): number {
  return count
}

export function incrementCounter(): number {
  return increment()
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest

  describe('counter', () => {
    beforeEach(() => {
      reset() // Access private function
    })

    it('increments count', () => {
      expect(increment()).toBe(1)
      expect(increment()).toBe(2)
    })

    it('resets count', () => {
      increment()
      reset()
      expect(getCount()).toBe(0)
    })
  })
}
```

## Complex Example

```typescript
// src/validation.ts
interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Private helper - not exported
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Private helper - not exported
function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push('Too short')
  if (!/[A-Z]/.test(password)) errors.push('Missing uppercase')
  if (!/[0-9]/.test(password)) errors.push('Missing number')
  return errors
}

export function validateUser(email: string, password: string): ValidationResult {
  const errors: string[] = []

  if (!validateEmail(email)) {
    errors.push('Invalid email')
  }

  errors.push(...validatePassword(password))

  return {
    valid: errors.length === 0,
    errors
  }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('validateEmail (private)', () => {
    it('accepts valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.org')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('no@domain')).toBe(false)
      expect(validateEmail('@nodomain.com')).toBe(false)
    })
  })

  describe('validatePassword (private)', () => {
    it('accepts strong passwords', () => {
      expect(validatePassword('Password123')).toEqual([])
    })

    it('catches weak passwords', () => {
      expect(validatePassword('short')).toContain('Too short')
      expect(validatePassword('alllowercase1')).toContain('Missing uppercase')
      expect(validatePassword('NoNumbers')).toContain('Missing number')
    })
  })

  describe('validateUser (public)', () => {
    it('validates complete user', () => {
      const result = validateUser('test@example.com', 'Password123')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('collects all errors', () => {
      const result = validateUser('invalid', 'short')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid email')
      expect(result.errors).toContain('Too short')
    })
  })
}
```

## Use Cases

### Best For
- Unit testing small-scoped functions
- Prototyping and development
- Testing utility functions
- Inline assertions
- Testing private implementation details

### Not Recommended For
- Component tests (use separate files)
- E2E tests (use separate files)
- Integration tests (use separate files)
- Tests requiring complex setup

## Limitations

1. **Code bloat**: Tests add to source file size
2. **Build configuration**: Must strip tests for production
3. **IDE noise**: Tests visible in source files
4. **Not for complex tests**: Better in separate files

## Full Example

```typescript
// src/math.ts
export function factorial(n: number): number {
  if (n < 0) throw new Error('Negative input')
  if (n === 0) return 1
  return n * factorial(n - 1)
}

export function fibonacci(n: number): number {
  if (n < 0) throw new Error('Negative input')
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('factorial', () => {
    it('calculates factorial', () => {
      expect(factorial(0)).toBe(1)
      expect(factorial(1)).toBe(1)
      expect(factorial(5)).toBe(120)
    })

    it('throws on negative', () => {
      expect(() => factorial(-1)).toThrow('Negative input')
    })
  })

  describe('fibonacci', () => {
    it('calculates fibonacci', () => {
      expect(fibonacci(0)).toBe(0)
      expect(fibonacci(1)).toBe(1)
      expect(fibonacci(10)).toBe(55)
    })

    it('throws on negative', () => {
      expect(() => fibonacci(-1)).toThrow('Negative input')
    })
  })
}
```
