# Browser Mode & E2E Testing

Vitest Browser Mode allows running tests in a real browser, providing access to browser globals and enabling true component/E2E testing.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Locators API](#locators-api)
- [Interactions](#interactions)
- [Assertions](#assertions)
- [Visual Regression](#visual-regression-testing)
- [Providers](#providers)
- [Limitations](#limitations)

---

## Installation

### Quick Setup
```bash
npx vitest init browser
```

### Manual Installation
```bash
# Playwright (recommended)
npm install -D vitest @vitest/browser-playwright

# WebdriverIO
npm install -D vitest @vitest/browser-webdriverio

# Preview only (local dev)
npm install -D vitest @vitest/browser-preview
```

---

## Configuration

### Basic Configuration
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
        // { browser: 'firefox' },
        // { browser: 'webkit' },
      ],
    },
  },
})
```

### With Framework Plugins
```typescript
// React
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
})
```

### Mixed Projects (Node + Browser)
```typescript
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

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

---

## Locators API

Locators find elements in the DOM. Use `page` from `vitest/browser`.

### Query Methods
```typescript
import { page } from 'vitest/browser'

// By text
page.getByText('Submit')
page.getByText(/submit/i)

// By role
page.getByRole('button')
page.getByRole('heading', { level: 1 })
page.getByRole('textbox', { name: 'Email' })

// By label
page.getByLabelText('Username')
page.getByLabelText(/password/i)

// By placeholder
page.getByPlaceholder('Enter email')

// By test id
page.getByTestId('submit-button')

// By title
page.getByTitle('Close')

// By alt text
page.getByAltText('Profile picture')

// Multiple elements
page.getByText('Item').nth(0)  // First match
page.getByText('Item').first()
page.getByText('Item').last()
```

### Locator Actions
```typescript
// Click
await page.getByRole('button').click()
await page.getByRole('button').dblclick()

// Type/Fill
await page.getByLabelText('Email').fill('test@example.com')
await page.getByLabelText('Email').type('test@example.com')

// Clear
await page.getByLabelText('Email').clear()

// Select
await page.getByRole('combobox').select('Option 1')

// Check/Uncheck
await page.getByRole('checkbox').check()
await page.getByRole('checkbox').uncheck()

// Focus/Blur
await page.getByRole('textbox').focus()
await page.getByRole('textbox').blur()

// Hover
await page.getByRole('menuitem').hover()

// Scroll
await page.getByTestId('section').scrollIntoView()
```

### Locator Queries
```typescript
// Get element content
const text = await page.getByRole('heading').text()
const value = await page.getByRole('textbox').inputValue()

// Check visibility
const isVisible = await page.getByRole('button').isVisible()
const isEnabled = await page.getByRole('button').isEnabled()
const isEditable = await page.getByRole('textbox').isEditable()

// Count elements
const count = await page.getByRole('listitem').count()

// Get attribute
const href = await page.getByRole('link').getAttribute('href')
```

---

## Interactions

Use `userEvent` for complex interactions.

```typescript
import { page, userEvent } from 'vitest/browser'

// Keyboard interactions
await userEvent.keyboard('ArrowDown')
await userEvent.keyboard('{Enter}')
await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}')

// Type with options
await userEvent.type(page.getByLabelText('Search'), 'hello', { delay: 50 })

// Click with modifiers
await userEvent.click(page.getByRole('button'), {
  ctrlKey: true,
  shiftKey: true,
})

// Drag and drop
await userEvent.drag(
  page.getByText('Drag me'),
  page.getByText('Drop here')
)

// Upload files
await userEvent.upload(
  page.getByLabelText('Upload'),
  [new File(['content'], 'file.txt')]
)

// Copy/Paste
await userEvent.copy(page.getByText('Copy me'))
await userEvent.paste(page.getByLabelText('Paste here'))

// Tab navigation
await userEvent.tab()  // Move to next focusable
await userEvent.tab({ shift: true })  // Move to previous
```

---

## Assertions

### DOM Assertions
```typescript
import { expect } from 'vitest'
import { page } from 'vitest/browser'

// Visibility
await expect.element(page.getByText('Hello')).toBeInTheDocument()
await expect.element(page.getByText('Hello')).toBeVisible()
await expect.element(page.getByText('Hello')).toBeHidden()

// Content
await expect.element(page.getByRole('heading')).toHaveTextContent('Welcome')
await expect.element(page.getByRole('heading')).toHaveTextContent(/welcome/i)
await expect.element(page.getByRole('paragraph')).toBeEmpty()

// State
await expect.element(page.getByRole('button')).toBeEnabled()
await expect.element(page.getByRole('button')).toBeDisabled()
await expect.element(page.getByRole('checkbox')).toBeChecked()
await expect.element(page.getByRole('textbox')).toBeEditable()
await expect.element(page.getByRole('textbox')).toHaveValue('test')

// Focus
await expect.element(page.getByRole('textbox')).toBeFocused()
await expect.element(page.getByRole('textbox')).toHaveFocus()

// Attributes
await expect.element(page.getByRole('link')).toHaveAttribute('href', '/home')
await expect.element(page.getByRole('img')).toHaveClass('avatar')
await expect.element(page.getByTestId('form')).toHaveClass(/active/)

// ARIA
await expect.element(page.getByRole('alert')).toHaveAccessibleName('Error')
await expect.element(page.getByRole('button')).toHaveAccessibleDescription('Submit form')
```

### Screenshot Assertions
```typescript
await expect.element(page.getByTestId('chart')).toMatchScreenshot()
await expect.element(page.getByTestId('chart')).toMatchScreenshot('chart-initial')
```

---

## Visual Regression Testing

### Configuration
```typescript
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      expect: {
        toMatchScreenshot: {
          threshold: 0.1,
        },
      },
    },
  },
})
```

### Usage
```typescript
import { page } from 'vitest/browser'

test('component renders correctly', async () => {
  render(<Button>Click me</Button>)

  await expect.element(page.getByRole('button')).toMatchScreenshot()
})

test('full page screenshot', async () => {
  render(<Dashboard />)

  await page.screenshot({ path: 'dashboard.png' })
})
```

---

## Providers

### Playwright (Recommended)
```typescript
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
  },
})
```

### WebdriverIO
```typescript
import { webdriverio } from '@vitest/browser-webdriverio'

export default defineConfig({
  test: {
    browser: {
      provider: webdriverio(),
      instances: [
        { browser: 'chrome' },
        { browser: 'firefox' },
        { browser: 'edge' },
        { browser: 'safari' },
      ],
    },
  },
})
```

### Docker Setup (CI)
```yaml
# docker-compose.yml
services:
  playwright:
    image: mcr.microsoft.com/playwright:v1.40.0-jammy
    ports:
      - "3000:3000"
    environment:
      - BROWSER_SERVER=ws://0.0.0.0:3000
```

---

## Limitations

### Thread Blocking Dialogs
Mock `alert`, `confirm`, `prompt` - they block execution:
```typescript
vi.stubGlobal('confirm', vi.fn(() => true))
vi.stubGlobal('alert', vi.fn())
```

### Spying on Module Exports
Cannot use `vi.spyOn` on imported objects. Use `vi.mock` with `spy: true`:
```typescript
vi.mock('./module.js', { spy: true })
vi.mocked(module.method).mockImplementation(() => 'mocked')
```

### WebSocket/Real-time
For WebSockets, mock or use real connections:
```typescript
vi.stubGlobal('WebSocket', MockWebSocket)
```
