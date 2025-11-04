# CampaignFlowAPI

Clean architecture backend built with Fastify, TypeScript, and Prisma. Synchronizes Meta Ads mock accounts, campaigns, and metrics with PostgreSQL, implementing hexagonal architecture and concurrency-safe sync flows.

## Features

- **Clean Architecture**: Hexagonal architecture with clear separation of concerns
- **Fastify**: High-performance web framework
- **TypeScript**: Full type safety
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Relational database
- **Swagger/OpenAPI**: Auto-generated API documentation
- **Concurrency-Safe**: Safe concurrent sync operations using Promise.allSettled

## Project Structure

```
src/
├── api/                    # API layer (controllers, routes, schemas)
├── application/            # Application layer (use cases, services)
├── domain/                 # Domain layer (entities, repositories interfaces, value objects)
└── infrastructure/         # Infrastructure layer (Prisma, HTTP clients, config)
```

## Prerequisites

- Node.js v22 or higher
- PostgreSQL database (v14 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd campaign-flow-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env` with your database credentials. **Important**: If using Docker, use these credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meta_backend"
PORT=3000
```

**Note**: The default Docker credentials are:
- Username: `postgres`
- Password: `postgres`
- Database: `meta_backend`

**Important**: Make sure PostgreSQL is running before proceeding. 

**Option 1: Using Docker (Recommended for quick setup)**

```bash
# Start only PostgreSQL service
docker-compose up -d postgres

# Wait a few seconds for PostgreSQL to be ready, then continue with step 4
```

**Option 2: Install PostgreSQL locally**

Install PostgreSQL v14+ and ensure the service is running, then update your `.env` with the correct connection string.

4. **Setup database**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates database tables)
# When prompted, enter a migration name (e.g., "init" or "initial_schema")
npm run prisma:migrate
```

**Note**: When running `prisma:migrate`, you'll be prompted to enter a migration name. You can use something like `init` or `initial_schema`.

**If you get a connection error**, verify:
- PostgreSQL is running: `docker-compose ps` (if using Docker)
- The `DATABASE_URL` in `.env` matches your PostgreSQL credentials:
  - Docker default: `postgresql://postgres:postgres@localhost:5432/meta_backend`
  - Local PostgreSQL: Update with your actual credentials
- The database `meta_backend` exists (Prisma will create it automatically if it doesn't exist)

5. **Start development server**

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

To build and run in production mode:

```bash
# Build the project
npm run build

# Start production server
npm run start
```

## API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/docs
```

## Available Endpoints

### Accounts

- `GET /accounts` - Get all accounts
- `POST /accounts` - Create a new account
- `POST /accounts/sync` - Sync accounts from external Meta Ads API

### Campaigns

- `POST /accounts/:id/campaigns/sync` - Sync campaigns for a specific account
- `GET /accounts/:id/campaigns/metrics` - Get campaign metrics for an account
- `POST /sync/all` - Sync all campaigns for all accounts concurrently

### Health

- `GET /health` - Health check endpoint

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm run start` - Start production server
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## Testing

The project uses Vitest for testing. Tests are organized in:

- `tests/unit/` - Unit tests for use cases and services
- `tests/integration/` - Integration tests for API endpoints
- `tests/mocks/` - Mock utilities for testing

Run tests with:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm test -- --coverage
```

## Docker Deployment

The project includes Docker support for easy deployment and development.

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

### Quick Start with Docker

1. **Copy environment variables**

```bash
cp .env.example .env
```

2. **Start services with Docker Compose**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port `5432`
- Fastify API server on port `3000`

3. **Run database migrations**

```bash
docker-compose exec app npx prisma migrate deploy --schema=./src/infrastructure/database/prisma/schema.prisma
```

Or use the npm script:

```bash
docker-compose exec app npm run prisma:migrate:deploy
```

4. **Access the application**

- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs
- Health Check: http://localhost:3000/health

### Docker Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# Rebuild containers
docker-compose build

# Execute commands in container
docker-compose exec app npm run prisma:generate
docker-compose exec app npm run prisma:migrate

# Open Prisma Studio (database GUI)
docker-compose exec app npm run prisma:studio
```

### Environment Variables

The following environment variables can be configured in `.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/meta_backend"

# PostgreSQL Configuration (for Docker)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=meta_backend
POSTGRES_PORT=5432

# Application Configuration
PORT=3000
NODE_ENV=production
```

### Production Deployment

For production deployment, ensure:

1. Use strong database passwords
2. Set `NODE_ENV=production`
3. Configure proper database connection strings
4. Use environment-specific `.env` files
5. Enable proper logging and monitoring

## Troubleshooting

### Prisma Schema Not Found

If you encounter errors about Prisma schema not being found, ensure you're using the npm scripts which include the `--schema` flag:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Module Not Found After Build

If you see `Cannot find module 'dist/main.js'` error:

1. Make sure you've built the project first:
```bash
npm run build
```

2. Verify the `dist` folder exists and contains the compiled files

### Database Connection Issues

1. **Start PostgreSQL with Docker** (if not installed locally):
```bash
docker-compose up -d postgres
```

2. Verify your `.env` file has the correct `DATABASE_URL`. **For Docker, it should be**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meta_backend"
```

**Common mistake**: If you see `Authentication failed for user 'user'`, your `.env` has incorrect credentials. Make sure you're using `postgres:postgres` (not `user:password`).

3. Ensure PostgreSQL is running and accessible:
   - Check Docker: `docker-compose ps`
   - Check locally: `psql -U postgres -l`

4. Wait a few seconds after starting PostgreSQL before running migrations

### Port Already in Use

If port 3000 is already in use:

1. **Stop the running process**:
   - Windows: `taskkill /F /IM node.exe` (stops all Node processes) or `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`
   - Linux/Mac: `lsof -ti:3000 | xargs kill`

2. Or change the `PORT` in your `.env` file

### Prisma Migration Timeout

If you get `P1002: The database server timed out`:

1. **Check if another migration is running**: Close any other terminals running Prisma commands
2. **Restart PostgreSQL**: 
   ```bash
   docker-compose restart postgres
   ```
3. **Wait a few seconds** before retrying the migration
4. **If the problem persists**, check for locked connections:
   ```bash
   docker-compose exec postgres psql -U postgres -d meta_backend -c "SELECT * FROM pg_locks WHERE NOT granted;"
   ```

### Fastify Instance Already Listening Error

If you see `FST_ERR_INSTANCE_ALREADY_LISTENING`:

1. **Stop the server completely**: Press `Ctrl+C` in the terminal
2. **Kill any remaining Node processes**: `taskkill /F /IM node.exe` (Windows)
3. **Restart the server**: `npm run dev`
4. This error usually happens when `tsx watch` restarts the server while it's still running

## Architecture

This project follows Clean Architecture principles:

1. **Domain Layer**: Contains business entities and repository interfaces
2. **Application Layer**: Contains use cases and application services
3. **Infrastructure Layer**: Contains implementations (Prisma repositories, HTTP clients)
4. **API Layer**: Contains controllers, routes, and validation schemas

## 👨‍💻 Autor

**Juan Facundo Bazan Alvarez**  
*Sr Backend Developer Node  | Software Architect*

Este proyecto fue desarrollado con arquitectura hexagonal limpia, desacoplada y lista para producción.

---

© 2025 Juan Facundo Bazan Alvarez. Todos los derechos reservados.

