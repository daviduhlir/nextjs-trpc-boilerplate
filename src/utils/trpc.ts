import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '@/shared/types';

/**
 * Initialize tRPC client for Next.js
 * Connects to standalone backend server
 * Note: Only imports types from @/shared/types, NO backend code
 */
export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBackendUrl()}/trpc`,
          maxURLLength: 2083,
        }),
      ],
    };
  },
  ssr: false,
});

/**
 * Get the backend URL for tRPC calls
 * @returns Backend URL depending on environment
 */
function getBackendUrl() {
  if (typeof window !== 'undefined') {
    // Browser - use relative or backend URL
    return process.env.NEXT_PUBLIC_BACKEND_URL || `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || 3001}`;
  }
  // Server - use environment variable or default
  return process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || 3001}`;
}
