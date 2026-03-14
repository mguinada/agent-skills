# Component Testing

Component testing patterns for React, Vue, Svelte, and other frameworks using Vitest Browser Mode.

## Table of Contents
- [React Testing](#react-testing)
- [Vue Testing](#vue-testing)
- [Svelte Testing](#svelte-testing)
- [Other Frameworks](#other-frameworks)
- [Testing Library Patterns](#testing-library-patterns)

---

## React Testing

### Installation
```bash
npm install -D vitest-browser-react
```

### Basic Component Test
```tsx
import { render } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import Counter from './Counter'

test('counter increments', async () => {
  const screen = render(<Counter />)

  await expect.element(screen.getByText('Count: 0')).toBeInTheDocument()

  await screen.getByRole('button', { name: 'Increment' }).click()

  await expect.element(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### Props and State
```tsx
import { render } from 'vitest-browser-react'
import { expect, test, vi } from 'vitest'
import UserProfile from './UserProfile'

test('displays user name from props', async () => {
  const screen = render(<UserProfile name="Alice" email="alice@example.com" />)

  await expect.element(screen.getByText('Alice')).toBeInTheDocument()
  await expect.element(screen.getByText('alice@example.com')).toBeInTheDocument()
})

test('calls onLogout when clicked', async () => {
  const onLogout = vi.fn()
  const screen = render(<UserProfile name="Alice" onLogout={onLogout} />)

  await screen.getByRole('button', { name: 'Logout' }).click()

  expect(onLogout).toHaveBeenCalledOnce()
})
```

### Hooks and Effects
```tsx
import { render } from 'vitest-browser-react'
import { expect, test, vi } from 'vitest'
import DataFetcher from './DataFetcher'

test('fetches and displays data', async () => {
  const screen = render(<DataFetcher url="/api/data" />)

  // Loading state
  await expect.element(screen.getByText('Loading...')).toBeInTheDocument()

  // Wait for data
  await expect.element(screen.getByText('Data loaded')).toBeInTheDocument()
})
```

### Context and Providers
```tsx
import { render } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import { ThemeProvider } from './ThemeContext'
import ThemedButton from './ThemedButton'

test('button uses theme context', async () => {
  const screen = render(
    <ThemeProvider theme="dark">
      <ThemedButton />
    </ThemeProvider>
  )

  const button = screen.getByRole('button')
  await expect.element(button).toHaveClass('dark-theme')
})
```

### Async Components
```tsx
import { render } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import AsyncList from './AsyncList'

test('loads items asynchronously', async () => {
  const screen = render(<AsyncList />)

  // Initial state
  await expect.element(screen.getByText('Loading...')).toBeInTheDocument()

  // After loading
  await expect.element(screen.getByRole('listitem')).toBeInTheDocument()
  const items = await screen.getByRole('listitem').all()
  expect(items.length).toBeGreaterThan(0)
})
```

---

## Vue Testing

### Installation
```bash
npm install -D vitest-browser-vue
```

### Basic Component Test
```typescript
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import Counter from './Counter.vue'

test('counter increments', async () => {
  const screen = render(Counter)

  await expect.element(screen.getByText('Count: 0')).toBeInTheDocument()

  await screen.getByRole('button').click()

  await expect.element(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### With Props
```typescript
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import Greeting from './Greeting.vue'

test('displays greeting with name', async () => {
  const screen = render(Greeting, {
    props: {
      name: 'World',
    },
  })

  await expect.element(screen.getByText('Hello, World!')).toBeInTheDocument()
})
```

### With Slots
```typescript
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import Card from './Card.vue'

test('renders slot content', async () => {
  const screen = render(Card, {
    slots: {
      default: 'Card content here',
      header: 'Card Title',
    },
  })

  await expect.element(screen.getByText('Card Title')).toBeInTheDocument()
  await expect.element(screen.getByText('Card content here')).toBeInTheDocument()
})
```

### With Provide/Inject
```typescript
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import { createI18n } from 'vue-i18n'
import TranslatedText from './TranslatedText.vue'

test('displays translated text', async () => {
  const i18n = createI18n({
    locale: 'en',
    messages: { en: { hello: 'Hello' } },
  })

  const screen = render(TranslatedText, {
    global: {
      plugins: [i18n],
    },
  })

  await expect.element(screen.getByText('Hello')).toBeInTheDocument()
})
```

---

## Svelte Testing

### Installation
```bash
npm install -D vitest-browser-svelte
```

### Basic Component Test
```typescript
import { render } from 'vitest-browser-svelte'
import { expect, test } from 'vitest'
import Counter from './Counter.svelte'

test('counter increments', async () => {
  const screen = render(Counter)

  await expect.element(screen.getByText('Count: 0')).toBeInTheDocument()

  await screen.getByRole('button').click()

  await expect.element(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### With Props
```typescript
import { render } from 'vitest-browser-svelte'
import { expect, test } from 'vitest'
import Greeting from './Greeting.svelte'

test('displays greeting with name', async () => {
  const screen = render(Greeting, {
    name: 'World',
  })

  await expect.element(screen.getByText('Hello, World!')).toBeInTheDocument()
})
```

### Component Events
```typescript
import { render } from 'vitest-browser-svelte'
import { expect, test, vi } from 'vitest'
import Button from './Button.svelte'

test('emits click event', async () => {
  const onClick = vi.fn()
  const screen = render(Button, {
    onclick: onClick,
  })

  await screen.getByRole('button').click()

  expect(onClick).toHaveBeenCalledOnce()
})
```

---

## Other Frameworks

### Solid (with testing-library)
```bash
npm install -D @solidjs/testing-library
```

```tsx
import { render } from '@solidjs/testing-library'
import { page } from 'vitest/browser'
import { expect, test } from 'vitest'
import Counter from './Counter'

test('counter works', async () => {
  const { baseElement } = render(() => <Counter />)
  const screen = page.elementLocator(baseElement)

  await screen.getByRole('button').click()
  await expect.element(screen.getByText('1')).toBeInTheDocument()
})
```

### Lit
```bash
npm install -D vitest-browser-lit
```

```typescript
import { render } from 'vitest-browser-lit'
import { html } from 'lit'
import { expect, test } from 'vitest'
import './my-element'

test('custom element works', async () => {
  const screen = render(html`<my-element name="Test"></my-element>`)

  await expect.element(screen.getByText('Hello, Test')).toBeInTheDocument()
})
```

---

## Testing Library Patterns

### Query Priority (from testing-library philosophy)
1. **getByRole** - Most preferred, accessibility-focused
2. **getByLabelText** - Form elements
3. **getByPlaceholderText** - Inputs
4. **getByText** - General text content
5. **getByTestId** - Last resort

### Common Patterns

#### Form Testing
```typescript
test('form submission', async () => {
  const onSubmit = vi.fn()
  const screen = render(<ContactForm onSubmit={onSubmit} />)

  await screen.getByLabelText(/name/i).fill('John Doe')
  await screen.getByLabelText(/email/i).fill('john@example.com')
  await screen.getByRole('button', { name: 'Submit' }).click()

  expect(onSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  })
})
```

#### List Rendering
```typescript
test('renders list items', async () => {
  const items = ['Apple', 'Banana', 'Cherry']
  const screen = render(<ItemList items={items} />)

  for (const item of items) {
    await expect.element(screen.getByText(item)).toBeInTheDocument()
  }

  const listItems = await screen.getByRole('listitem').all()
  expect(listItems).toHaveLength(3)
})
```

#### Conditional Rendering
```typescript
test('shows error when invalid', async () => {
  const screen = render(<Form />)

  await screen.getByRole('button', { name: 'Submit' }).click()

  await expect.element(screen.getByText('Email is required')).toBeInTheDocument()
})
```

#### Async Updates
```typescript
test('updates after async operation', async () => {
  const screen = render(<AsyncComponent />)

  await screen.getByRole('button', { name: 'Load Data' }).click()

  // Wait for element to appear
  await expect.element(screen.getByText('Data loaded')).toBeInTheDocument()
})
```
