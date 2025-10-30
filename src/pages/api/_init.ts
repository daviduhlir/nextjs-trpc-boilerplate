import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeServices } from '@/server/init';

/**
 * Internal initialization endpoint
 * Called once on application startup to initialize services
 * This should be called before any other API routes
 */
let initialized = false;

export async function ensureServicesInitialized(): Promise<void> {
  if (!initialized) {
    await initializeServices();
    initialized = true;
  }
}

/**
 * Health endpoint that ensures services are initialized
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    await ensureServicesInitialized();
    res.status(200).json({ status: 'initialized' });
  } catch (error) {
    console.error('[_init] Initialization error:', error);
    res.status(500).json({ status: 'error', error: String(error) });
  }
}
