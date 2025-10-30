import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router } from '../trpc';
import {
  publicProcedure,
  protectedProcedure,
} from '../auth/procedures';

/**
 * Example router demonstrating secured tRPC routes with PermissionsGuard
 */
export const securedExampleRouter = router({
  /**
   * Public endpoint - no authentication required
   */
  status: publicProcedure.query(() => {
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
   * Permission-protected endpoint
   * protectedProcedure wraps handler with PermissionsGuard context.
   * Actual permission checks happen in service/DAO methods.
   */
  updateSettings: protectedProcedure.input(
    z.object({
      theme: z.enum(['light', 'dark']).optional(),
      notifications: z.boolean().optional(),
    })
  ).mutation(async ({ ctx, input }) => {
    // Service/DAO will check permissions via PermissionsGuard.checkRequiredPermissions()
    // Permission validation happens in service/DAO layer

    return {
      success: true,
      userId: ctx.userId,
      settings: input,
      message: 'Settings updated - permissions checked in service layer',
    };
  }),

  /**
   * Create user - permission checked in service/DAO
   * Service/DAO will call PermissionsGuard.checkRequiredPermissions(['user/create'])
   */
  createUser: protectedProcedure.input(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })
  ).mutation(async ({ ctx, input }) => {
    const userService = ctx.services.user;
    // userService or userDAO will check permissions automatically
    const newUser = userService.createUser(input.name, input.email);

    return {
      success: true,
      createdBy: ctx.userId,
      user: newUser,
      message: 'User created - permissions checked in service',
    };
  }),

  /**
   * List users - permission checked in service/DAO
   * Service/DAO will call PermissionsGuard.checkRequiredPermissions(['user/read'])
   */
  listUsers: protectedProcedure.query(async ({ ctx }) => {
    const userService = ctx.services.user;
    const users = userService.getAllUsers();

    return {
      requestedBy: ctx.userId,
      count: users.length,
      users,
    };
  }),

  /**
   * Delete user - permission checked in service/DAO
   * Service/DAO will call PermissionsGuard.checkRequiredPermissions(['user/delete'])
   */
  deleteUser: protectedProcedure.input(
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
