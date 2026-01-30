import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { config } from '../config/index';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

const registerSchema = z.object({
  phone: z.string().optional(),
  openId: z.string().optional(),
  nickname: z.string().min(1).max(64),
  avatarUrl: z.string().url().optional().nullable(),
});
const loginSchema = z.object({
  phone: z.string().optional(),
  openId: z.string().optional(),
});

function signToken(userId: string): string {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
  );
}

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    if (!body.phone && !body.openId) {
      return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'phone or openId required'));
    }
    const existingList = body.phone
      ? await db.select().from(users).where(eq(users.phone, body.phone)).limit(1)
      : await db.select().from(users).where(eq(users.openId, body.openId!)).limit(1);
    const existing = existingList[0];
    if (existing) {
      return res.status(400).json(apiError(ERROR_CODES.AUTH.USER_EXISTS, 'User already exists'));
    }
    const [user] = await db
      .insert(users)
      .values({
        phone: body.phone ?? null,
        openId: body.openId ?? null,
        nickname: body.nickname,
        avatarUrl: body.avatarUrl ?? null,
      })
      .returning();
    const token = signToken(user.id);
    return res.status(201).json({ token, user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'Validation failed', { errors: e.flatten() }));
    }
    throw e;
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    if (!body.phone && !body.openId) {
      return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'phone or openId required'));
    }
    const userList = body.phone
      ? await db.select().from(users).where(eq(users.phone, body.phone)).limit(1)
      : await db.select().from(users).where(eq(users.openId, body.openId!)).limit(1);
    const user = userList[0];
    if (!user) {
      return res.status(401).json(apiError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, 'Invalid credentials'));
    }
    const token = signToken(user.id);
    return res.json({ token, user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'Validation failed', { errors: e.flatten() }));
    }
    throw e;
  }
});

authRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) return res.status(404).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'User not found'));
  const { id, nickname, avatarUrl, level, followersCount, totalLikesReceived, currentStreak, lastCheckinAt, createdAt } = user;
  return res.json({
    id,
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
