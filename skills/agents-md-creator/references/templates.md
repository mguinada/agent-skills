# AGENTS.md Templates

Ready-to-use templates for different project types. Customize based on actual project structure.

## Minimal Template (New Projects)

```markdown
# Project Name

Brief one-line description of what this project does.

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Lint code |

## Repository Structure

```
.
├── src/          # Source code
├── tests/        # Test files
├── package.json  # Dependencies and scripts
└── README.md     # Project documentation
```

## Key Entry Points

- Main entry: `src/index.ts`
- Configuration: `src/config.ts`
- Routes: `src/routes/`
```

## Monorepo Template (Turborepo)

```markdown
# Project Name

Brief one-line description.

## Essential Commands

| Command | Purpose |
|---------|---------|
| `turbo run dev` | Start all development servers |
| `turbo run build` | Build all packages |
| `turbo run test` | Run all tests |
| `turbo run build --affected` | Build only changed packages |

## Monorepo Structure

| Package | Location | Purpose | Key commands |
|---------|----------|---------|--------------|
| [detected-backend] | apps/[dir] | Backend API | `turbo run dev --filter=[package]` |
| [detected-frontend] | apps/[dir] | Frontend app | `turbo run dev --filter=[package]` |
| [detected-ui-lib] | packages/[dir] | Shared UI | `turbo run build --filter=[package]` |

## Working with Packages

- Run task in specific package: `turbo run <task> --filter=<package>`
- Run only changed packages: `turbo run <task> --affected`
- Include dependents: `turbo run <task> --filter=...<package>`
- Run by directory pattern: `turbo run <task> --filter=./apps/*`

## Repository Structure

```
.
├── apps/              # Application packages
├── packages/          # Shared libraries
├── turbo.json         # Turborepo configuration
└── package.json       # Root package.json
```
```

## Monorepo Template (Nx)

```markdown
# Project Name

Brief one-line description.

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npx nx run-many -t dev` | Start all development servers |
| `npx nx run-many -t build` | Build all projects |
| `npx nx run-many -t test` | Run all tests |
| `npx nx affected -t build` | Build only affected projects |

## Monorepo Structure

| Project | Type | Purpose | Key commands |
|---------|------|---------|--------------|
| [detected-backend] | application | Backend API | `npx nx run backend:dev` |
| [detected-frontend] | application | Frontend app | `npx nx run frontend:dev` |
| [detected-ui-lib] | library | Shared UI | `npx nx run ui:build` |

## Working with Projects

- Run task in specific project: `npx nx run <project>:<task>`
- Run only affected projects: `npx nx affected -t <task>`
- Run task by project type: `npx nx run-many -t <task> -p=<pattern>`
- Visualize project graph: `npx nx graph`

## Repository Structure

```
.
├── apps/              # Application projects
├── libs/              # Library projects
├── nx.json            # Nx configuration
└── package.json       # Root package.json
```
```

## Monorepo Template (pnpm Workspace)

```markdown
# Project Name

Brief one-line description.

## Essential Commands

| Command | Purpose |
|---------|---------|
| `pnpm -r dev` | Run dev in all packages |
| `pnpm -r build` | Build all packages |
| `pnpm -r test` | Run all tests |
| `pnpm --filter <package> dev` | Run dev in specific package |

## Monorepo Structure

| Package | Location | Purpose | Key commands |
|---------|----------|---------|--------------|
| [detected-backend] | apps/[dir] | Backend API | `pnpm --filter [package] dev` |
| [detected-frontend] | apps/[dir] | Frontend app | `pnpm --filter [package] dev` |
| [detected-ui-lib] | packages/[dir] | Shared UI | `pnpm --filter [package] build` |

## Working with Packages

- Run in specific package: `pnpm --filter <package> <command>`
- Run in package + dependencies: `pnpm --filter <package>... <command>`
- Run in package + dependents: `pnpm --filter ...<package> <command>`
- Run by pattern: `pnpm --filter "./apps/*" <command>`

## Repository Structure

```
.
├── apps/                 # Application packages
├── packages/             # Shared libraries
├── pnpm-workspace.yaml   # pnpm workspace config
└── package.json          # Root package.json
```
```

## Backend Service Template

```markdown
# Project Name

Brief description of the backend service.

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:watch` | Watch mode testing |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |

## Environment Setup

Required environment variables:

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
# DATABASE_URL=
# API_KEY=
# PORT=3000
```

## Repository Structure

```
.
├── src/
│   ├── routes/      # API route handlers
│   ├── services/    # Business logic
│   ├── models/      # Data models
│   ├── middleware/  # Express middleware
│   └── index.ts     # Application entry
├── tests/           # Test files
├── prisma/          # Database schema (if using Prisma)
└── package.json
```

## Key Entry Points

- Server entry: `src/index.ts`
- Route definitions: `src/routes/`
- Database client: `src/db.ts` (if applicable)
```

## Full Stack Monorepo Template

```markdown
# Project Name

Full-stack monorepo with frontend, backend, and shared packages.

## Essential Commands

| Command | Purpose |
|---------|---------|
| `turbo run dev` | Start all services in development |
| `turbo run build` | Build all packages |
| `turbo run test` | Run all tests |
| `turbo run dev --filter=@acme/web` | Start only frontend |
| `turbo run dev --filter=@acme/api` | Start only backend |

## Monorepo Structure

| Package | Location | Purpose | Port | Commands |
|---------|----------|---------|------|----------|
| `@acme/web` | apps/web | Next.js frontend | 3000 | `turbo run dev --filter=@acme/web` |
| `@acme/api` | apps/api | Express backend | 4000 | `turbo run dev --filter=@acme/api` |
| `@acme/admin` | apps/admin | Admin dashboard | 3001 | `turbo run dev --filter=@acme/admin` |
| `@acme/ui` | packages/ui | React components | N/A | `turbo run build --filter=@acme/ui` |
| `@acme/types` | packages/types | Shared TypeScript types | N/A | `turbo run build --filter=@acme/types` |
| `@acme/config` | packages/config | ESLint, TSConfig shared | N/A | N/A |

## Development Workflow

### Starting Development

```bash
# Start all services
turbo run dev

# Start only web + api
turbo run dev --filter=@acme/web... --filter=@acme/api
```

### Database Setup

```bash
# Located in apps/api/prisma
cd apps/api
npx prisma migrate dev
npx prisma generate
```

## Repository Structure

```
.
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Express/Next.js backend
│   └── admin/        # Admin interface
├── packages/
│   ├── ui/           # Shared components
│   ├── types/        # Shared types
│   └── config/       # Shared config
├── turbo.json
└── package.json
```

## Service Communication

- Frontend → Backend: HTTP via `/api/*` routes
- Shared types ensure type safety across services
- API routes defined in `apps/api/src/routes/`
```

## Progressive Disclosure Enhanced Template

```markdown
# Project Name

Brief description.

## Information Recording Principles

This document uses progressive disclosure. See [Reference Guide](docs/references/progressive-disclosure.md) for details.

### Level 1 (This file) contains:
- Essential commands
- Iron rules/prohibitions
- Common error diagnostics
- Code patterns

### Level 2 (docs/references/) contains:
- Detailed SOP flows
- Edge case handling
- Historical decisions

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development |
| `npm run build` | Build for production |
| `npm test` | Run tests |

## Reference Index

| When to read | Document | What you'll find |
|--------------|----------|------------------|
| Setting up dev environment | `docs/references/setup.md` | Env vars, dependencies |
| Deploying to production | `docs/references/deployment.md` | Deploy process, CI/CD |
| Adding new features | `docs/references/development.md` | Coding patterns, conventions |

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `src/` | Source code |
| `tests/` | Test files |
| `docs/` | Documentation |

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Cannot find module` | Dependency not installed | `npm install` |
| Port already in use | Previous dev server running | `lsof -ti:3000 \| xargs kill` |
| Build fails after dependency change | Cache issue | `rm -rf node_modules .turbo && npm install` |

## Before Modifying Code

| What you're changing | Read this first | Key gotchas |
|---------------------|-----------------|-------------|
| Build configuration | `docs/references/build.md` | Order matters |
| API routes | `docs/references/api.md` | Versioning required |

## Reference Trigger Index

| When to read | Document |
|--------------|----------|
| Build fails | `docs/references/build.md` |
| Tests fail | `docs/references/testing.md` |
| Deployment issues | `docs/references/deployment.md` |
```

## Template Customization Guidelines

### What to Customize

1. **Replace placeholders:**
   - `[detected-backend]` → Actual package name
   - `[dir]` → Actual directory name

2. **Update commands:**
   - Match actual package manager (npm, pnpm, yarn, bun)
   - Match actual build system (turbo, nx, workspace scripts)

3. **Add project-specific:**
   - Important environment variables
   - Key architectural decisions
   - Project-specific commands

### What to Keep Minimal

- Don't add extensive explanations
- Don't duplicate what's in README.md
- Don't include verbose examples
- Keep tables concise

### When to Add References

Add Level 2 reference pointers when:
- Process has >3 steps
- Multiple edge cases exist
- Historical context matters
- Subject is low-frequency but high-complexity
