import { CronJob } from 'cron';
import { config } from '../config/index';

/**
 * Initialize cron jobs for the application
 * Currently includes a health check job to keep Render service alive
 */
export function initializeCronJobs() {
  // Only run cron jobs in production to avoid unnecessary pings during development
  if (config.env !== 'production') {
    console.log('[Cron] Skipping cron jobs in non-production environment');
    return;
  }

  const serviceUrl = process.env.RENDER_SERVICE_URL;
  
  if (!serviceUrl) {
    console.warn('[Cron] RENDER_SERVICE_URL not set, health check cron job will not run');
    return;
  }

  // Health check cron job - runs every 14 minutes to prevent Render free tier from sleeping
  const healthCheckJob = new CronJob(
    '*/14 * * * *', // Every 14 minutes
    async () => {
      try {
        const healthUrl = `${serviceUrl}/health`;
        console.log(`[Cron] Pinging health endpoint: ${healthUrl}`);
        
        const response = await fetch(healthUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Cron] Health check successful:', data);
        } else {
          console.error(`[Cron] Health check failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('[Cron] Health check error:', error);
      }
    },
    null, // onComplete
    true, // start immediately
    'America/New_York' // timezone
  );

  console.log('[Cron] Health check job initialized - running every 14 minutes');
  
  // Return the job in case we need to stop it later
  return {
    healthCheckJob,
  };
}
