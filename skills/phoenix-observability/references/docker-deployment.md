# Phoenix Docker Deployment

Deploy Phoenix using Docker with either SQLite (simple, file-based) or PostgreSQL (production-ready) backends.

## Quick Start (SQLite)

```bash
docker run -p 6006:6006 arizephoenix/phoenix:latest
```

## Docker Compose - SQLite (Recommended for Simplicity)

SQLite is the simplest option and recommended for most use cases unless you have specific production requirements.

### Basic SQLite Setup

```yaml
# docker-compose.yml (SQLite)
version: '3.8'

services:
  phoenix:
    image: arizephoenix/phoenix:latest
    container_name: phoenix
    ports:
      - "6006:6006"   # HTTP UI
      - "4317:4317"   # OTLP gRPC
    environment:
      - PHOENIX_HOST=0.0.0.0
      - PHOENIX_PORT=6006
      - PHOENIX_PROJECT_NAME=default
    volumes:
      # Persist SQLite database
      - phoenix_data:/phoenix/data
    restart: unless-stopped

volumes:
  phoenix_data:
    driver: local
```

### SQLite with Custom Configuration

```yaml
# docker-compose.yml (SQLite with options)
version: '3.8'

services:
  phoenix:
    image: arizephoenix/phoenix:latest
    container_name: phoenix
    ports:
      - "6006:6006"
      - "4317:4317"
    environment:
      - PHOENIX_HOST=0.0.0.0
      - PHOENIX_PORT=6006
      - PHOENIX_WORKING_DIR=/phoenix/data
      - PHOENIX_PROJECT_NAME=my-app
    volumes:
      - ./phoenix_data:/phoenix/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6006/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

volumes:
  phoenix_data:
    driver: local
```

### Running SQLite Docker Compose

```bash
# Start Phoenix
docker-compose up -d

# View logs
docker-compose logs -f phoenix

# Stop Phoenix
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v
```

## Docker Compose - PostgreSQL (Production)

Use PostgreSQL for production deployments requiring concurrent access and scalability.

### PostgreSQL Setup

```yaml
# docker-compose.yml (PostgreSQL)
version: '3.8'

services:
  phoenix:
    image: arizephoenix/phoenix:latest
    container_name: phoenix
    ports:
      - "6006:6006"
      - "4317:4317"
    environment:
      - PHOENIX_HOST=0.0.0.0
      - PHOENIX_PORT=6006
      - PHOENIX_SQL_DATABASE_URL=postgresql://phoenix:phoenix_password@postgres:5432/phoenix
      - PHOENIX_PROJECT_NAME=my-app
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: phoenix-postgres
    environment:
      - POSTGRES_USER=phoenix
      - POSTGRES_PASSWORD=phoenix_password
      - POSTGRES_DB=phoenix
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U phoenix"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
```

### PostgreSQL with Persistence and Backup

```yaml
# docker-compose.yml (PostgreSQL production)
version: '3.8'

services:
  phoenix:
    image: arizephoenix/phoenix:latest
    container_name: phoenix
    ports:
      - "6006:6006"
      - "4317:4317"
    environment:
      - PHOENIX_HOST=0.0.0.0
      - PHOENIX_PORT=6006
      - PHOENIX_SQL_DATABASE_URL=postgresql://phoenix:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6006/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - phoenix-network

  postgres:
    image: postgres:15-alpine
    container_name: phoenix-postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - phoenix-network

  # Optional: Adminer for database management
  adminer:
    image: adminer:latest
    container_name: phoenix-adminer
    ports:
      - "8080:8080"
    environment:
      - ADMINER_DEFAULT_SERVER=postgres
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - phoenix-network
    profiles:
      - admin

volumes:
  postgres_data:
    driver: local

networks:
  phoenix-network:
    driver: bridge
```

### Environment File (.env)

```bash
# .env
POSTGRES_USER=phoenix
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=phoenix
```

## Multi-Service Docker Compose (Complete Setup)

```yaml
# docker-compose.yml (Complete with app example)
version: '3.8'

services:
  phoenix:
    image: arizephoenix/phoenix:latest
    container_name: phoenix
    ports:
      - "6006:6006"
      - "4317:4317"
    environment:
      - PHOENIX_HOST=0.0.0.0
      - PHOENIX_SQL_DATABASE_URL=postgresql://phoenix:phoenix_secret@postgres:5432/phoenix
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - observability

  postgres:
    image: postgres:15-alpine
    container_name: phoenix-postgres
    environment:
      - POSTGRES_USER=phoenix
      - POSTGRES_PASSWORD=phoenix_secret
      - POSTGRES_DB=phoenix
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U phoenix"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - observability

  # Your application that sends traces to Phoenix
  my-app:
    build: ./my-app
    container_name: my-app
    environment:
      - PHOENIX_ENDPOINT=http://phoenix:6006/v1/traces
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://phoenix:4317
    depends_on:
      - phoenix
    restart: unless-stopped
    networks:
      - observability

volumes:
  postgres_data:
    driver: local

networks:
  observability:
    driver: bridge
```

## Kubernetes Deployment

### Basic Kubernetes Manifest (SQLite)

```yaml
# phoenix-k8s.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phoenix
spec:
  replicas: 1
  selector:
    matchLabels:
      app: phoenix
  template:
    metadata:
      labels:
        app: phoenix
    spec:
      containers:
      - name: phoenix
        image: arizephoenix/phoenix:latest
        ports:
        - containerPort: 6006
        - containerPort: 4317
        env:
        - name: PHOENIX_HOST
          value: "0.0.0.0"
        volumeMounts:
        - name: phoenix-data
          mountPath: /phoenix/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 6006
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readyz
            port: 6006
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: phoenix-data
        persistentVolumeClaim:
          claimName: phoenix-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: phoenix
spec:
  selector:
    app: phoenix
  ports:
  - name: http
    port: 6006
    targetPort: 6006
  - name: grpc
    port: 4317
    targetPort: 4317
  type: LoadBalancer
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: phoenix-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### Kubernetes with PostgreSQL

```yaml
# phoenix-postgres-k8s.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: phoenix
spec:
  serviceName: phoenix
  replicas: 1
  selector:
    matchLabels:
      app: phoenix
  template:
    metadata:
      labels:
        app: phoenix
    spec:
      containers:
      - name: phoenix
        image: arizephoenix/phoenix:latest
        ports:
        - containerPort: 6006
        - containerPort: 4317
        env:
        - name: PHOENIX_HOST
          value: "0.0.0.0"
        - name: PHOENIX_SQL_DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: phoenix-secrets
              key: database-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Secret
metadata:
  name: phoenix-secrets
type: Opaque
stringData:
  database-url: "postgresql://phoenix:secret@postgres:5432/phoenix"
```

## Health Checks

```bash
# Check Phoenix is running
curl http://localhost:6006/healthz

# Check readiness
curl http://localhost:6006/readyz

# Check with Docker
docker exec phoenix curl -f http://localhost:6006/healthz
```

## Backup and Restore

### SQLite Backup

```bash
# Backup SQLite database
docker exec phoenix cp /phoenix/data/phoenix.db /phoenix/data/phoenix.db.backup
docker cp phoenix:/phoenix/data/phoenix.db ./phoenix_backup_$(date +%Y%m%d).db

# Restore SQLite database
docker cp ./phoenix_backup.db phoenix:/phoenix/data/phoenix.db
docker restart phoenix
```

### PostgreSQL Backup

```bash
# Backup PostgreSQL
docker exec phoenix-postgres pg_dump -U phoenix phoenix > phoenix_backup_$(date +%Y%m%d).sql

# Restore PostgreSQL
cat phoenix_backup.sql | docker exec -i phoenix-postgres psql -U phoenix -d phoenix
```

## Troubleshooting

### Container Not Starting

```bash
# Check logs
docker-compose logs phoenix

# Check container status
docker ps -a | grep phoenix

# Inspect container
docker inspect phoenix
```

### Database Connection Issues

```bash
# Check PostgreSQL connection
docker exec -it phoenix-postgres psql -U phoenix -d phoenix -c "SELECT 1"

# Check Phoenix environment variables
docker exec phoenix env | grep PHOENIX
```

### Data Not Persisting

```bash
# Check volumes
docker volume ls | grep phoenix

# Inspect volume
docker volume inspect phoenix_phoenix_data
```
