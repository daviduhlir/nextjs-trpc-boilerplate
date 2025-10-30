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
 * Adds userId to context
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const userId = extractUserId(
    ctx.headers ? Object.fromEntries(ctx.headers) : undefined
  );

  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No authentication token provided',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});

/**
 * Protected procedure with permission checking
 * Requires valid JWT token AND specified permissions
 *
 * Automatically wraps handler execution with PermissionsGuard context,
 * so permissions are available to all async calls within the handler
 * without explicit wrapping.
 *
 * Usage: permissionProcedure(['entity/write', 'user/admin'])
 *   .mutation(async ({ ctx, input }) => {
 *     // ctx.services.user.delete() can now check permissions automatically
 *     return ctx.services.user.deleteUser(input.userId);
 *   })
 */
export function permissionProcedure(requiredPermissions: string[]) {
  return t.procedure.use(async ({ ctx, next }) => {
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

    // Check if user has required permissions
    const hasPermission = requiredPermissions.every((perm) =>
      permissions.includes(perm)
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permissions: ${requiredPermissions.join(', ')}`,
      });
    }

    // Wrap handler execution with PermissionsGuard context
    // This sets up async_local_storage so permissions are available
    // to all service methods without explicit passing
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
}

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
