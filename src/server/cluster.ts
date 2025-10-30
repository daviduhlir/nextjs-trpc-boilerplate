import cluster from 'cluster';
import os from 'os';
import { initializeServices, shutdownServices } from './init';

/**
 * Cluster support for running the backend in multi-process mode
 * Each worker process gets its own instance of services
 * Master process coordinates workers
 *
 * Usage:
 *   import { startCluster } from '@/server/cluster';
 *   startCluster(app);
 */

/**
 * Start application in cluster mode
 * Each worker gets its own event loop and service instances
 * Safe for stateless operations and connections per-worker
 * @param startServer - Function to start the server (passed the cluster id/port)
 */
export async function startCluster(
  startServer: (workerId: number) => Promise<void>
): Promise<void> {
  const numCPUs = os.cpus().length;
  const numWorkers = parseInt(process.env.CLUSTER_WORKERS || String(numCPUs), 10);

  if (cluster.isPrimary) {
    console.log(`[Master] Starting cluster with ${numWorkers} workers`);

    // Spawn workers
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    // Handle worker exits
    cluster.on('exit', (worker, code, signal) => {
      if (signal) {
        console.log(
          `[Master] Worker ${worker.process.pid} was killed by signal: ${signal}`
        );
      } else if (code !== 0) {
        console.log(
          `[Master] Worker ${worker.process.pid} exited with error code: ${code}`
        );
      } else {
        console.log(`[Master] Worker ${worker.process.pid} exited successfully`);
      }
    });

    // Handle master shutdown
    process.on('SIGTERM', () => {
      console.log('[Master] SIGTERM received, shutting down gracefully');
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill();
      }
      process.exit(0);
    });
  } else {
    // Worker process
    const workerId = cluster.worker?.id || 0;
    const port = 3000 + workerId; // Offset port per worker (for debugging)

    console.log(`[Worker ${workerId}] Initializing services...`);
    await initializeServices();

    console.log(`[Worker ${workerId}] Starting server...`);
    await startServer(workerId);

    // Handle worker shutdown
    process.on('SIGTERM', async () => {
      console.log(`[Worker ${workerId}] SIGTERM received, shutting down gracefully`);
      await shutdownServices();
      process.exit(0);
    });
  }
}

/**
 * Utility to get worker ID (for logging or distinguishing requests)
 */
export function getWorkerId(): number {
  return cluster.worker?.id || 0;
}

/**
 * Check if running in cluster mode
 */
export function isClusterMode(): boolean {
  return process.env.CLUSTER_MODE === 'true';
}
