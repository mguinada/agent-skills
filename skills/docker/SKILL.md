---
name: docker
description: "Docker containerization guide covering Dockerfile authoring, multi-stage builds, image optimization, security hardening, Docker Compose for local development, and .dockerignore best practices. Use PROACTIVELY when creating or editing Dockerfiles, docker-compose.yml files, containerizing an application, or troubleshooting Docker build and runtime issues. **PROACTIVE ACTIVATION**: Invoke on Dockerfile, docker-compose, 'containerize', 'docker build', 'container won't start', or any task involving images, volumes, or container networking. **USE CASES**: New Dockerfile, optimizing image size, adding health checks, setting up multi-service local dev environment, fixing build failures, securing containers."
author: mguinada
version: 1.0.0
tags: [docker, containers, dockerfile, docker-compose, devops, security]
---

# Docker

## Quick Diagnosis

Before writing anything, understand the environment:

```bash
docker --version
find . -name "Dockerfile*" -type f
find . -name "*compose*.yml" -o -name "*compose*.yaml" | head -5
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
```

---

## Dockerfile Patterns

### Multi-stage build (recommended default)

Separate the build environment from the runtime environment to keep production images small:

```dockerfile
# Stage 1: install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: production runtime (minimal)
FROM node:22-alpine AS runtime
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
WORKDIR /app
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/package*.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

### Layer caching — most important rule

Copy dependency manifests *before* source code so Docker reuses cached layers on every code change:

```dockerfile
# Good — dependencies cached separately from source
COPY package*.json ./
RUN npm ci
COPY . .

# Bad — cache busted on every source change
COPY . .        # ❌
RUN npm ci
```

### Security defaults

Always run as a non-root user:

```dockerfile
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
# ... copy files with --chown=appuser:appgroup
USER appuser
```

Never put secrets in ENV or ARG — they appear in `docker history`:

```dockerfile
# Bad
ENV API_KEY=secret123  # ❌ visible in image layers

# Good — use BuildKit mount secrets
RUN --mount=type=secret,id=api_key \
    API_KEY=$(cat /run/secrets/api_key) && do-something-with-key
```

### Build cache for package managers

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production
```

---

## .dockerignore

Always create `.dockerignore` to keep build context small and avoid leaking secrets:

```
.git
.env*
node_modules
dist
*.log
.DS_Store
README.md
coverage/
.github/
```

---

## Docker Compose

### Local development stack

```yaml
services:
  app:
    build:
      context: .
      target: development      # use a dev-specific stage
    volumes:
      - .:/app                 # hot reload
      - /app/node_modules      # prevent host override
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"
      - "9229:9229"            # debug port
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Production hardening additions

For production compose files, add resource limits and restart policies:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
    restart: unless-stopped
```

See `references/compose.md` for environment separation (dev/staging/prod) and secrets management patterns.

---

## Image Size Optimization

| Strategy | Savings | When |
|---|---|---|
| Multi-stage build | 50–80% | Always |
| Alpine base (`-alpine` tag) | 70–90% vs full | Most apps |
| `npm ci --only=production` | Removes devDeps | Node.js apps |
| `RUN ... && rm -rf /var/cache/apk/*` | Package cache | Alpine |
| Distroless base | Removes shell+OS | Security-critical |

---

## Health Checks

Every service that accepts traffic should declare a health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

---

## Checklist

### Dockerfile
- [ ] Multi-stage build separates build from runtime
- [ ] Dependency manifests copied before source code
- [ ] Non-root user created and set with `USER`
- [ ] No secrets in `ENV` or `ARG`
- [ ] `.dockerignore` covers `.git`, `.env*`, `node_modules`
- [ ] `HEALTHCHECK` defined
- [ ] Base image uses pinned minor version (e.g., `node:22-alpine`)

### Docker Compose
- [ ] `depends_on` uses `condition: service_healthy` not just service name
- [ ] Named volumes used for persistent data (not bind mounts)
- [ ] Dev and prod configs separated (override files or `target:`)
- [ ] Health checks on all stateful services (DB, cache)

---

## Reference Files

- `references/dockerfile.md` — language-specific Dockerfile patterns (Node.js, Python, Ruby, Go)
- `references/compose.md` — multi-environment compose setup, secrets, networking patterns
