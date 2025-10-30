import { router } from '../trpc';
import { exampleRouter } from './example';
import { usersRouter } from './users';
import { healthRouter } from './health';

/**
 * Main app router combining all feature routers
 * This is the root router that combines all sub-routers
 */
export const appRouter = router({
  health: healthRouter,
  example: exampleRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
