import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Health check endpoint for Docker and load balancers
 * Returns 200 OK if service is healthy
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ status: string; uptime: number }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ status: 'error', uptime: 0 });
    return;
  }

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
}
