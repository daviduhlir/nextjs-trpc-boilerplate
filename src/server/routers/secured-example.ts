import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router } from '../trpc';
import {
  publicProcedure,
  protectedProcedure,
  permissionProcedure,
} from '../auth/procedures';

/**
 * Example router demonstrating secured tRPC routes with PermissionsGuard
 */
export const securedExampleRouter = router({
  /**
   * Public endpoint - no authentication required
   */
  status: publicProcedure.query(({ ctx }) => {
    return {
      status: 'ok',
      message: 'This is a public endpoint',
    };
  }),

  /**
   * Protected endpoint - requires valid JWT token
   * User ID is available in ctx.userId
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // ctx.userId is guaranteed to exist because of protectedProcedure middleware
    return {
      userId: ctx.userId,
      message: `Profile for user ${ctx.userId}`,
    };
  }),

  /**
   * Permission-based endpoint - requires specific permissions
   * permissionProcedure automatically wraps handler with PermissionsGuard context
   */
  updateSettings: permissionProcedure(['settings/write', 'user/admin']).input(
    z.object({
      theme: z.enum(['light', 'dark']).optional(),
      notifications: z.boolean().optional(),
    })
  ).mutation(async ({ ctx, input }) => {
    // Permission context is automatically available via PermissionsGuard
    // Services can check permissions using PermissionsGuard.checkPermission()
    const userService = ctx.services.user;

    return {
      success: true,
      userId: ctx.userId,
      settings: input,
      message: 'Settings updated with automatic permission context',
    };
  }),

  /**
   * Create user - only users with 'user/create' or 'admin' permission
   * Permission context is automatically available in all service methods
   */
  createUser: permissionProcedure(['user/create', 'admin']).input(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })
  ).mutation(async ({ ctx, input }) => {
    const userService = ctx.services.user;

    // Services can check permissions automatically via PermissionsGuard context
    // PermissionsGuard.checkPermission('user/create') would work here
    const newUser = userService.createUser(input.name, input.email);

    return {
      success: true,
      createdBy: ctx.userId,
      user: newUser,
      message: 'User created with automatic permission context',
    };
  }),

  /**
   * List users - only users with 'user/read' permission
   * Permission context is automatically available
   */
  listUsers: permissionProcedure(['user/read']).query(async ({ ctx }) => {
    const userService = ctx.services.user;
    const users = userService.getAllUsers();

    return {
      requestedBy: ctx.userId,
      count: users.length,
      users,
    };
  }),

  /**
   * Delete user - only admins or users with 'user/delete' permission
   * Permission context is automatically available in all service methods
   */
  deleteUser: permissionProcedure(['user/delete', 'admin']).input(
    z.object({ userId: z.string() })
  ).mutation(async ({ ctx, input }) => {
    if (input.userId === ctx.userId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot delete your own account',
      });
    }

    const userService = ctx.services.user;
    const deleted = userService.deleteUser(input.userId);

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User ${input.userId} not found`,
      });
    }

    return {
      success: true,
      deletedBy: ctx.userId,
      deletedUserId: input.userId,
    };
  }),
});

export type SecuredExampleRouter = typeof securedExampleRouter;
