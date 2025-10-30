import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { ServicesContext } from './services';
import { UserService } from './services/user.service';
import { UserDAO } from './services/user.dao';
import { ensureServicesInitialized } from './init';

/**
 * Creates the context for tRPC procedures
 * Context is passed to all tRPC procedures and contains request data and services
 * Services are managed by ServicesContext (dependency injection container)
 *
 * Architecture:
 * - Route calls services (business logic)
 * - Services call DAOs (data access)
 * - DAOs call DatabaseService (Prisma)
 *
 * @param opts - Options containing request headers and other metadata
 * @returns Context object passed to procedures
 */
export async function createContext(opts?: FetchCreateContextFnOptions) {
  // Ensure services are initialized on first request
  await ensureServicesInitialized();

  // Get service instances from ServicesContext
  const userService = ServicesContext.lookup(UserService);
  const userDAO = ServicesContext.lookup(UserDAO);

  return {
    req: opts?.req,
    headers: opts?.req?.headers,
    // Services available in all procedures
    services: {
      user: userService,
      userDAO,
    },
    // Will be populated by auth middleware for protected procedures
    userId: undefined as string | undefined,
    permissions: undefined as string[] | undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
