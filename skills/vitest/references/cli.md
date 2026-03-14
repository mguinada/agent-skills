# Vitest CLI Reference

Complete command-line interface for Vitest.

## Commands

### `vitest`
Start Vitest in watch mode (dev) or run mode (CI).

```bash
vitest                    # Watch mode in dev, run in CI
vitest foobar             # Run only files containing "foobar"
vitest ./test/file.test.ts:10  # Run test at line 10
```

### `vitest run`
Run tests once and exit.

```bash
vitest run                # Run all tests once
vitest run --coverage     # Run with coverage
```

### `vitest watch`
Force watch mode even in CI.

```bash
vitest watch
```

### `vitest dev`
Alias for `vitest watch`.

### `vitest related`
Run tests that cover a list of source files.

```bash
vitest related src/index.ts src/utils.ts
```

### `vitest bench`
Run only benchmark tests.

```bash
vitest bench
```

## Options

### Test Selection
```bash
vitest run -t "test name"          # Filter by test name pattern
vitest run --testNamePattern="api" # Same as -t
vitest run --tags-filter=unit      # Filter by tag
vitest run --project=unit          # Run specific project
vitest run --shard=1/3             # Run shard 1 of 3
```

### Run Mode
```bash
vitest run --watch                 # Watch mode
vitest run --run                   # Run once (disable watch)
vitest run --single-thread         # Run in single thread
vitest run --no-threads            # Disable threading
vitest run --no-file-parallelism   # Run files sequentially
```

### Output
```bash
vitest run --reporter=verbose      # Verbose reporter
vitest run --reporter=json         # JSON output
vitest run --reporter=html         # HTML report
vitest run --reporter=dot          # Dot reporter
vitest run --reporter=tap          # TAP format
vitest run --reporter=junit        # JUnit XML
vitest run --reporter=blob         # Blob for merging
vitest run --reporter=tree         # Tree view
```

### Coverage
```bash
vitest run --coverage              # Enable coverage
vitest run --coverage.all          # Include uncovered files
vitest run --coverage.reporter=html
```

### Browser Mode
```bash
vitest run --browser               # Run in browser
vitest run --browser.headless      # Headless browser
vitest run --browser.name=firefox  # Specific browser
```

### Debugging
```bash
vitest run --inspect               # Enable Node inspector
vitest run --inspect-brk           # Break on start
```

### File Handling
```bash
vitest run --dir=tests             # Test directory
vitest run --setupFiles=./setup.ts # Setup files
vitest run --globalSetup=./global.ts
vitest run --include="**/*.test.ts"
vitest run --exclude="**/node_modules/**"
```

### Snapshots
```bash
vitest run -u                      # Update snapshots
vitest run --update                # Same as -u
```

### Other Options
```bash
vitest run --passWithNoTests       # Pass if no tests found
vitest run --failOnEmptyTestSuite  # Fail if no tests
vitest run --bail=5                # Stop after 5 failures
vitest run --retry=3               # Retry failed tests
vitest run --timeout=10000         # Default timeout (ms)
vitest run --testTimeout=10000     # Test timeout
vitest run --hookTimeout=10000     # Hook timeout
vitest run --silent                # Silent mode
vitest run --color                 # Force colors
vitest run --no-color              # Disable colors
```

## Configuration
```bash
vitest run --config=vitest.config.ts
vitest run --config=./custom.config.js
```

## Environment
```bash
vitest run --environment=jsdom     # Test environment
vitest run --environment=node
vitest run --environment=happy-dom
```

## Merge Reports
```bash
vitest --merge-reports=./reports   # Merge blob reports
vitest --merge-reports --reporter=json
```

## List Information
```bash
vitest --list                      # List all tests
vitest --list --json               # List as JSON
vitest --list-tags                 # List all tags
vitest --list-tags=json            # Tags as JSON
```

## Help & Version
```bash
vitest --help                      # Show help
vitest --version                   # Show version
```

## CLI in Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:browser": "vitest --browser",
    "test:unit": "vitest run --project=unit",
    "test:e2e": "vitest run --project=e2e",
    "test:watch": "vitest watch"
  }
}
```

## Line Number Filtering

Run specific tests by file and line number:

```bash
# Run test at line 10
vitest test/example.test.ts:10

# Run multiple lines
vitest test/example.test.ts:10 test/other.test.ts:25

# Full path required
vitest ./test/example.test.ts:10     # ✅ Works
vitest example.test.ts:10            # ❌ Won't work
```

## Sharding for CI

Split tests across multiple CI jobs:

```bash
# Job 1: Run first third
vitest run --shard=1/3

# Job 2: Run second third
vitest run --shard=2/3

# Job 3: Run last third
vitest run --shard=3/3
```

Combine with blob reporter for merging:

```yaml
# GitHub Actions matrix
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
steps:
  - run: vitest run --shard=${{ matrix.shard }} --reporter=blob --outputFile=reports/${{ matrix.shard }}.json
