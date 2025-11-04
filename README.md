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
- PostgreSQL database
- npm or yarn

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

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/meta_backend"
PORT=3000
```

4. **Setup database**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. **Start development server**

```bash
npm run dev
```

The server will start on `http://localhost:3000`

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
docker-compose exec app npx prisma migrate deploy
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

## Architecture

This project follows Clean Architecture principles:

1. **Domain Layer**: Contains business entities and repository interfaces
2. **Application Layer**: Contains use cases and application services
3. **Infrastructure Layer**: Contains implementations (Prisma repositories, HTTP clients)
4. **API Layer**: Contains controllers, routes, and validation schemas

## License

ISC

