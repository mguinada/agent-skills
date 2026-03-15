# Language-Specific Dockerfile Patterns

## Node.js / TypeScript

```dockerfile
# Stage 1: dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Stage 2: build (TypeScript compilation)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Stage 3: production
FROM node:22-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S app -u 1001 -G nodejs
WORKDIR /app
COPY --from=deps --chown=app:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=app:nodejs /app/dist ./dist
COPY --from=build --chown=app:nodejs /app/package*.json ./
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

**Development stage (used with Compose override):**
```dockerfile
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "dev"]
```

---

## Python

```dockerfile
# Stage 1: build wheels
FROM python:3.13-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Stage 2: production
FROM python:3.13-slim AS runtime
RUN addgroup --gid 1001 --system appgroup && \
    adduser --uid 1001 --system --ingroup appgroup appuser
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/.venv ./.venv
COPY --chown=appuser:appgroup src ./src
USER appuser
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Ruby on Rails

```dockerfile
# Stage 1: gems
FROM ruby:3.4-alpine AS gems
RUN apk add --no-cache build-base postgresql-dev
WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

# Stage 2: assets
FROM ruby:3.4-alpine AS assets
RUN apk add --no-cache nodejs npm build-base postgresql-dev
WORKDIR /app
COPY --from=gems /usr/local/bundle /usr/local/bundle
COPY . .
RUN SECRET_KEY_BASE=dummy bundle exec rails assets:precompile

# Stage 3: production
FROM ruby:3.4-alpine AS runtime
RUN apk add --no-cache postgresql-client tzdata && \
    addgroup -g 1001 -S rails && adduser -u 1001 -S rails -G rails
WORKDIR /app
COPY --from=gems --chown=rails:rails /usr/local/bundle /usr/local/bundle
COPY --from=assets --chown=rails:rails /app/public ./public
COPY --chown=rails:rails . .
USER rails
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
```

---

## Go

```dockerfile
# Stage 1: build
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

# Stage 2: minimal runtime (distroless)
FROM gcr.io/distroless/static-debian12 AS runtime
COPY --from=builder /app/server /server
EXPOSE 8080
USER nonroot:nonroot
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["/server", "-healthcheck"]
ENTRYPOINT ["/server"]
```

Go's statically compiled binary works well with distroless or even `FROM scratch`.

---

## Common .dockerignore

```
# Version control
.git
.gitignore

# Environment & secrets
.env
.env.*
!.env.example

# Dependencies (rebuilt inside image)
node_modules
vendor
.bundle
__pycache__
*.pyc

# Build artifacts
dist
build
tmp
log
coverage

# Development tools
.DS_Store
.idea
.vscode
*.swp

# Test artifacts
spec/reports
test/reports
```
