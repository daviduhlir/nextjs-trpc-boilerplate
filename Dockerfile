# Multi-stage build for Next.js + Node.js + Nginx
# Stage 1: Builder - compile Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY .prettierrc.json ./
COPY next.config.js ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY public ./public

# Build Next.js application (includes frontend and API routes)
RUN npm run build

# Stage 2: Runtime - minimal Alpine image with Node.js and Nginx
FROM node:20-alpine

WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx curl

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Copy package files for production dependencies
COPY package*.json ./
COPY next.config.js ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create Nginx cache and pid directories
RUN mkdir -p /var/run/nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run/nginx /var/cache/nginx

# Expose ports
EXPOSE 80 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/api/health || exit 1

# Run entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
