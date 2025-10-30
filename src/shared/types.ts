/**
 * Shared types between frontend and backend
 *
 * WARNING: This file should contain ONLY TypeScript type exports
 * Use 'type' imports and exports ONLY to avoid importing backend code at runtime
 *
 * Frontend gets types from this file, never from server code directly
 */

// Import ONLY the type, not the implementation
// The 'type' keyword ensures this is stripped during compilation
import type { appRouter } from '../server/routers/_app';

/**
 * Export AppRouter type for frontend tRPC client
 * This is inferred from the appRouter, so it's always in sync
 */
export type AppRouter = typeof appRouter;
