# CI/CD Integration

Patterns for integrating Vitest with continuous integration systems.

## Table of Contents
- [GitHub Actions](#github-actions)
- [Caching Strategies](#caching-strategies)
- [Browser Testing in CI](#browser-testing-in-ci)
- [Coverage Reporting](#coverage-reporting)
- [Parallelization](#parallelization)
- [Other CI Systems](#other-ci-systems)

---

## GitHub Actions

### Basic Workflow
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - run: npm test
```

### With Coverage
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - run: npx vitest run --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

### Full CI Workflow
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run

  test-browser:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx vitest run --project=browser

  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run --coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  build:
    needs: [lint, test, test-browser]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

---

## Caching Strategies

### npm Cache
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # or 'yarn' or 'pnpm'
```

### Vitest Cache
```yaml
- name: Cache Vitest
  uses: actions/cache@v4
  with:
    path: node_modules/.vitest
    key: vitest-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      vitest-${{ runner.os }}-
```

### Playwright Browsers
```yaml
- name: Cache Playwright
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

- name: Install Playwright
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps
```

### Full Caching Example
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - name: Cache Playwright
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}

      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx vitest run
```

---

## Browser Testing in CI

### Playwright Setup
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run browser tests
  run: npx vitest run --browser.headless
```

### Docker Container
```yaml
jobs:
  test-browser:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.40.0-jammy
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npx vitest run --browser.headless
```

### Matrix Testing
```yaml
jobs:
  test-browser:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps ${{ matrix.browser }}
      - run: npx vitest run --browser.instances='[{"browser":"${{ matrix.browser }}"}]'
```

---

## Coverage Reporting

### Codecov
```yaml
- run: npx vitest run --coverage

- name: Upload to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
    verbose: true
```

### Coveralls
```yaml
- run: npx vitest run --coverage

- name: Coveralls
  uses: coverallsapp/github-action@v2
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### PR Comment with Coverage
```yaml
- name: Get Coverage
  id: coverage
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    echo "coverage=$COVERAGE" >> $GITHUB_OUTPUT

- name: Comment PR
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: 'Coverage: ${{ steps.coverage.outputs.coverage }}%'
      })
```

---

## Parallelization

### Shard Tests
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run --shard=${{ matrix.shard }}
```

### Merge Reports
```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx vitest run --shard=${{ matrix.shard }} --reporter=json --outputFile=results-${{ matrix.shard }}.json
      - uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.shard }}
          path: results-*.json

  merge:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
      - run: npx vitest merge-reports ./test-results-*
```

---

## Other CI Systems

### GitLab CI
```yaml
# .gitlab-ci.yml
test:
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npx vitest run
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
```

### CircleCI
```yaml
# .circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/node:20
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-deps-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-deps-{{ checksum "package-lock.json" }}
      - run: npx vitest run
```

### Jenkins
```groovy
pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Test') {
      steps {
        sh 'npx vitest run --coverage'
      }
      post {
        always {
          junit 'junit.xml'
        }
      }
    }
  }
}
```

### Azure Pipelines
```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: |
      npm ci
      npx vitest run --coverage
    displayName: 'Run tests'

  - task: PublishCodeCoverageResults@2
    inputs:
      summaryFileLocation: 'coverage/lcov.info'
```
