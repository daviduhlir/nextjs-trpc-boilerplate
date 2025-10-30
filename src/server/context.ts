import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { ServicesContext } from './services';
import { UserService } from './services/user.service';
import { ensureServicesInitialized } from './init';

/**
 * Creates the context for tRPC procedures
 * Context is passed to all tRPC procedures and contains request data and services
 * Services are managed by ServicesContext (dependency injection container)
 * @param opts - Options containing request headers and other metadata
 * @returns Context object passed to procedures
 */
export async function createContext(opts?: FetchCreateContextFnOptions) {
  // Ensure services are initialized on first request
  await ensureServicesInitialized();

  // Get service instance from ServicesContext
  const userService = ServicesContext.lookup(UserService);

  return {
    req: opts?.req,
    headers: opts?.req?.headers,
    // Services available in all procedures
    services: {
      user: userService,
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
