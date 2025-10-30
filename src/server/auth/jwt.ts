import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

/**
 * JWT Token payload structure
 */
export interface TokenPayload extends JwtPayload {
  userId: string;
  email?: string;
  permissions?: string[];
}

/**
 * Extract and parse JWT token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer token")
 * @returns Parsed token payload or null if invalid
 */
export function parseAuthHeader(authHeader?: string): TokenPayload | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  const token = parts[1];

  try {
    // Note: In production, verify with your secret
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const payload = jwt.verify(token, secret) as TokenPayload;
    return payload;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error);
    return null;
  }
}

/**
 * Extract user ID from request headers
 * @param headers - Request headers
 * @returns User ID or null if not authenticated
 */
export function extractUserId(headers?: Record<string, string | string[]>): string | null {
  if (!headers) return null;

  const authHeader = headers.authorization;
  if (typeof authHeader !== 'string') return null;

  const payload = parseAuthHeader(authHeader);
  return payload?.userId || null;
}

/**
 * Extract permissions from token
 * @param headers - Request headers
 * @returns Array of permissions or empty array
 */
export function extractPermissions(headers?: Record<string, string | string[]>): string[] {
  if (!headers) return [];

  const authHeader = headers.authorization;
  if (typeof authHeader !== 'string') return [];

  const payload = parseAuthHeader(authHeader);
  return payload?.permissions || [];
}
