import { router } from '../trpc';
import { exampleRouter } from './example';
import { usersRouter } from './users';
import { healthRouter } from './health';
import { securedExampleRouter } from './secured-example';

/**
 * Main app router combining all feature routers
 * This is the root router that combines all sub-routers
 */
export const appRouter = router({
  health: healthRouter,
  example: exampleRouter,
  users: usersRouter,
  secured: securedExampleRouter,
});

export type AppRouter = typeof appRouter;
