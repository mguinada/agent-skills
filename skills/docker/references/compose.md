# Docker Compose Patterns

## Environment Separation

Use a base file + override files to share common config while keeping environments distinct:

```
docker-compose.yml          # base: shared service definitions
docker-compose.override.yml # dev: auto-loaded by docker compose up
docker-compose.prod.yml     # prod: explicit with -f flag
```

**docker-compose.yml (base):**
```yaml
services:
  app:
    build:
      context: .
    environment:
      DATABASE_URL: postgresql://dev:dev@db/myapp
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
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

**docker-compose.override.yml (dev — auto-loaded):**
```yaml
services:
  app:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    ports:
      - "3000:3000"
      - "9229:9229"
    command: npm run dev

  db:
    ports:
      - "5432:5432"    # expose locally for dev tools
```

**docker-compose.prod.yml:**
```yaml
services:
  app:
    build:
      target: production
    environment:
      NODE_ENV: production
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    ports:
      - "3000:3000"
```

Run production: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up`

---

## Secrets Management

**Never put secrets in `environment:` for production.** Use Docker secrets or an `.env` file:

**With Docker Secrets (Swarm or Compose v3.1+):**
```yaml
services:
  app:
    secrets:
      - db_password
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    external: true   # created with: docker secret create db_password -
```

**With .env file (development only):**
```yaml
# docker-compose.override.yml
services:
  app:
    env_file:
      - .env         # never commit .env; commit .env.example
```

---

## Networking

Isolate internal services from the public-facing ones:

```yaml
services:
  nginx:
    networks:
      - frontend

  app:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend      # not reachable from nginx directly

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true   # no external connectivity
```

---

## Wait Strategies

`depends_on` alone doesn't wait for a service to be *ready*, only *started*. Always pair with a health check:

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy   # waits for healthcheck to pass
      redis:
        condition: service_healthy

  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 5
```

---

## Useful Commands

```bash
# Start dev environment
docker compose up

# Start and rebuild
docker compose up --build

# Run a one-off command
docker compose run --rm app bundle exec rails db:migrate

# View logs for one service
docker compose logs -f app

# Production deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Clean up everything including volumes
docker compose down -v
```
