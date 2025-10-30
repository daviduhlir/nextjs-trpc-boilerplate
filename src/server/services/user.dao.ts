import { Service, ServicesContext } from '@david.uhlir/services';
import { PermissionsGuard } from '@david.uhlir/permissions-guard';
import { DatabaseService } from './database.service';

/**
 * User Data Access Object (DAO)
 * Handles all database operations for users
 * Acts as intermediary between routes and database
 *
 * Permission checking:
 * - PermissionsGuard.checkRequiredPermissions() checks against async_local_storage context
 * - Permissions are set via protectedProcedure middleware automatically
 * - Throws exception if user doesn't have required permission
 *
 * Usage: ServicesContext.lookup(UserDAO).create(...)
 */
export class UserDAO extends Service {
  /**
   * DatabaseService injected via decorator
   * Provides access to Prisma client
   */
  @ServicesContext.inject(DatabaseService)
  private databaseService!: DatabaseService;

  /**
   * Create a new user in database
   */
  async create(name: string, email: string) {
    // Permission check - PermissionsGuard gets permissions from async context
    await PermissionsGuard.checkRequiredPermissions(['user/create']);

    const db = this.databaseService.getPrisma();
    return db.user.create({
      data: {
        name,
        email,
      },
    });
  }

  /**
   * Get user by ID
   */
  async findById(id: string) {
    // Read operations might not need permissions, depends on business logic
    const db = this.databaseService.getPrisma();
    return db.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string) {
    const db = this.databaseService.getPrisma();
    return db.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get all users
   */
  async findAll() {
    // Permission check for reading all users
    await PermissionsGuard.checkRequiredPermissions(['user/read']);

    const db = this.databaseService.getPrisma();
    return db.user.findMany();
  }

  /**
   * Update user
   */
  async update(id: string, data: { name?: string; email?: string }) {
    // Permission check for updates
    await PermissionsGuard.checkRequiredPermissions(['user/write']);

    const db = this.databaseService.getPrisma();
    return db.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    // Permission check - must have user/delete permission
    // PermissionsGuard gets permissions from async_local_storage, throws if missing
    await PermissionsGuard.checkRequiredPermissions(['user/delete']);

    const db = this.databaseService.getPrisma();
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }
    return db.user.delete({
      where: { id },
    });
  }

  /**
   * Initialize DAO
   */
  async initialize(): Promise<void> {
    console.log('[UserDAO] Initialized');
  }

  /**
   * Shutdown DAO
   */
  async shutdown(): Promise<void> {
    console.log('[UserDAO] Shutdown');
  }
}
