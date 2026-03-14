# Mocking in Vitest

Comprehensive guide to mocking functions, modules, globals, timers, and more.

## Table of Contents
- [Mocking Functions](#mocking-functions)
- [Mocking Modules](#mocking-modules)
- [Mocking Globals](#mocking-globals)
- [Mocking Timers](#mocking-timers)
- [Mocking File System](#mocking-file-system)
- [Mocking Dates](#mocking-dates)
- [Mocking Requests](#mocking-requests)

---

## Mocking Functions

### Creating Mocks
```typescript
import { vi } from 'vitest'

// Create a mock function
const mockFn = vi.fn()

// Mock with implementation
const mockAdd = vi.fn((a, b) => a + b)

// Mock with return value
const mockGetValue = vi.fn().mockReturnValue(42)

// Mock with resolved promise
const mockFetch = vi.fn().mockResolvedValue({ data: 'test' })

// Mock with rejected promise
const mockError = vi.fn().mockRejectedValue(new Error('Failed'))
```

### Assertions on Mocks
```typescript
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledOnce()
expect(mockFn).toHaveBeenCalledTimes(3)
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenLastCalledWith('last')
expect(mockFn).toHaveReturned()
expect(mockFn).toHaveReturnedWith(42)
```

### Spy vs Mock
```typescript
const obj = {
  method: () => 'original',
}

// Spy - tracks calls, still calls original
vi.spyOn(obj, 'method')

// Mock implementation - replaces implementation
vi.spyOn(obj, 'method').mockImplementation(() => 'mocked')
vi.spyOn(obj, 'method').mockReturnValue('mocked')

// Mock once
vi.spyOn(obj, 'method').mockReturnValueOnce('first')
vi.spyOn(obj, 'method').mockReturnValueOnce('second')
```

### Restoring Mocks
```typescript
// In beforeEach
beforeEach(() => {
  vi.restoreAllMocks()
})

// Or enable in config
export default defineConfig({
  test: {
    restoreMocks: true,
  },
})
```

---

## Mocking Modules

### Basic Module Mock
```typescript
import { vi } from 'vitest'

// Mock entire module
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  fetchPosts: vi.fn().mockResolvedValue([]),
}))

// Use the mocked module
import { fetchUser } from './api'

test('fetches user', async () => {
  const user = await fetchUser(1)
  expect(user.name).toBe('Test')
})
```

### Partial Module Mock
```typescript
import { vi } from 'vitest'

vi.mock('./utils', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    // Only mock specific export
    generateId: vi.fn().mockReturnValue('mocked-id'),
  }
})
```

### Mock with Factory
```typescript
vi.mock('./config', () => ({
  config: {
    apiUrl: 'https://test.api.com',
    timeout: 5000,
  },
}))
```

### Mock Classes
```typescript
vi.mock('./Database', () => {
  const Database = vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([{ id: 1 }]),
    disconnect: vi.fn(),
  }))
  return { Database }
})
```

### Spy on Module (Browser Mode)
```typescript
// In browser mode, spyOn on modules doesn't work directly
// Use this pattern instead:
vi.mock('./module.js', { spy: true })

// Then mock specific exports
vi.mocked(module.method).mockImplementation(() => 'mocked')
```

---

## Mocking Globals

### stubGlobal
```typescript
// Stub a global variable
vi.stubGlobal('__APP_VERSION__', '1.0.0')

// Access it
expect(__APP_VERSION__).toBe('1.0.0')
```

### stubEnv
```typescript
// Stub environment variable
vi.stubEnv('NODE_ENV', 'test')
vi.stubEnv('API_URL', 'https://test.api.com')

// Automatically restored if unstubEnvs config is enabled
expect(process.env.API_URL).toBe('https://test.api.com')
```

### import.meta.env (Vite)
```typescript
// Modify Vite env variables
import.meta.env.VITE_API_URL = 'https://test.api.com'

// Or use stubEnv
vi.stubEnv('VITE_API_URL', 'https://test.api.com')
```

### Browser APIs
```typescript
// Mock localStorage
vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
})

// Mock fetch
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
}))

// Mock matchMedia
vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})))
```

---

## Mocking Timers

### Fake Timers Setup
```typescript
import { vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
```

### Controlling Time
```typescript
test('debounce works', async () => {
  const fn = vi.fn()
  const debounced = debounce(fn, 1000)

  debounced()
  debounced()
  debounced()

  expect(fn).not.toHaveBeenCalled()

  // Advance time by 1000ms
  await vi.advanceTimersByTimeAsync(1000)

  expect(fn).toHaveBeenCalledOnce()
})

test('setTimeout fires', async () => {
  const callback = vi.fn()

  setTimeout(callback, 5000)

  // Fast-forward all timers
  await vi.runAllTimersAsync()

  expect(callback).toHaveBeenCalled()
})
```

### Timer Methods
```typescript
// Run all pending timers
await vi.runAllTimersAsync()

// Run only pending timers (don't advance newly created)
await vi.runOnlyPendingTimersAsync()

// Advance by specific time
await vi.advanceTimersByTimeAsync(1000)

// Advance to next timer
await vi.advanceTimersToNextTimerAsync()

// Get elapsed time
vi.getMockedSystemTime()

// Set specific time
vi.setSystemTime(new Date('2024-01-01'))
```

---

## Mocking File System

### Using memfs
```bash
npm install -D memfs
```

```typescript
import { fs } from 'memfs'
import { vi } from 'vitest'

vi.mock('node:fs', () => ({ default: fs }))

test('reads file', () => {
  fs.writeFileSync('/test.txt', 'Hello World')

  const content = fs.readFileSync('/test.txt', 'utf-8')
  expect(content).toBe('Hello World')
})
```

### Using vi.mock
```typescript
vi.mock('node:fs', () => ({
  readFileSync: vi.fn().mockReturnValue('mocked content'),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
}))
```

---

## Mocking Dates

### Set System Time
```typescript
beforeEach(() => {
  vi.setSystemTime(new Date('2024-06-15T10:30:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

test('formats date correctly', () => {
  const now = new Date()
  expect(now.getFullYear()).toBe(2024)
  expect(now.getMonth()).toBe(5) // June is 5 (0-indexed)
})
```

### Mock Date.now
```typescript
vi.spyOn(Date, 'now').mockReturnValue(1718444600000)
```

---

## Mocking Requests

### Mock fetch
```typescript
vi.stubGlobal('fetch', vi.fn())

test('fetches data', async () => {
  const mockFetch = vi.mocked(fetch)
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'Test' }),
  })

  const result = await fetchData()

  expect(mockFetch).toHaveBeenCalledWith('/api/data')
  expect(result).toEqual({ id: 1, name: 'Test' })
})
```

### Mock axios
```typescript
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}))
```

### Mock msw (Recommended)
```bash
npm install -D msw
```

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/user', () => {
    return HttpResponse.json({ id: 1, name: 'Test' })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
