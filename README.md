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

## 🚀 Setup Local

### Paso a Paso para Ejecutar Localmente

#### 1. **Clonar el Repositorio**

```bash
git clone <repository-url>
cd CampaignFlowAPI
```

#### 2. **Instalar Dependencias**

```bash
npm install
```

#### 3. **Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meta_backend"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=meta_backend
POSTGRES_PORT=5432

# Application Configuration
PORT=3000
NODE_ENV=development

# External API Configuration
META_API_BASE_URL=https://w5k577bkq5cmihbdxxqlok2c7y0ejbiz.lambda-url.us-east-1.on.aws
META_API_TIMEOUT=30000
META_API_RETRY_ATTEMPTS=3

# Sync Configuration
SYNC_ALL_TIMEOUT=300000
```

**Nota**: Si usas Docker Compose, las credenciales por defecto son `postgres:postgres`.

#### 4. **Iniciar PostgreSQL**

**Opción A: Usando Docker (Recomendado)**

```bash
# Iniciar solo PostgreSQL
docker-compose up -d postgres

# Verificar que está corriendo
docker-compose ps

# Esperar unos segundos para que PostgreSQL esté listo
```

**Opción B: PostgreSQL Local**

Asegúrate de tener PostgreSQL v14+ instalado y corriendo localmente, luego actualiza `DATABASE_URL` en `.env` con tus credenciales.

#### 5. **Configurar Base de Datos**

```bash
# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones (crea las tablas)
npm run prisma:migrate
```

**Nota**: Cuando ejecutes `prisma:migrate`, se te pedirá un nombre para la migración. Puedes usar `init` o `initial_schema`.

**Si hay errores de conexión**, verifica:
- PostgreSQL está corriendo: `docker-compose ps` (si usas Docker)
- `DATABASE_URL` en `.env` coincide con tus credenciales
- La base de datos `meta_backend` existe (Prisma la crea automáticamente si no existe)

#### 6. **Iniciar Servidor de Desarrollo**

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

#### 7. **Verificar que Funciona**

```bash
# Health check
curl http://localhost:3000/health

# Deberías recibir:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "database": { "status": "connected" }
# }
```

#### 8. **Acceder a Documentación**

Abre tu navegador en: `http://localhost:3000/docs`

Swagger UI te permitirá probar todos los endpoints interactivamente.

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

2. **Configure your .env file with secure credentials**

**IMPORTANT**: Replace the placeholder values with strong, unique passwords:

```env
# Use strong passwords in production!
POSTGRES_USER=your_secure_username
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=meta_backend
DATABASE_URL="postgresql://your_secure_username:your_secure_password_here@localhost:5432/meta_backend"
```

3. **Start services with Docker Compose**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port `5432`
- Fastify API server on port `3000`

**Security Note**: The `docker-compose.yml` file requires environment variables to be set. Never commit real credentials to version control.

4. **Run database migrations**

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

The following environment variables **must** be configured in `.env` (they are required, no defaults are provided for security):

```env
# Database Configuration (REQUIRED - use strong passwords!)
POSTGRES_USER=your_secure_username
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=meta_backend
POSTGRES_PORT=5432
DATABASE_URL="postgresql://your_secure_username:your_secure_password@localhost:5432/meta_backend"

# Application Configuration
PORT=3000
NODE_ENV=production
```

**Security Best Practices**:
- Use strong, unique passwords (minimum 16 characters, mix of letters, numbers, and symbols)
- Never commit `.env` files to version control (already in `.gitignore`)
- Use different credentials for development and production
- Rotate passwords regularly
- Consider using secrets management tools (AWS Secrets Manager, HashiCorp Vault, etc.) in production

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

## 🏗️ Arquitectura y Decisiones Técnicas

### Arquitectura Hexagonal (Clean Architecture)

Este proyecto implementa **Hexagonal Architecture** (también conocida como Ports & Adapters), separando el dominio del negocio de los detalles de implementación.

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Fastify)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Controllers  │  │   Routes     │  │   Schemas    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Application Layer (Use Cases)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ SyncAccounts │  │SyncCampaigns │  │ GetMetrics   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                Domain Layer (Core)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Entities    │  │ Repositories │  │    Errors    │  │
│  │  (Interfaces)│  │ (Interfaces) │  │  (Custom)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           Infrastructure Layer (Adapters)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Prisma     │  │ HTTP Client  │  │   Config     │  │
│  │ Repositories │  │ (Meta API)   │  │ (Fastify)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Decisiones Técnicas Principales

#### 1. **Fastify en lugar de Express**

**¿Por qué Fastify?**
- **Performance**: Fastify es significativamente más rápido que Express (2-3x en benchmarks)
- **TypeScript First**: Mejor soporte nativo para TypeScript
- **Schema Validation**: Validación automática de schemas JSON con JSON Schema
- **Plugin System**: Arquitectura de plugins más robusta y modular
- **Logging**: Pino integrado para logging estructurado de alta performance

**Trade-offs**: 
- Menor ecosistema que Express (pero suficiente para este proyecto)
- Curva de aprendizaje ligeramente mayor

#### 2. **Prisma en lugar de TypeORM/Sequelize**

**¿Por qué Prisma?**
- **Type Safety**: Genera tipos TypeScript automáticamente desde el schema
- **Developer Experience**: Migraciones automáticas, Prisma Studio, mejor DX
- **Performance**: Query builder optimizado, conexiones eficientes
- **Schema como Single Source of Truth**: Un solo archivo define estructura y tipos
- **Moderno**: Sintaxis intuitiva, menos boilerplate

**Trade-offs**:
- Menos flexible que TypeORM para queries complejas (pero suficiente para este caso)
- Learning curve para developers no familiarizados

#### 3. **Arquitectura Hexagonal**

**¿Por qué esta arquitectura?**
- **Testabilidad**: Cada capa puede testearse independientemente
- **Mantenibilidad**: Cambios en infraestructura no afectan lógica de negocio
- **Escalabilidad**: Fácil agregar nuevos adaptadores (REST, GraphQL, gRPC)
- **Desacoplamiento**: El dominio no depende de frameworks externos
- **Clean Code**: Separación clara de responsabilidades

**Trade-offs**:
- Más archivos y estructura inicial (pero vale la pena para proyectos grandes)
- Requiere más disciplina del equipo

#### 4. **TypeScript Strict Mode**

**¿Por qué TypeScript?**
- **Type Safety**: Detecta errores en tiempo de compilación
- **Autocomplete**: Mejor experiencia de desarrollo con IDE
- **Refactoring Seguro**: Cambios masivos con confianza
- **Documentación Implícita**: Los tipos documentan el código

#### 5. **Dependency Injection Manual (DIContainer)**

**¿Por qué DI manual en lugar de librería (InversifyJS, TSyringe)?**
- **Simplicidad**: No necesitamos decoradores complejos para este proyecto
- **Control Total**: Sabemos exactamente qué se está inyectando
- **Menos Dependencias**: Menos librerías externas
- **Suficiente**: Para el tamaño del proyecto, DI manual es suficiente

**Trade-offs**:
- Si el proyecto crece mucho, podría beneficiarse de una librería DI
- Más código manual para mantener

#### 6. **Zod para Validación**

**¿Por qué Zod?**
- **Type Inference**: Genera tipos TypeScript desde schemas
- **Runtime Validation**: Valida datos en runtime, no solo en compile-time
- **Composable**: Schemas pueden combinarse y reutilizarse
- **Mensajes de Error**: Mensajes claros y útiles
- **Lightweight**: Librería pequeña y rápida

#### 7. **Axios con Retry Logic**

**¿Por qué Axios + axios-retry?**
- **Retry Automático**: Reintenta automáticamente en errores transitorios
- **Exponential Backoff**: Evita sobrecargar API externa
- **Interceptors**: Facilita manejo centralizado de errores
- **TypeScript Support**: Buen soporte para TypeScript

#### 8. **In-Memory Locks (LockService)**

**¿Por qué locks in-memory en lugar de Redis?**
- **Simplicidad**: No requiere infraestructura adicional para desarrollo
- **Suficiente**: Para una sola instancia, funciona perfectamente
- **Extensible**: Fácil migrar a Redis cuando se necesite escalar horizontalmente

**Trade-off**: 
- No funciona en múltiples instancias (pero se documenta cómo migrar a Redis)

#### 9. **Decimal en lugar de Float para Moneda**

**¿Por qué Decimal?**
- **Precisión**: Float tiene problemas de precisión con decimales (0.1 + 0.2 ≠ 0.3)
- **Moneda**: Para valores monetarios, precisión es crítica
- **Prisma Support**: Prisma soporta Decimal nativamente

**Trade-off**: 
- Ligeramente más verboso en código (necesita `.toNumber()`)

#### 10. **Vitest en lugar de Jest**

**¿Por qué Vitest?**
- **Velocidad**: Más rápido que Jest
- **TypeScript Native**: Mejor integración con TypeScript
- **Compatible con Jest API**: Fácil migración si alguien viene de Jest
- **Ecosystem**: Compatible con herramientas de Jest

### Patrones de Diseño Implementados

1. **Repository Pattern**: Abstrae acceso a datos, permite cambiar ORM sin afectar lógica
2. **Use Case Pattern**: Encapsula operaciones de negocio específicas
3. **Dependency Injection**: Facilita testing y desacoplamiento
4. **Strategy Pattern**: LockService puede cambiar implementación (memory → Redis)
5. **Error Handling con Clases**: Jerarquía de errores para manejo consistente

### Estructura de Capas

1. **Domain Layer** (`src/domain/`): Entidades, interfaces de repositorios, errores personalizados
2. **Application Layer** (`src/application/`): Casos de uso, servicios de aplicación
3. **Infrastructure Layer** (`src/infrastructure/`): Implementaciones (Prisma, HTTP, config)
4. **API Layer** (`src/api/`): Controladores, rutas, validación de schemas

## 👨‍💻 Autor

**Juan Facundo Bazan Alvarez**  
*Sr Backend Developer Node  | Software Architect*

Este proyecto fue desarrollado con arquitectura hexagonal limpia, desacoplada y lista para producción.

---

© 2025 Juan Facundo Bazan Alvarez. Todos los derechos reservados.

