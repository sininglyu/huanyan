import 'dotenv/config';
import path from 'path';
import express from 'express';
import { apiRouter } from './routes/index';
import { apiError, ERROR_CODES } from './lib/errors';
import { config } from './config/index';
import { initializeCronJobs } from './lib/cron';

const app = express();

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, env: config.env });
});

const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

app.use('/api/v1', apiRouter);

app.use((_req, _res, next) => {
  next(apiError('NOT_FOUND', 'Not Found'));
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err && typeof err === 'object' && 'error' in err && typeof (err as { error: unknown }).error === 'object') {
    const body = err as { error: { code: string; message: string; details?: Record<string, unknown>; timestamp: string } };
    return res.status(400).json(body);
  }
  console.error(err);
  res.status(500).json(
    apiError(ERROR_CODES.INTERNAL, 'Internal Server Error')
  );
});

app.listen(config.port, () => {
  console.log(`Huanyan API listening on port ${config.port}`);
  
  // Initialize cron jobs after server starts
  initializeCronJobs();
});
