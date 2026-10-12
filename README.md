# NestJS Starter Template

A production-ready NestJS starter template with authentication, database, internationalization, and more.

## Tech Stack

- **NestJS** v11.x - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Cache & job queue
- **JWT** - Authentication
- **i18n** - Internationalization (EN/AR)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Project Structure

```
src/
├── modules/          # Business feature modules
├── common/           # Shared utilities
└── core/             # Infrastructure
    ├── auth/         # Authentication (JWT)
    ├── database/     # Prisma service
    ├── config/       # Configuration
    ├── i18n/         # Translations
    ├── files/        # File management
    ├── jobs/         # Background jobs
    └── shared/       # Exceptions, helpers, filters
```

## Available Scripts

```bash
npm run start:dev     # Development with hot reload
npm run build         # Build for production
npm run start:prod    # Run production build
npm run lint          # Run ESLint
npm run test          # Run tests
```

## Documentation

- [Development Guidelines](./docs/DEVELOPMENT_GUIDELINE.md) - Coding standards and patterns
- [Docker Setup](./docs/DOCKER_ENV_SETUP.md) - Docker environment configuration
- [Logging](./docs/LOGGING_README.md) - Logging configuration

## Environment Variables

Key variables in `.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
REDIS_HOST=localhost
REDIS_PORT=6379
```

See `.env.example` for all available options.

