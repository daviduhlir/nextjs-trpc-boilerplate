# Next.js + tRPC Boilerplate

A minimal, modern boilerplate for building full-stack TypeScript applications with **Next.js**, **tRPC**, and **Mocha** testing.

## Features

- **Next.js 14** - React framework with built-in optimization
- **tRPC** - End-to-end type-safe RPC framework
- **@david.uhlir/services** - Service container for dependency management
- **TypeScript** - Strict type safety
- **Mocha** - Minimal testing framework with Chai assertions
- **Prettier** - Code formatting
- **Docker** - Multi-stage Alpine-based build with Nginx reverse proxy
- **Nginx** - High-performance static asset serving and reverse proxy
- **Cluster Support** - Multi-process support for scaling
- **Health Checks** - Built-in health check endpoints
- **Environment Configuration** - `.env.local` support
- **ESM-ready** - Modern JavaScript module setup

## Project Structure

```
├── src/
│   ├── pages/                 # Next.js pages
│   │   ├── api/
│   │   │   ├── trpc/         # tRPC API route handler
│   │   │   └── health.ts     # Health check endpoint
│   │   └── index.tsx         # Home page
│   ├── server/
│   │   ├── routers/          # tRPC routers (business logic)
│   │   │   ├── example.ts
│   │   │   ├── example.test.ts
│   │   │   ├── health.ts     # Health check router
│   │   │   ├── users.ts      # Users router using services
│   │   │   └── _app.ts       # Main router
│   │   ├── services/         # Business logic services
│   │   │   ├── index.ts      # Service container initialization
│   │   │   ├── user.service.ts
│   │   │   └── user.service.test.ts
│   │   ├── trpc.ts           # tRPC initialization
│   │   ├── context.ts        # tRPC context with services
│   │   └── cluster.ts        # Cluster mode support
│   └── utils/
│       └── trpc.ts           # tRPC client setup
├── scripts/
│   └── docker-entrypoint.sh  # Docker startup script
├── public/                    # Static assets
├── Dockerfile                 # Multi-stage build
├── docker-compose.yml         # Docker Compose config
├── nginx.conf                 # Nginx configuration
├── .dockerignore               # Docker ignore patterns
├── .env.example               # Environment template
├── .env.local                 # Local environment (git ignored)
├── .prettierrc.json           # Prettier config
├── .mocharc.json              # Mocha config
├── next.config.js             # Next.js config
└── tsconfig.json              # TypeScript config
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local with your configuration
```

### 3. Development

```bash
# Start development server
npm run dev

# Run in watch mode on http://localhost:3000
```

Visit `http://localhost:3000` to see the boilerplate app.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` / `npm run dev:fe` | Start Next.js dev server (frontend + backend) |
| `npm run dev:be` | Start Next.js dev server (backend - same as dev) |
| `npm run build` / `npm run build:fe` | Build for production |
| `npm run build:be` | Backend build (combined with frontend in Next.js) |
| `npm run build:docker` | Build Docker image |
| `npm start` | Start production server |
| `npm run test` | Run Mocha tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run type-check` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check Prettier formatting |

## Adding a New Router

### 1. Create Router File

```typescript
// src/server/routers/users.ts
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const usersRouter = router({
  list: publicProcedure.query(async () => {
    return [];
  }),

  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      return { id: 1, name: input.name };
    }),
});
```

### 2. Add to App Router

```typescript
// src/server/routers/_app.ts
import { usersRouter } from './users';

export const appRouter = router({
  example: exampleRouter,
  users: usersRouter, // Add here
});
```

### 3. Use on Client

```typescript
// In any React component
const { data } = trpc.users.list.useQuery();
```

## Services Architecture

Services contain business logic and are automatically injected into tRPC procedures via context. Services are initialized once per worker process in cluster mode.

### Creating a Service

```typescript
// src/server/services/my.service.ts
export class MyService {
  async initialize(): Promise<void> {
    // Initialize resources (database, cache, etc.)
  }

  async shutdown(): Promise<void> {
    // Clean up resources
  }

  // Your business logic methods
  doSomething(): string {
    return 'result';
  }
}
```

### Registering a Service

```typescript
// src/server/services/index.ts
import { MyService } from './my.service';

export function getServices(): ServiceContainer {
  if (!servicesContainer) {
    servicesContainer = new ServiceContainer();
    servicesContainer.register('MyService', new MyService());
  }
  return servicesContainer;
}
```

### Using Services in Routers

```typescript
// src/server/routers/my.ts
export const myRouter = router({
  doSomething: publicProcedure.query(({ ctx }) => {
    return ctx.services.my.doSomething();
  }),
});
```

## Code Formatting

Format code with Prettier:

```bash
npm run format          # Format all files
npm run format:check    # Check if formatting is needed
```

Configuration is in `.prettierrc.json`. Customize as needed:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Cluster Mode

For production environments, run the backend with multiple worker processes:

```bash
# Enable cluster mode
export CLUSTER_MODE=true
export CLUSTER_WORKERS=4  # Or leave empty for CPU count

npm start
```

### How Cluster Mode Works

1. Master process spawns N worker processes
2. Each worker has its own event loop and service instances
3. Next.js handles request routing (sticky sessions not needed for stateless services)
4. On shutdown, gracefully terminates all workers

### Cluster Configuration

Set in `.env.local`:

```env
CLUSTER_MODE=true
CLUSTER_WORKERS=4
```

### Implementation

```typescript
// In your server startup code
import { startCluster } from '@/server/cluster';

if (process.env.CLUSTER_MODE === 'true') {
  await startCluster(async (workerId) => {
    // Start your server here
  });
}
```

Each worker process:
- Gets its own service instances
- Initializes services on startup
- Cleans up on shutdown
- Is independent from other workers

## Docker & Production

### Build Docker Image

Multi-stage Dockerfile with Alpine Linux for minimal size:

```bash
# Build image
npm run build:docker

# Or manually
docker build -t nextjs-trpc:latest .
```

The Dockerfile:
1. **Build Stage**: Compiles Next.js application and installs dependencies
2. **Runtime Stage**: Minimal Alpine with Node.js + Nginx
3. **Services**: Runs both Nginx reverse proxy and Node.js server

### Run Docker Container

```bash
# Production mode
docker run -p 80:80 -p 3000:3000 \
  -e NODE_ENV=production \
  -e API_URL=http://localhost \
  nextjs-trpc:latest

# Or with docker-compose
docker-compose up
```

### Docker Compose

Local development with Docker:

```bash
# Production build
docker-compose up

# Development mode
docker-compose --profile dev up
```

### Architecture

- **Nginx** (port 80): Reverse proxy, static asset serving, caching
- **Node.js** (port 3000): Next.js server (frontend pages + API routes)
- **Health Check**: `/api/health` endpoint for load balancers

### Performance Optimizations

- **Gzip compression** enabled in Nginx
- **Static assets** cached for 365 days with immutable headers
- **Public files** cached for 1 day
- **Connection pooling** for upstream requests
- **Worker processes** scale with CPU count

## Testing

Tests run with **Mocha** and **Chai**. Write tests with `.test.ts` suffix:

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch
```

Example test structure:

```typescript
import { expect } from 'chai';
import { exampleRouter } from './example';

describe('Example Router', () => {
  it('should work', async () => {
    const caller = exampleRouter.createCaller({});
    const result = await caller.hello({});
    expect(result.message).to.include('Hello');
  });
});
```

## Configuration

All configuration is managed through `.env.local`:

```env
NODE_ENV=development
API_URL=http://localhost:3000
PORT=3000
```

See `.env.example` for all available variables.

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^14.1.0 | React framework |
| @trpc/server | ^10.45.1 | Backend RPC server |
| @trpc/next | ^10.45.1 | Next.js integration |
| @trpc/client | ^10.45.1 | Client-side requests |
| zod | ^3.22.4 | TypeScript-first schema validation |
| mocha | ^10.2.0 | Testing framework |
| chai | ^4.3.10 | Assertion library |

## Build & Deploy

### Development Build

```bash
npm run build
npm start
```

### Production

- Set `NODE_ENV=production` in `.env.local`
- Use `npm run build` to optimize
- Deploy to Vercel, Railway, or any Node.js host

## Minimal Size

This boilerplate is intentionally minimal:
- No UI framework (use plain React or add your own)
- No CSS framework (use CSS Modules or add your own)
- Single Mocha config
- No extra tooling

Add dependencies only as needed.

## Next Steps

1. Create new routers in `src/server/routers/`
2. Add tests alongside your code
3. Build your business logic with type safety
4. Use `.env.local` for configuration

## License

MIT
