import type { NextApiRequest } from 'next';
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/routers/_app';
import { ensureServicesInitialized } from '@/server/init';
import { ServicesContext } from '@/server/services';
import { UserService } from '@/server/services/user.service';
import type { Context } from '@/server/context';

/**
 * tRPC API handler for Next.js Pages Router
 * Routes all tRPC requests (GET, POST, etc.) through this endpoint
 *
 * NOTE: This is a frontend-facing API route. It does NOT have access to services directly.
 * Services are only available within the tRPC context (createContext function).
 * That's where backend business logic happens.
 */
export default createNextApiHandler({
  router: appRouter,
  createContext: async ({ req }: { req: NextApiRequest }): Promise<Context> => {
    // Ensure services are initialized
    await ensureServicesInitialized();

    // Get service
    const userService = ServicesContext.lookup(UserService);

    return {
      req: req as any, // Type compatibility: NextApiRequest → Fetch Request
      headers: req.headers as any, // Type compatibility: IncomingHttpHeaders → Fetch Headers
      services: {
        user: userService,
      },
      userId: undefined,
      permissions: undefined,
    };
  },
});
