---
name: typescript
description: "TypeScript expert guidance for type-level programming, performance optimization, migrations, and real-world problem solving. **PROACTIVE ACTIVATION**: Auto-invoke when working with .ts/.tsx files, encountering type errors, discussing types/generics/interfaces, or configuring TypeScript. **DETECTION**: Check for tsconfig.json, .ts/.tsx files, types/ directory, @types/ packages, or TypeScript-related imports. **USE CASES**: Type errors, generics, tsconfig setup, module resolution, JS→TS migration, type performance, monorepo configuration, declaration files, branded types, conditional types, type testing."
author: mguinada
version: 1.0.0
tags: [typescript, types, type-safety, generics, tsc, tsconfig, type-inference, declaration-files]
---

# TypeScript Expert

Expert guidance for TypeScript development. This skill uses progressive disclosure - read sections as needed, and dive into reference files when you need deeper coverage.

## Quick Start

Analyze the project setup first:

```bash
# Core versions
npx tsc --version && node -v

# Check for tooling ecosystem
node -e "const p=require('./package.json');console.log(Object.keys({...p.devDependencies,...p.dependencies}||{}).join('\n'))" 2>/dev/null | grep -E 'biome|eslint|prettier|vitest|jest|turborepo|nx' || echo "No tooling detected"

# Check for monorepo
(test -f pnpm-workspace.yaml || test -f lerna.json || test -f nx.json || test -f turbo.json) && echo "Monorepo detected"
```

After detection, adapt your approach:
- Match import style (absolute vs relative)
- Respect existing baseUrl/paths configuration
- Prefer existing project scripts over raw tools

---

## Common Issues

### Type Errors

**"The inferred type of X cannot be named"**

Cause: Missing type export or circular dependency
Fix priority:
1. Export the required type explicitly
2. Use `ReturnType<typeof function>` helper
3. Break circular dependencies with type-only imports

```typescript
export type { MyType };
export type MyReturnType = ReturnType<typeof myFunction>;
```

**"Excessive stack depth comparing types"**

Cause: Circular or deeply recursive types
```typescript
// Bad: Infinite recursion
type InfiniteArray<T> = T | InfiniteArray<T>[];

// Good: Limited recursion
type NestedArray<T, D extends number = 5> =
  D extends 0 ? T : T | NestedArray<T, [-1, 0, 1, 2, 3, 4][D]>[];
```

**Missing type declarations**

> **Read `references/declaration-files.md`** for comprehensive guidance on writing .d.ts files.

```typescript
// types/ambient.d.ts
declare module 'some-untyped-package' {
  const value: unknown;
  export default value;
}
```

### Module Resolution

"Cannot find module" despite file existing:
1. Check `moduleResolution` matches your bundler
2. Verify `baseUrl` and `paths` alignment
3. For monorepos: Ensure workspace protocol (workspace:*)
4. Clear cache: `rm -rf node_modules/.cache .tsbuildinfo`

---

## Type Patterns

### Branded Types

Prevent primitive obsession by creating nominal types:

```typescript
declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

type UserId = Branded<string, 'UserId'>;
type OrderId = Branded<string, 'OrderId'>;

function processOrder(orderId: OrderId, userId: UserId) { }
// processOrder(userId, orderId) // Error: Type mismatch
```

> **Read `references/type-patterns.md`** when you need: conditional types, template literal types, mapped types, type inference techniques, or advanced utility patterns.

### Const Assertions & Satisfies

```typescript
// Const assertions for literal types
const routes = ['/home', '/about', '/contact'] as const;
type Route = typeof routes[number]; // '/home' | '/about' | '/contact'

// satisfies for constraint validation (TS 5.0+)
const config = {
  api: "https://api.example.com",
  timeout: 5000
} satisfies Record<string, string | number>;
```

---

## Performance

### Diagnosing Slow Type Checking

```bash
# Get diagnostics
npx tsc --extendedDiagnostics --incremental false | grep -E "Check time|Files:|Lines:|Nodes:"

# Generate trace for deep analysis
npx tsc --generateTrace trace --incremental false
npx @typescript/analyze-trace trace
```

### Quick Fixes

1. Enable `skipLibCheck: true` (often significant improvement)
2. Use `incremental: true` with `.tsbuildinfo` cache
3. Configure `include`/`exclude` precisely
4. For monorepos: Use project references with `composite: true`

> **Read `references/performance.md`** when: type checking is slow, you see "Type instantiation too deep" errors, or you need monorepo performance optimization.

---

## Tooling

### Biome vs ESLint

| Use Biome | Use ESLint |
|-----------|------------|
| Speed is critical | Need specific rules/plugins |
| Single tool for lint + format | Complex custom rules |
| TypeScript-first | Vue/Angular projects |
| Fewer rules OK | Type-aware linting needed |

> **Read `references/tooling.md`** when: setting up linting/formatting, choosing between Biome/ESLint/Prettier, configuring monorepo tools (Nx vs Turborepo), or migrating between tools.

### Type Testing

```typescript
// avatar.test-d.ts
import { expectTypeOf } from 'vitest'
import type { Avatar } from './avatar'

test('Avatar props are correctly typed', () => {
  expectTypeOf<Avatar>().toHaveProperty('size')
  expectTypeOf<Avatar['size']>().toEqualTypeOf<'sm' | 'md' | 'lg'>()
})
```

Run with: `vitest --typecheck`

> **Read `references/type-testing.md`** when: testing library types, using expectTypeOf/assertType APIs, or setting up type test infrastructure.

---

## Configuration

### Strict Settings (Recommended)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### ESM-First Approach

- Set `"type": "module"` in package.json
- Use `.mts` for TypeScript ESM files if needed
- Configure `"moduleResolution": "bundler"` for modern tools
- Dynamic imports for CJS: `const pkg = await import('cjs-package')`

---

## Migration

### JavaScript to TypeScript

```bash
# 1. Enable allowJs in tsconfig.json
# 2. Rename files gradually (.js → .ts)
# 3. Add types file by file
# 4. Enable strict mode features one by one

# Helpers
npx ts-migrate migrate . --sources 'src/**/*.js'
npx typesync  # Install missing @types packages
```

### Tool Migration Guide

| From | To | When | Effort |
|------|-----|------|--------|
| ESLint + Prettier | Biome | Need speed | Low (1 day) |
| Lerna | Nx/Turborepo | Caching needed | High (1 week) |
| CJS | ESM | Node 18+ | High (varies) |

---

## Monorepo

**Nx vs Turborepo:**
- Turborepo: Simple structure, need speed, <20 packages
- Nx: Complex dependencies, need visualization, plugins required

```json
// Root tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ],
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

> See `references/performance.md` for monorepo performance optimization.

---

## Validation

After changes, validate thoroughly:

```bash
npm run -s typecheck || npx tsc --noEmit
npm test -s || npx vitest run --reporter=basic --no-watch
npm run -s build  # Only if build affects outputs
```

---

## Deep Dive: Reference Files

Load these files when you need comprehensive coverage:

| File | Read When |
|------|-----------|
| `references/type-patterns.md` | Building complex types, conditional types, template literals, branded types, inference techniques |
| `references/performance.md` | Slow type checking, "excessive depth" errors, monorepo optimization, compiler diagnostics |
| `references/type-testing.md` | Testing library types, expectTypeOf/assertType APIs, Vitest typecheck setup |
| `references/declaration-files.md` | Writing .d.ts files, module augmentation, ambient declarations, publishing types |
| `references/tooling.md` | Biome/ESLint setup, Nx/Turborepo comparison, migration guides, development tools |

Each reference file includes table of contents, code examples, and troubleshooting guides.
