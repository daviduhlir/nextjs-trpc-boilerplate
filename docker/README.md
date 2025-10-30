# Docker Configuration

This directory contains all Docker-related files for the application.

## Files

- **Dockerfile** - Multi-stage build configuration for production deployment
- **nginx.conf** - Nginx reverse proxy configuration
- **docker-compose.yml** - Docker Compose for running the application
- **entrypoint.sh** - Container entrypoint script

## Building the Docker Image

From project root:

```bash
# Build Docker image
npm run build:docker

# Or manually
docker build -f docker/Dockerfile -t nextjs-trpc:latest .
```

## Running with Docker Compose

From project root:

```bash
# Start production environment
docker-compose -f docker/docker-compose.yml up

# Start development environment
docker-compose -f docker/docker-compose.yml --profile dev up
```

Or from this directory:

```bash
# Start production environment
docker-compose up

# Start development environment
docker-compose --profile dev up
```

## Environment Variables

See `.env.example` in project root for all available environment variables.

Production deployment uses:
- `NODE_ENV=production`
- `PORT=3000`
- `API_URL=http://localhost`

## Architecture

```
Nginx (port 80)
  ↓
  └─→ Next.js Server (port 3000)
      ├─ Frontend pages
      ├─ Static assets
      └─ API routes (/api/trpc/*)
```

- Nginx serves as reverse proxy and static file server
- Next.js handles backend logic and API routes
- Health checks verify service availability

## Troubleshooting

Check logs:
```bash
docker-compose -f docker/docker-compose.yml logs -f app
```

Stop and clean up:
```bash
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml down -v  # Remove volumes
```
