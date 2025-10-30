#!/bin/sh
set -e

echo "[Entrypoint] Starting application services..."

# Start Nginx in background
echo "[Entrypoint] Starting Nginx reverse proxy..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Start Next.js server
echo "[Entrypoint] Starting Next.js server..."
NODE_ENV=production npm start

# Wait for both processes
wait $NGINX_PID
