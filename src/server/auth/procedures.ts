import { TRPCError } from '@trpc/server';
import { PermissionsGuard } from '@david.uhlir/permissions-guard';
import { t } from '../trpc';
import { extractUserId, extractPermissions } from './jwt';

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires valid JWT token
 *
 * Wraps handler with PermissionsGuard context for permission checking.
 * Permissions are NOT validated here - validation happens in service/DAO methods
 * via PermissionsGuard.checkRequiredPermissions()
 *
 * Usage in routes:
 *   protectedProcedure.query/mutation(async ({ ctx, input }) => {
 *     // Service/DAO will call PermissionsGuard.checkRequiredPermissions()
 *     return ctx.services.userDAO.delete(input.userId);
 *   })
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const userId = extractUserId(
    ctx.headers ? Object.fromEntries(ctx.headers) : undefined
  );
  const permissions = extractPermissions(
    ctx.headers ? Object.fromEntries(ctx.headers) : undefined
  );

  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No authentication token provided',
    });
  }

  // Wrap handler execution with PermissionsGuard context
  // This sets up async_local_storage so permissions are available
  // to all service/DAO methods automatically
  return PermissionsGuard.runWithPermissions(
    permissions,
    userId,
    () =>
      next({
        ctx: {
          ...ctx,
          userId,
          permissions,
        },
      })
  );
});

/**
 * Create a permission context helper
 * Wraps async function with PermissionsGuard
 * @param userId - User ID
 * @param permissions - Array of permissions
 * @param callback - Async function to run with permissions
 */
export async function withPermissions<T>(
  userId: string,
  permissions: string[],
  callback: () => Promise<T>
): Promise<T> {
  return PermissionsGuard.runWithPermissions(permissions, userId, callback);
}
