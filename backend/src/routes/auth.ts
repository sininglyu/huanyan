import { Router, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

/**
 * @deprecated POST /register and POST /login are deprecated.
 * Authentication is now handled by Logto.
 * Users are automatically created when they first authenticate via Logto.
 */

// Legacy endpoints - kept for backwards compatibility but return deprecation notice
authRouter.post('/register', (_req, res: Response) => {
  return res.status(410).json(
    apiError(
      ERROR_CODES.VALIDATION,
      'This endpoint is deprecated. Please use Logto authentication instead.'
    )
  );
});

authRouter.post('/login', (_req, res: Response) => {
  return res.status(410).json(
    apiError(
      ERROR_CODES.VALIDATION,
      'This endpoint is deprecated. Please use Logto authentication instead.'
    )
  );
});

/**
 * GET /me - Get current authenticated user's profile
 * Now uses Logto JWT validation via authMiddleware
 */
authRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) {
    return res.status(404).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'User not found'));
  }

  const {
    id,
    email,
    nickname,
    avatarUrl,
    level,
    followersCount,
    totalLikesReceived,
    currentStreak,
    lastCheckinAt,
    createdAt,
  } = user;

  return res.json({
    id,
    email,
    nickname,
    avatarUrl,
    level,
    followersCount,
    totalLikesReceived,
    currentStreak,
    lastCheckinAt,
    createdAt,
  });
});
