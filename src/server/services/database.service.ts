import { PrismaClient } from '@prisma/client';
import { Service } from '@david.uhlir/services';

/**
 * Database Service
 * Manages Prisma client connection lifecycle
 * Provides single instance for all data access
 * Usage: ServicesContext.lookup(DatabaseService).prisma
 */
export class DatabaseService extends Service {
  private prisma: PrismaClient | null = null;

  /**
   * Get Prisma client instance
   * Ensures lazy connection establishment
   */
  getPrisma(): PrismaClient {
    if (!this.prisma) {
      this.prisma = new PrismaClient();
    }
    return this.prisma;
  }

  /**
   * Initialize database connection
   * Only connects if DATABASE_URL is configured
   */
  async initialize(): Promise<void> {
    console.log('[DatabaseService] Initializing...');
    try {
      // Check if DATABASE_URL is configured
      if (!process.env.DATABASE_URL) {
        console.warn('[DatabaseService] DATABASE_URL not configured - skipping connection');
        return;
      }

      const prisma = this.getPrisma();
      await prisma.$connect();
      console.log('[DatabaseService] Connected to PostgreSQL');
    } catch (error) {
      console.error('[DatabaseService] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Shutdown database connection
   */
  async shutdown(): Promise<void> {
    console.log('[DatabaseService] Shutting down...');
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
      console.log('[DatabaseService] Disconnected from PostgreSQL');
    }
  }
}
