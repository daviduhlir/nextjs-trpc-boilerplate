import { Service } from '@david.uhlir/services';

/**
 * UserService - Example service demonstrating service pattern
 * Services contain business logic and can be used across the application
 * This service is cluster-safe - each worker process gets its own instance
 *
 * Extends Service class from @david.uhlir/services for dependency injection
 */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class UserService extends Service {
  // In-memory storage for demo purposes (replace with database in production)
  private users: Map<string, User> = new Map();
  private idCounter: number = 1;

  /**
   * Initialize the service (e.g., connect to database)
   * Called once during application startup
   */
  async initialize(): Promise<void> {
    console.log('[UserService] Initializing...');
    // Add initialization logic here
    // Example: await this.connectToDatabase();
  }

  /**
   * Shutdown the service (e.g., close database connections)
   * Called on application termination
   */
  async shutdown(): Promise<void> {
    console.log('[UserService] Shutting down...');
    this.users.clear();
    // Add cleanup logic here
    // Example: await this.closeDatabase();
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  /**
   * Create a new user
   * @param name - User name
   * @param email - User email
   * @returns Created user
   */
  createUser(name: string, email: string): User {
    const id = String(this.idCounter++);
    const user: User = {
      id,
      name,
      email,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  /**
   * Update user
   * @param id - User ID
   * @param updates - Fields to update
   * @returns Updated user or null if not found
   */
  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updated: User = { ...user, ...updates, id, createdAt: user.createdAt };
    this.users.set(id, updated);
    return updated;
  }

  /**
   * Delete user
   * @param id - User ID
   * @returns True if deleted, false if not found
   */
  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  /**
   * Find users by email
   * @param email - Email to search for
   * @returns User or null if not found
   */
  findByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }
}
