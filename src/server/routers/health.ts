import { publicProcedure, router } from '../trpc';

/**
 * Health check router for monitoring and Docker health checks
 * Simple endpoints to verify service is running
 */
export const healthRouter = router({
  /**
   * Basic health check
   * Returns OK status
   */
  status: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }),

  /**
   * Deep health check with service status
   */
  deep: publicProcedure.query(({ ctx }) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        user: !!ctx.services.user,
      },
      environment: process.env.NODE_ENV,
    };
  }),
});

export type HealthRouter = typeof healthRouter;
