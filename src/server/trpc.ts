import { initTRPC } from '@trpc/server';
import type { Context } from './context';

/**
 * Initialize tRPC with context typing
 * Creates the base for creating procedures and routers
 */
export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
