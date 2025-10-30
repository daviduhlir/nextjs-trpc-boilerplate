import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

/**
 * Example router demonstrating tRPC procedures
 * Contains sample queries and mutations
 */
export const exampleRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return {
        message: `Hello ${input?.name || 'World'}!`,
      };
    }),

  add: publicProcedure
    .input(
      z.object({
        a: z.number(),
        b: z.number(),
      })
    )
    .mutation(({ input }) => {
      return {
        result: input.a + input.b,
      };
    }),
});

export type ExampleRouter = typeof exampleRouter;
