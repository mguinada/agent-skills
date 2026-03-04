# Project Structure Detection

Detailed guide for detecting and understanding project structure types when creating AGENTS.md files.

## Detection Algorithm

### Step 1: Scan for Monorepo Indicators

```bash
# Check for common monorepo directories
if [ -d "apps" ] || [ -d "packages" ] || [ -d "services" ]; then
    echo "Monorepo indicator: directory structure"
fi

# Check for workspace configs
if [ -f "pnpm-workspace.yaml" ] || [ -f "package.json" ] && grep -q '"workspaces"' package.json; then
    echo "Monorepo indicator: workspace config"
fi

# Check for build systems
if [ -f "turbo.json" ] || [ -f "nx.json" ] || [ -f "lerna.json" ]; then
    echo "Monorepo indicator: monorepo build system"
fi
```

### Step 2: Analyze Package Structure

```bash
# Count packages in each location
find apps -name "package.json" -type f 2>/dev/null | wc -l
find packages -name "package.json" -type f 2>/dev/null | wc -l
find services -name "package.json" -type f 2>/dev/null | wc -l

# Check for workspace dependencies in root package.json
grep -o '"@[^"]*":\s*"workspace:\*"' package.json | wc -l
```

### Step 3: Extract Package Information

```bash
# Get all package names
for pkg_json in $(find . -name "package.json" -not -path "*/node_modules/*"); do
    name=$(jq -r '.name // empty' "$pkg_json")
    if [ -n "$name" ]; then
        echo "$name:$pkg_json"
    fi
done
```

## Package Purpose Detection

### Infer Purpose from Package Name

| Name Pattern | Likely Purpose | Verification |
|--------------|----------------|--------------|
| `*api*`, `*backend*`, `*server*` | Backend/API | Check for server frameworks (express, fastify, etc.) |
| `*web*`, `*frontend*`, `*app*`, `*client*` | Frontend app | Check for React, Vue, Angular, Next.js |
| `*ui*`, `*components*`, `*design*` | Component library | Check for React components, Storybook |
| `*util*`, `*helper*`, `*common*` | Utilities | Check for utility functions |
| `*types*`, `*tsconfig*` | TypeScript types | Check for .d.ts files |
| `*config*`, `*settings*` | Configuration | Check for config files |
| `*cli*`, `*command*` | CLI tool | Check for bin entry |

### Infer Purpose from Dependencies

```bash
# Detect API/backend packages
if jq -e '.dependencies | keys | any(.; test("express|fastify|koa|hapi|nestjs"))' package.json >/dev/null; then
    echo "Purpose: Backend API"
fi

# Detect frontend packages
if jq -e '.dependencies | keys | any(.; test("react|vue|angular|next|nuxt"))' package.json >/dev/null; then
    echo "Purpose: Frontend application"
fi

# Detect component libraries
if jq -e '.dependencies | keys | any(.; test("react|vue")) and (.keywords // [] | any(.; test("component|ui")))' package.json >/dev/null; then
    echo "Purpose: Component library"
fi
```

### Infer Purpose from Description Field

```bash
# Extract and use package description
jq -r '.description // empty' package.json
```

## Structure Type Classification

### Monorepo Types

| Type | Characteristics | Example Commands |
|------|-----------------|------------------|
| **Apps + Packages** | `apps/` for applications, `packages/` for libraries | Turborepo, Nx |
| **Workspace Only** | Single-level with workspace dependencies | pnpm, Yarn workspaces |
| **Multi-Repo** | Independent repos linked via git | Lerna, no workspace config |
| **Service-Based** | `services/` instead of packages | Docker-based, microservices |

### Polyrepo Types

| Type | Characteristics |
|------|-----------------|
| **Single Package** | One package.json at root |
| **Multi-Project** | Multiple unrelated projects in one repo |
| **Monolith** | Large single application |

## Confidence Assessment

### High Confidence (Proceed without asking)

- 3+ monorepo indicators present
- Clear workspace config with multiple packages
- Monorepo build system (turbo.json, nx.json, lerna.json)

### Medium Confidence (Show findings, ask user)

- 1-2 monorepo indicators
- Ambiguous structure (e.g., has apps/ but no workspace config)
- Custom or unusual monorepo setup

### Low Confidence (Ask user directly)

- No clear indicators
- Mixed signals (e.g., workspace config but single package)
- Unfamiliar build system

## Detection Output Format

When reporting detection results to user:

```markdown
## Project Structure Detection

**Detected Type:** Monorepo
**Confidence:** High

**Evidence:**
- ✅ `apps/` directory with 3 applications
- ✅ `packages/` directory with 5 libraries
- ✅ `pnpm-workspace.yaml` workspace config
- ✅ `turbo.json` build system

**Discovered Packages:**
- `@myapp/web` (apps/web) - Frontend application
- `@myapp/api` (apps/api) - Backend API
- `@myapp/backend` (apps/backend) - Alternative backend
- `@myapp/ui` (packages/ui) - Shared components
- ...

Does this look correct?
```

## Edge Cases

### Yarn Workspaces v1 vs v2

```bash
# v1: workspaces in package.json
grep '"workspaces"' package.json

# v2: yarn workspace command
yarn workspaces list 2>/dev/null
```

### pnpm Workspace

```bash
# Check workspace file
cat pnpm-workspace.yaml

# List all packages
pnpm list --depth 0 -r
```

### Nx Workspace

```bash
# Check for nx.json
cat nx.json

# List projects
npx nx show projects
```

### Turborepo without Workspace Config

Some Turborepo projects don't use workspaces. Detect by:

```bash
# Has turbo.json
[ -f turbo.json ]

# But no workspace config
[ ! -f pnpm-workspace.yaml ] && ! grep -q '"workspaces"' package.json

# Verify by checking for package task delegation
grep -q '"turbo run"' package.json
```

## Hybrid Structures

Some projects mix patterns. Example:

```
my-project/
├── apps/              # Monorepo apps
├── packages/          # Monorepo packages
└── server/            # Separate service (not in workspace)
```

**Detection Strategy:**
1. Identify the primary pattern (usually the majority)
2. Note the exception separately in AGENTS.md
3. Provide commands for each pattern
