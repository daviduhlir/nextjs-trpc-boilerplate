import type { Request, Response } from 'express';
import { ServicesContext } from './services';
import { UserService } from './services/user.service';
import { UserDAO } from './services/user.dao';
import { ensureServicesInitialized } from './init';

/**
 * Creates the context for tRPC procedures
 * Context is passed to all tRPC procedures and contains request data and services
 * Services are managed by ServicesContext (dependency injection container)
 *
 * Works with both Express and Fetch adapters
 *
 * Architecture:
 * - Route calls services (business logic)
 * - Services call DAOs (data access)
 * - DAOs call DatabaseService (Prisma)
 *
 * @param opts - Options containing request and response (Express) or request (Fetch)
 * @returns Context object passed to procedures
 */
export async function createContext(opts?: {
  req: Request | undefined;
  res: Response | undefined;
}) {
  // Ensure services are initialized on first request
  await ensureServicesInitialized();

  // Get service instances from ServicesContext
  const userService = ServicesContext.lookup(UserService);
  const userDAO = ServicesContext.lookup(UserDAO);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const req = opts?.req as any;
  const headers = req?.headers || {};

  return {
    req: req as any,
    headers: headers as any,
    // Services available in all procedures
    services: {
      user: userService,
      userDAO,
    },
    // Will be populated by auth middleware for protected procedures
    userId: req?.userId as string | undefined,
    permissions: req?.permissions as string[] | undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
