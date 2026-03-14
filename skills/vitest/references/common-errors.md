# Common Errors

Solutions to frequently encountered errors in Vitest.

## Import Errors

### "Cannot find module 'vitest'"

**Cause**: Vitest is not installed or not a dev dependency.

**Solution**:
```bash
npm install -D vitest
```

### "Cannot find module './file'"

**Cause**: Missing file extension in import.

**Solution**: Add the `.js` extension:
```typescript
// ❌ Wrong
import { foo } from './foo'

// ✅ Correct
import { foo } from './node_modules/foo.js'
```

### "Cannot find module 'some-asset.css'"

**Cause**: CSS files not configured for your environment.

**Solution**: Add to `server.deps.inline`:
```typescript
export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['some-library']
      }
    }
  }
})
```

## Mock Errors

### "vi.mock is not a function"

**Cause**: Not importing `vi` from vitest.

**Solution**:
```typescript
import { vi } from 'vitest'
```

### Mock Not Working

**Cause**: Mock called after import.

**Solution**: `vi.mock` is hoisted to top of file. Ensure mock is before imports:
```typescript
import { vi } from 'vite'
import { myFunction } from './module'

// ❌ This won't work - import already happened
vi.mock('./module', () => ({ myFunction: vi.fn() }))
```

Should be:
```typescript
import { vi } from 'vitest'

vi.mock('./module', () => ({ myFunction: vi.fn() }))

import { myFunction } from './module'
```

### "Expected to be called but was not called"

**Cause**: Mock not reset between tests.

**Solution**:
```typescript
afterEach(() => {
  vi.clearAllMocks()
})
```

## Snapshot Errors

### "Snapshot is out of date"

**Solution**: Update snapshots:
```bash
vitest -u
```

### "Snapshot mismatch"

1. Review the diff to see what changed
2. If expected, update with `-u`
3. If unexpected, fix your code

### "Snapshot file not found"

**Cause**: Snapshot file was deleted or moved.

**Solution**: Run with `-u` to create a new snapshot.

## Timeout Errors

### "Test timed out"

**Solution 1**: Increase timeout:
```typescript
test('slow test', async () => {
  // ...
}, 10000) // 10 seconds
```

**Solution 2**: Increase default in config:
```typescript
export default defineConfig({
  test: {
    testTimeout: 10000
  }
})
```

### "Hook timed out"

**Solution**:
```typescript
export default defineConfig({
  test: {
    hookTimeout: 10000
  }
})
```

## Environment Errors

### "window is not defined"

**Cause**: Using DOM APIs in Node environment.

**Solution**: Use `jsdom` or `happy-dom`:
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom'
  }
})
```

### "fetch is not defined"

**Solution 1**: Use Node 18+ (has built-in fetch)

**Solution 2**: Add polyfill:
```bash
npm install -D whatwg-fetch
```

```typescript
import { vi } from 'vitest'
import { fetch } from 'whatwg-fetch'

vi.stubGlobal('fetch', fetch)
```

### "localStorage is not defined"

**Solution**: Use `jsdom` environment.

## Configuration Errors

### "Could not resolve 'some-module'"

**Solution 1**: Check import path is correct

**Solution 2**: Add to `deps.inline`:
```typescript
export default defineConfig({
  test: {
    deps: {
      inline: ['some-module']
    }
  }
})
```

### "Unexpected token"

**Cause**: Syntax not supported (e.g., JSX in .js file).

**Solution**: Use correct file extension (`.jsx`, `.tsx`) or configure:
```typescript
export default defineConfig({
  esbuild: {
    loader: 'jsx',
    include: /.*\.js$/
  }
})
```

## TypeScript Errors

### "Cannot find name 'vi'"

**Solution**: Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### "Cannot find name 'expect'"

**Solution**: Same as above.

### "import.meta.vitest is undefined"

**Solution**: Add type reference:
```json
{
  "compilerOptions": {
    "types": ["vitest/importMeta"]
  }
}
```

## Async Errors

### "Cannot log after tests were torn down"

**Solution**: Ensure async operations complete before test ends:
```typescript
test('async test', async () => {
  await someAsyncOperation() // Wait for it
})
```

### "Promise rejected after test ended"

**Solution**: Properly clean up:
```typescript
afterEach(() => {
  // Cancel any pending operations
})
```

## Performance Issues

### Tests are slow

**Solution 1**: Use `--reporter=verbose` to find slow tests

**Solution 2**: Check for unnecessary waits:
```typescript
// ❌ Bad
await new Promise(r => setTimeout(r, 1000))

// ✅ Good
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
```

### Memory Leaks

**Solution**: Ensure cleanup in `afterEach`:
```typescript
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllTimers()
})
```

## Browser Mode Errors

### "Browser not found"

**Solution**: Install Playwright:
```bash
npx playwright install
```

### "Timeout waiting for page"

**Solution**: Increase timeout:
```typescript
export default defineConfig({
  test: {
    browser: {
      provider: 'playwright',
      config: {
        timeout: 30000
      }
    }
  }
})
```

## CI Errors

### "Tests pass locally but fail in CI"

**Check**:
1. Different Node versions
2. Missing environment variables
3. Race conditions (use `--no-threads` to debug)
4. File path case sensitivity

### "Random test failures"

**Solution 1**: Check for test interdependence

**Solution 2**: Use `--seed` for reproducibility:
```bash
vitest run --seed 12345
```

## Getting Help

1. Check the [Vitest docs](https://vitest.dev/)
2. Search [GitHub issues](https://github.com/vitest-dev/vitest/issues)
3. Use `--reporter=verbose` for more details
4. Create a minimal reproduction
5. Check for known issues in the [changelog](https://github.com/vitest-dev/vitest/releases)

## Quick Debug Steps

1. Run single file: `vitest run file.test.ts`
2. Use verbose: `vitest run --reporter=verbose`
3. Disable parallelism: `vitest run --no-threads`
4. Check imports: Ensure correct paths
5. Check mocks: Verify setup order
6. Check async: Ensure all promises are awaited
