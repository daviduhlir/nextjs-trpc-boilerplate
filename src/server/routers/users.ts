import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

/**
 * User router with tRPC procedures using the UserService
 * Demonstrates how to access services from the context
 */
export const usersRouter = router({
  /**
   * List all users
   */
  list: publicProcedure.query(({ ctx }) => {
    return ctx.services.user.getAllUsers();
  }),

  /**
   * Get user by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const user = ctx.services.user.getUserById(input.id);
      if (!user) {
        throw new Error(`User with id ${input.id} not found`);
      }
      return user;
    }),

  /**
   * Create a new user
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(({ ctx, input }) => {
      // Check if email already exists
      const existing = ctx.services.user.findByEmail(input.email);
      if (existing) {
        throw new Error(`User with email ${input.email} already exists`);
      }

      return ctx.services.user.createUser(input.name, input.email);
    }),

  /**
   * Update user by ID
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...updates } = input;

      // Check if email is taken by another user
      if (updates.email) {
        const existing = ctx.services.user.findByEmail(updates.email);
        if (existing && existing.id !== id) {
          throw new Error(`User with email ${updates.email} already exists`);
        }
      }

      const user = ctx.services.user.updateUser(id, updates);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user;
    }),

  /**
   * Delete user by ID
   */
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const deleted = ctx.services.user.deleteUser(input.id);
      if (!deleted) {
        throw new Error(`User with id ${input.id} not found`);
      }
      return { success: true };
    }),
});

export type UsersRouter = typeof usersRouter;
