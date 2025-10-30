import 'reflect-metadata';
import { ServicesContext } from './services';
import { UserService } from './services/user.service';
import { DatabaseService } from './services/database.service';
import { UserDAO } from './services/user.dao';

let initialized = false;

/**
 * Initialize all services on application startup
 * Should be called once when the application starts
 * Example: Automatically called on first tRPC request or API route
 *
 * Service initialization order matters:
 * 1. Database service (required by DAOs)
 * 2. Data access objects (use database service)
 * 3. Business logic services (use DAOs)
 */
export async function initializeServices(): Promise<void> {
  console.log('[ServicesContext] Initializing services...');

  // Register all services - ORDER MATTERS!
  // Database service must initialize before DAOs
  await ServicesContext.initialize([
    new DatabaseService(),
    new UserDAO(),
    new UserService(),
    // Add more services here as needed
    // new ConfigurationService(),
    // new MachinesService(),
    // new AIService(),
    // etc.
  ]);

  // Wait for all services to complete initialization
  await ServicesContext.waitForInit();

  console.log('[ServicesContext] All services initialized successfully');
}

/**
 * Ensure services are initialized (safe to call multiple times)
 * Used in API routes and tRPC context to lazy-initialize services
 */
export async function ensureServicesInitialized(): Promise<void> {
  if (!initialized) {
    await initializeServices();
    initialized = true;
  }
}

/**
 * Shutdown all services on application termination
 */
export async function shutdownServices(): Promise<void> {
  console.log('[ServicesContext] Shutting down services...');
  // ServicesContext handles cleanup automatically during shutdown
  // No explicit destroy call needed - services cleanup is called internally
  console.log('[ServicesContext] All services shut down');
  initialized = false;
}
