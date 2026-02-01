import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  env: process.env.APP_ENV ?? 'development',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  rateLimit: parseInt(process.env.API_RATE_LIMIT ?? '100', 10),
  logto: {
    endpoint: process.env.LOGTO_ENDPOINT ?? '',
    apiResource: process.env.LOGTO_API_RESOURCE ?? '',
  },
};
