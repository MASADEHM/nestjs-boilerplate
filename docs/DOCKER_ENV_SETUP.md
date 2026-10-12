# Docker Environment Setup

## Overview

This project uses separate environment files for different deployment scenarios:

- **`.env`** - For local development (running app directly with `npm run start:dev`)
- **`.env.docker`** - For Docker Compose environments

## Key Differences

### Database Connection

| Environment            | DATABASE_URL                                               | Reason                                           |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| Local (`.env`)         | `postgresql://postgres:postgres@localhost:5432/APP_DB_NEW` | Connects to PostgreSQL on host machine           |
| Docker (`.env.docker`) | `postgresql://postgres:postgres@postgres:5432/APP_DB_NEW`  | Uses Docker service name for internal networking |

### Other Service Hostnames

In Docker Compose, services communicate using their **service names** as hostnames:

- **Redis**: `redis` (instead of `localhost`)
- **Mailpit**: `mailpit` (instead of `localhost`)
- **PostgreSQL**: `postgres` (instead of `localhost`)

## Usage

### Running with Docker Compose

```bash
# Start all services (uses .env.docker automatically)
docker-compose up

# Build and start
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Running Locally (Development)

```bash
# Uses .env file
npm run start:dev
```

Make sure you have PostgreSQL, Redis, and SMTP server running locally.

## Environment File Setup

### Initial Setup

1. **Copy your existing `.env` as a template:**

   ```bash
   cp .env .env.local.backup
   ```

2. **Review `.env.docker`** and update values as needed:
   - JWT secrets (use strong, unique values in production)
   - Database credentials
   - Email configuration
   - Any API keys or external service credentials

3. **Keep sensitive data secure:**
   - Never commit `.env` or `.env.docker` to version control
   - Use `.env.example` for documentation purposes
   - Use secrets management in production (Azure Key Vault, AWS Secrets Manager, etc.)

## Health Checks

Docker Compose is configured with health checks for PostgreSQL and Redis:

- **PostgreSQL**: Checks every 5 seconds if database is ready
- **Redis**: Checks every 5 seconds with ping command
- **App**: Waits for both to be healthy before starting

This prevents "database connection failed" errors during startup.

## Troubleshooting

### App can't connect to database

**Issue**: `Database connection attempt X/30 failed`

**Solution**: Verify in `.env.docker`:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/APP_DB_NEW?schema=public
#                                          ^^^^^^^^ Must be 'postgres' (service name)
```

### Port conflicts

**Issue**: `Error: bind: address already in use`

**Solutions**:

1. Stop local services: `brew services stop postgresql redis`
2. Or change ports in `docker-compose.yml`

### Can't access pgAdmin

**URL**: http://localhost:5050

**Credentials** (from `.env.docker`):

- Email: `admin@app.local`
- Password: `admin123`

### View service health status

```bash
docker-compose ps
```

Look for `(healthy)` status next to postgres and redis.

## Production Deployment

For production (Azure, AWS, etc.):

1. Use environment variables directly (don't upload .env files)
2. Store secrets in a secure vault
3. Use managed database services (don't run PostgreSQL in container)
4. Enable SSL/TLS for all connections
5. Use strong, unique passwords and secrets

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
