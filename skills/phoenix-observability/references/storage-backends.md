# Phoenix Storage Backends

Phoenix supports two database backends for persistent storage: SQLite (default, ideal for development) and PostgreSQL (production-ready).

## SQLite Backend

SQLite is the default backend and requires no additional configuration. It stores data in a local file and is ideal for development, testing, and low-volume production use.

### Configuration

```python
import phoenix as px

# Launch with SQLite (default)
session = px.launch_app()
```

```bash
# Environment variables for SQLite
export PHOENIX_WORKING_DIR="/path/to/phoenix/data"
phoenix serve
```

### SQLite Connection String

```python
import os
os.environ["PHOENIX_SQL_DATABASE_URL"] = "sqlite:////path/to/phoenix.db"

import phoenix as px
session = px.launch_app()
```

### Advantages

- Zero configuration
- File-based storage (easy backup)
- Sufficient for development and testing
- No external dependencies

### Limitations

- Single-writer concurrency
- Not ideal for high-volume production
- Limited scalability compared to PostgreSQL

## PostgreSQL Backend

PostgreSQL is recommended for production deployments, offering better performance, concurrent access, and scalability.

### Installation

```bash
# Install PostgreSQL client libraries
pip install arize-phoenix[postgres]

# Or install psycopg2 directly
pip install psycopg2-binary
```

### Configuration

```python
import os
os.environ["PHOENIX_SQL_DATABASE_URL"] = "postgresql://user:password@host:5432/database_name"

import phoenix as px
session = px.launch_app()
```

```bash
# Environment variables
export PHOENIX_SQL_DATABASE_URL="postgresql://phoenix:phoenix@localhost:5432/phoenix"
phoenix serve --host 0.0.0.0 --port 6006
```

### Connection String Format

```
postgresql://[user[:password]@][host][:port][/database_name]
```

Examples:
- `postgresql://phoenix:secret@localhost:5432/phoenix`
- `postgresql://phoenix@db.example.com:5432/phoenix_db`
- `postgresql:///phoenix` (local socket)

### Database Setup

```sql
-- Create database
CREATE DATABASE phoenix;

-- Create user (optional)
CREATE USER phoenix WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE phoenix TO phoenix;
```

### Advantages

- Multi-writer concurrency
- Production-ready scalability
- Better performance for high-volume data
- Connection pooling support
- Remote database access

### Connection Pool Configuration

```python
import os
from phoenix.otel import register

# Configure connection pool
os.environ["PHOENIX_SQL_DATABASE_URL"] = (
    "postgresql://phoenix:secret@localhost:5432/phoenix"
    "?pool_size=20&max_overflow=10&pool_timeout=30"
)

tracer_provider = register(project_name="my-app")
```

### SSL Configuration

```python
import os

# SSL connection
os.environ["PHOENIX_SQL_DATABASE_URL"] = (
    "postgresql://user:pass@host:5432/db"
    "?sslmode=require"
)

# With custom SSL certificate
os.environ["PHOENIX_SQL_DATABASE_URL"] = (
    "postgresql://user:pass@host:5432/db"
    "?sslmode=verify-full&sslrootcert=/path/to/ca.crt"
)
```

## Choosing Between Backends

| Factor | SQLite | PostgreSQL |
|--------|--------|------------|
| Development | ✅ Ideal | ⚠️ Overhead |
| Testing | ✅ Sufficient | ⚠️ Overhead |
| Low-volume production | ✅ Acceptable | ✅ Recommended |
| High-volume production | ❌ Not recommended | ✅ Required |
| Multiple concurrent writers | ❌ Single writer | ✅ Multiple |
| Remote database access | ❌ File-based only | ✅ Network access |
| Backup/restore | ✅ File copy | ✅ pg_dump |

## Migration Between Backends

### SQLite to PostgreSQL

```bash
# 1. Export SQLite data
python -c "
from phoenix import Client
import pandas as pd
client = Client()
spans = client.get_spans_dataframe()
spans.to_parquet('spans_backup.parquet')
"

# 2. Configure PostgreSQL
export PHOENIX_SQL_DATABASE_URL="postgresql://user:pass@host/db"

# 3. Import data to PostgreSQL
python -c "
from phoenix import Client
import pandas as pd
client = Client()
spans = pd.read_parquet('spans_backup.parquet')
# Import logic depends on Phoenix version
"
```

### PostgreSQL to SQLite

```bash
# 1. Export PostgreSQL data
python -c "
from phoenix import Client
import pandas as pd
client = Client(endpoint='http://phoenix-postgres:6006')
spans = client.get_spans_dataframe()
spans.to_parquet('spans_backup.parquet')
"

# 2. Configure SQLite
export PHOENIX_SQL_DATABASE_URL="sqlite:////path/to/phoenix.db"

# 3. Start Phoenix
phoenix serve
```

## Troubleshooting

### SQLite Lock Errors

```
sqlite3.OperationalError: database is locked
```

**Solution**: Ensure only one Phoenix instance is running:
```bash
pkill -f "phoenix serve"
```

### PostgreSQL Connection Errors

```
psycopg2.OperationalError: FATAL: password authentication failed
```

**Solution**: Verify connection string and credentials:
```bash
# Test connection manually
psql "postgresql://user:pass@host:5432/db" -c "SELECT 1"
```

### Migration Errors

```
alembic.util.exc.CommandError: Can't locate revision
```

**Solution**: Reset database (data loss):
```bash
rm -rf $PHOENIX_WORKING_DIR/phoenix.db
phoenix serve  # Will create fresh database
```
