import 'reflect-metadata';
import express, { type Request, type Response, type NextFunction } from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initializeServices } from './init';
import { appRouter } from './routers/_app';
import { createContext } from './context';

const PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);
const HOST = process.env.BACKEND_HOST || 'localhost';

/**
 * Start Express backend server with tRPC
 * Runs on separate port from frontend
 */
async function start() {
  console.log('[Backend] Initializing services...');
  await initializeServices();

  const app = express();

  // Middleware
  app.use(express.json());

  // Enable CORS
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // tRPC handler
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  const server = app.listen(PORT, HOST, () => {
    console.log(`[Backend] tRPC server running at http://${HOST}:${PORT}/trpc`);
    console.log(`[Backend] Health check at http://${HOST}:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Backend] SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('[Backend] Server closed');
      process.exit(0);
    });
  });
}

start().catch((err) => {
  console.error('[Backend] Failed to start server:', err);
  process.exit(1);
});
