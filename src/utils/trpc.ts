import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '@/server/routers/_app';

/**
 * Initialize tRPC client for Next.js
 * Sets up communication with the backend API
 */
export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          maxURLLength: 2083,
        }),
      ],
    };
  },
  ssr: false,
});

/**
 * Get the base URL for API calls
 * @returns Base URL depending on environment
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}
