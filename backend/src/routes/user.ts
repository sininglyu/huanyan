import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, skinAnalyses, checkins, posts, comments, postFavorites, postLikes, postTags, tryonResults } from '../db/schema';
import { eq, and, gte, lt, desc } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const userRouter = Router();
userRouter.use(authMiddleware);

const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(64).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

userRouter.get('/profile', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) return res.status(404).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'User not found'));
  return res.json({
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    level: user.level,
    followersCount: user.followersCount,
    totalLikesReceived: user.totalLikesReceived,
    currentStreak: user.currentStreak,
    lastCheckinAt: user.lastCheckinAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

userRouter.patch('/profile', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  try {
    const body = updateProfileSchema.parse(req.body);
    const [updated] = await db
      .update(users)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.userId))
      .returning();
    if (!updated) return res.status(404).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'User not found'));
    return res.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'Validation failed', { errors: e.flatten() }));
    }
    throw e;
  }
});

userRouter.post('/checkin', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const [existing] = await db
    .select()
    .from(checkins)
    .where(and(eq(checkins.userId, req.userId), eq(checkins.checkinDate, today)))
    .limit(1);
  if (existing) {
    return res.json({ message: 'Already checked in today', currentStreak: (await db.select().from(users).where(eq(users.id, req.userId)).limit(1))[0]?.currentStreak ?? 0 });
  }
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) return res.status(404).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'User not found'));
  const lastCheckin = user.lastCheckinAt;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const newStreak = !lastCheckin
    ? 1
    : lastCheckin.toISOString().slice(0, 10) === yesterdayStr
      ? (user.currentStreak ?? 0) + 1
      : 1;
  await db.insert(checkins).values({ userId: req.userId, checkinDate: today });
  await db
    .update(users)
    .set({ currentStreak: newStreak, lastCheckinAt: now, updatedAt: now })
    .where(eq(users.id, req.userId));
  const badge = newStreak >= 100 ? '护肤专家' : newStreak >= 30 ? '护肤达人' : newStreak >= 7 ? '护肤新人' : null;
  return res.status(201).json({ message: 'Check-in success', currentStreak: newStreak, badge });
});

userRouter.get('/skin-reports', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const period = (req.query.period as string) ?? 'month';
  const days = period === 'week' ? 7 : 30;
  const from = new Date();
  from.setDate(from.getDate() - days);
  const list = await db
    .select({ id: skinAnalyses.id, score: skinAnalyses.score, createdAt: skinAnalyses.createdAt })
    .from(skinAnalyses)
    .where(and(eq(skinAnalyses.userId, req.userId), gte(skinAnalyses.createdAt, from)))
    .orderBy(desc(skinAnalyses.createdAt))
    .limit(100);
  type SkinAnalysisRow = { id: string; score: number | null; createdAt: Date | null };
  const scores = list.map((r: SkinAnalysisRow) => ({ date: r.createdAt?.toISOString().slice(0, 10), score: r.score }));
  type ScorePoint = { date: string | undefined; score: number | null };
  const avg = scores.length ? scores.reduce((s: number, r: ScorePoint) => s + (r.score ?? 0), 0) / scores.length : 0;
  const prevFrom = new Date(from);
  prevFrom.setDate(prevFrom.getDate() - days);
  const prevList = await db
    .select({ score: skinAnalyses.score })
    .from(skinAnalyses)
    .where(and(eq(skinAnalyses.userId, req.userId), gte(skinAnalyses.createdAt, prevFrom), lt(skinAnalyses.createdAt, from)))
    .limit(100);
  const prevAvg = prevList.length ? prevList.reduce((s: number, r: { score: number | null }) => s + (r.score ?? 0), 0) / prevList.length : avg;
  const changePercent = prevAvg > 0 ? Math.round(((avg - prevAvg) / prevAvg) * 100) : 0;
  return res.json({
    trend: scores,
    averageScore: Math.round(avg),
    changePercent,
    period,
  });
});

userRouter.get('/data-export', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) return res.status(404).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'User not found'));
  const analyses = await db.select().from(skinAnalyses).where(eq(skinAnalyses.userId, req.userId));
  const userPosts = await db.select().from(posts).where(eq(posts.userId, req.userId));
  const userComments = await db.select().from(comments).where(eq(comments.userId, req.userId));
  const favorites = await db.select().from(postFavorites).where(eq(postFavorites.userId, req.userId));
  const exportData = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl, level: user.level, createdAt: user.createdAt },
    skinAnalyses: analyses.map((a: InferSelectModel<typeof skinAnalyses>) => ({ id: a.id, score: a.score, createdAt: a.createdAt })),
    posts: userPosts.map((p: InferSelectModel<typeof posts>) => ({ id: p.id, title: p.title, createdAt: p.createdAt })),
    comments: userComments.length,
    favorites: favorites.length,
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="huanyan-data-export.json"');
  return res.send(JSON.stringify(exportData, null, 2));
});

userRouter.delete('/account', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  await db.delete(skinAnalyses).where(eq(skinAnalyses.userId, req.userId));
  await db.delete(checkins).where(eq(checkins.userId, req.userId));
  await db.delete(comments).where(eq(comments.userId, req.userId));
  await db.delete(postFavorites).where(eq(postFavorites.userId, req.userId));
  await db.delete(postLikes).where(eq(postLikes.userId, req.userId));
  const userPosts = await db.select({ id: posts.id }).from(posts).where(eq(posts.userId, req.userId));
  for (const p of userPosts) {
    await db.delete(comments).where(eq(comments.postId, p.id));
    await db.delete(postLikes).where(eq(postLikes.postId, p.id));
    await db.delete(postFavorites).where(eq(postFavorites.postId, p.id));
    await db.delete(postTags).where(eq(postTags.postId, p.id));
  }
  await db.delete(posts).where(eq(posts.userId, req.userId));
  await db.delete(tryonResults).where(eq(tryonResults.userId, req.userId));
  await db.delete(users).where(eq(users.id, req.userId));
  return res.json({ message: 'Account deleted' });
});
