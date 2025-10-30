import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

/**
 * tRPC API handler for Next.js Pages Router
 * Routes all tRPC requests (GET, POST, etc.) through this endpoint
 */
export default createNextApiHandler({
  router: appRouter,
  createContext,
});
