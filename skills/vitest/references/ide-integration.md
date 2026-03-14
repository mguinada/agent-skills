# IDE Integration

Get the best experience using Vitest in your IDE.

## VS Code Extension

### Installation

Install the official Vitest extension from the VS Code Marketplace:
- Open Extensions (Ctrl/Cmd+Shift+X)
- Search for "Vitest"
- Install the one by Vitest Team

### Features

- Run/debug tests from test file
- Inline test results
- Code lenses for running individual tests
- Automatic configuration detection
- Watch mode toggle
- Coverage display

### Configuration

```json
// .vscode/settings.json
{
  "vitest.enable": true,
  "vitest.debugPort": 9229,
  "vitest.nodeExecutablePath": "node"
}
```

### Running Tests

- Click the "Run Test" button above test definitions
- Right-click a test → "Run Vitest Test"
- Use the test explorer panel

### Debugging Tests

1. Click the "Debug Test" button
2. Set breakpoints in your code
3. The debugger will stop at breakpoints

### Troubleshooting

```json
// .vscode/settings.json
{
  "vitest.showMessagesOnOutput": true,
  "vitest.traceOutput": true
}
```

### Extension Settings

| Setting | Description |
|---------|-------------|
| `vitest.enable` | Enable the extension |
| `vitest.debugPort` | Port for debugging |
| `vitest.nodeExecutablePath` | Path to Node.js binary |
| `vitest.packageManager` | npm, yarn, pnpm, bun |
| `vitest.logLevel` | Log level for Vitest output |
| `debugTest.configuration` | Launch config for debugging |

## JetBrains IDEs (WebStorm, PhpStorm, etc.)

### Configuration

1. Open Settings/Preferences
2. Go to Languages & Frameworks → JavaScript → Test Runner
3. Set Test Runner to "Vitest"

### Features

- Run/debug tests via gutter icons
- Test results in the "Run" panel
- Navigate from test results to source
- Filter tests in the tree view

### Running Tests

- Click the green play button next to tests
- Right-click a test file → "Run '...'"
- Create run configurations for test groups

### Debugging

1. Set breakpoints in your code
2. Click the bug icon to debug a test
3. Use the debugger panel to inspect variables

### Configuration Options

In your run configuration:
- Vitest options (CLI args)
- Environment variables
- Working directory

## Vim/Neovim

### Using Vim-Test

```vim
" Add to your vimrc
let test#strategy = "neovim"
let test#javascript#vitest#file_pattern = '\.test\.\(js\|ts\|jsx\|tsx\)$'
let test#javascript#runner = 'vitest'
```

Commands:
- `:TestFile` - Run current test file
- `:TestNearest` - Run test under cursor
- `:TestLast` - Run last test again

### Using Neovim + nvim-dap

```lua
-- Example Lua config
local dap = require('dap')

-- Node.js/Vitest debug adapter
dap.adapters.node2 = {
  type = 'executable',
  command = 'node',
  args = { '/path/to/vscode-node-debug2/out/src/nodeDebug.js' }
}

-- Vitest debug configuration
dap.configurations.typescript = {
  {
    type = 'node2',
    request = 'launch',
    name = 'Debug Vitest Test',
    program = '${workspaceFolder}/node_modules/vitest/vitest.mjs',
    args = { 'run', '--no-threads', '${file}' },
    cwd = '${workspaceFolder}'
  }
}
```

## Other Editors

### Sublime Text

Use a plugin that supports `npm test` or set up a build system:

```json
// .sublime-project
{
  "build_systems": [
    {
      "name": "Vitest",
      "cmd": ["npm", "test", "--", "--run", "$file"],
      "working_dir": "$project_path",
      "selector": "source.ts"
    }
  ]
}
```

### Emacs

```elisp
;; Using npm-mode or similar
(use-package npm-mode
  :config
  (npm-mode-keybinding))
```

## VS Code Debug Configuration

For more control, create a launch configuration:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Current Test",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "${file}", "--no-threads"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "smartStep": true,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug All Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--no-threads"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "smartStep": true
    },
    {
      "name": "Debug Specific Test",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node/browser/vitest",
      "args": ["run", "-t", "test name", "--no-threads"],
      "console": "integratedTerminal"
    }
  }
}
```

## Using Node Inspector

### Debug Mode

```bash
node --inspect-brk ./node_modules/.bin/vitest run
```

Then open `chrome://inspect` in Chrome.

### With Webkit

```bash
node --inspect-brk ./node_modules/.bin/vitest run --no-threads
```

### In Package.json

```json
{
  "scripts": {
    "test:debug": "node --inspect-brk ./node_modules/.bin/vitest run"
  }
}
```

## Troubleshooting

### Extension Not Detecting Tests

1. Check `vitest.config.ts` location
2. Verify your test file patterns
3. Check for TypeScript errors
4. Check for incorrect import paths

### Debug Not Working

1. Use `--no-threads` for debugging
2. Verify Node.js version compatibility
3. Check for conflicting debug ports
4. Ensure source maps are enabled:
   ```typescript
   export default defineConfig({
     test: {
      // ... config
    }
  })
  ```

### TypeScript Issues

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "vitest/importMeta"]
  }
}
```

### Path Aliases Not Working

Ensure Vite config is shared:

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    // Inherits alias from Vite config
  }
})
```

### No Tests Found

Check your config:
```typescript
export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**']
  }
})
```
