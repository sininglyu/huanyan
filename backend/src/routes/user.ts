import { Router, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db } from '../db';
import { users, skinAnalyses, checkins, posts, comments, postFavorites, postLikes, postShares, postTags, tryonResults } from '../db/schema';
import { eq, and, gte, lt, desc, inArray } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { saveBuffer, getPublicUrl } from '../lib/storage';

export const userRouter = Router();
userRouter.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(64).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  age: z.number().int().min(1).max(150).optional().nullable(),
});

userRouter.get('/profile', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) return res.status(404).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'User not found'));
  return res.json({
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    gender: user.gender,
    age: user.age,
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

userRouter.post('/avatar', upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const file = req.file;
  if (!file) return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'No image file'));
  const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
  const imagePath = `user_${req.userId}/avatar_${Date.now()}${ext}`;
  await saveBuffer(imagePath, file.buffer);
  const avatarUrl = getPublicUrl(imagePath);
  await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, req.userId));
  return res.json({ avatarUrl });
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

function getWeekDailyScores(
  list: Array<{ score: number | null; createdAt: Date | null }>
): { date: string; score: number }[] {
  const byDate = new Map<string, number[]>();
  for (const r of list) {
    const date = r.createdAt?.toISOString().slice(0, 10);
    if (!date || r.score == null) continue;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(r.score);
  }
  const daily: { date: string; score: number }[] = [];
  for (const [date, scores] of byDate.entries()) {
    daily.push({ date, score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) });
  }
  return daily.sort((a, b) => a.date.localeCompare(b.date));
}

/** Build 7-day window (UTC dates) so date strings match DB createdAt.toISOString().slice(0,10). */
function weekWindowFromToday(offsetWeeks: number): { from: Date; to: Date; dates: string[] } {
  const now = new Date();
  const dates: string[] = [];
  const startOffset = 6 + offsetWeeks * 7;
  const endOffset = offsetWeeks * 7;
  for (let i = startOffset; i >= endOffset; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const from = new Date(dates[0] + 'T00:00:00.000Z');
  const to = new Date(dates[6] + 'T23:59:59.999Z');
  return { from, to, dates };
}

/** Current calendar week Mon–Sun in UTC. dates[0]=Monday, dates[6]=Sunday. */
function calendarWeekFromToday(offsetWeeks: number): { from: Date; to: Date; dates: string[] } {
  const now = new Date();
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysSinceMonday - offsetWeeks * 7);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const from = new Date(dates[0] + 'T00:00:00.000Z');
  const to = new Date(dates[6] + 'T23:59:59.999Z');
  return { from, to, dates };
}

userRouter.get('/skin-reports', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const period = (req.query.period as string) ?? 'month';
  type SkinAnalysisRow = { id: string; score: number | null; createdAt: Date | null };

  if (period === 'week') {
    const thisWeek = calendarWeekFromToday(0);
    const list = await db
      .select({ id: skinAnalyses.id, score: skinAnalyses.score, createdAt: skinAnalyses.createdAt })
      .from(skinAnalyses)
      .where(
        and(
          eq(skinAnalyses.userId, req.userId),
          gte(skinAnalyses.createdAt, thisWeek.from),
          lt(skinAnalyses.createdAt, new Date(thisWeek.to.getTime() + 1))
        )
      )
      .orderBy(desc(skinAnalyses.createdAt))
      .limit(200);
    const thisWeekList = list.filter(
      (r: SkinAnalysisRow) =>
        r.createdAt && r.createdAt >= thisWeek.from && r.createdAt <= thisWeek.to
    );
    const dailyScoresRaw = getWeekDailyScores(thisWeekList);
    const dateToScore = new Map(dailyScoresRaw.map((d) => [d.date, d.score]));
    const dailyScores = thisWeek.dates.map((date) => ({
      date,
      score: dateToScore.get(date) ?? null,
    }));
    const thisWeekAvg =
      dailyScoresRaw.length > 0
        ? dailyScoresRaw.reduce((s, d) => s + d.score, 0) / dailyScoresRaw.length
        : 0;

    const lastWeek = calendarWeekFromToday(1);
    const lastWeekListRaw = await db
      .select({ id: skinAnalyses.id, score: skinAnalyses.score, createdAt: skinAnalyses.createdAt })
      .from(skinAnalyses)
      .where(
        and(
          eq(skinAnalyses.userId, req.userId),
          gte(skinAnalyses.createdAt, lastWeek.from),
          lt(skinAnalyses.createdAt, new Date(lastWeek.to.getTime() + 1))
        )
      )
      .orderBy(desc(skinAnalyses.createdAt))
      .limit(200);
    const lastWeekDaily = getWeekDailyScores(lastWeekListRaw);
    const lastWeekAvg =
      lastWeekDaily.length > 0
        ? lastWeekDaily.reduce((s, d) => s + d.score, 0) / lastWeekDaily.length
        : thisWeekAvg;
    const changePercent =
      lastWeekAvg > 0 ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100) : 0;

    return res.json({
      trend: list.map((r: SkinAnalysisRow) => ({
        date: r.createdAt?.toISOString().slice(0, 10),
        score: r.score,
      })),
      dailyScores: dailyScores.map((d) => ({ date: d.date, score: d.score === null ? null : Number(d.score) })),
      averageScore: Math.round(thisWeekAvg),
      changePercent,
      period,
    });
  }

  const days = 30;
  const from = new Date();
  from.setDate(from.getDate() - days);
  const list = await db
    .select({ id: skinAnalyses.id, score: skinAnalyses.score, createdAt: skinAnalyses.createdAt })
    .from(skinAnalyses)
    .where(and(eq(skinAnalyses.userId, req.userId), gte(skinAnalyses.createdAt, from)))
    .orderBy(desc(skinAnalyses.createdAt))
    .limit(200);
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

userRouter.get('/favorites', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const favs = await db
    .select()
    .from(postFavorites)
    .where(eq(postFavorites.userId, req.userId))
    .orderBy(desc(postFavorites.createdAt))
    .limit(100);
  const postIds = favs.map((f) => f.postId);
  if (postIds.length === 0) return res.json({ items: [] });
  const postList = await db
    .select()
    .from(posts)
    .where(and(eq(posts.status, 'approved'), inArray(posts.id, postIds)));
  const orderMap = new Map(postIds.map((id, i) => [id, i]));
  postList.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  const withAuthors = await Promise.all(
    postList.map(async (p: InferSelectModel<typeof posts>) => {
      const [u] = await db.select({ id: users.id, nickname: users.nickname, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, p.userId)).limit(1);
      return { ...p, author: u };
    })
  );
  return res.json({ items: withAuthors });
});

userRouter.get('/activity', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const userComments = await db
    .select({ postId: comments.postId, createdAt: comments.createdAt })
    .from(comments)
    .where(eq(comments.userId, req.userId))
    .orderBy(desc(comments.createdAt))
    .limit(200);
  const seen = new Set<string>();
  const orderedPostIds = userComments.filter((c) => {
    if (seen.has(c.postId)) return false;
    seen.add(c.postId);
    return true;
  }).map((c) => c.postId);
  if (orderedPostIds.length === 0) return res.json({ items: [] });
  const postList = await db
    .select()
    .from(posts)
    .where(and(eq(posts.status, 'approved'), inArray(posts.id, orderedPostIds)));
  postList.sort((a, b) => orderedPostIds.indexOf(a.id) - orderedPostIds.indexOf(b.id));
  const withAuthors = await Promise.all(
    postList.map(async (p: InferSelectModel<typeof posts>) => {
      const [u] = await db.select({ id: users.id, nickname: users.nickname, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, p.userId)).limit(1);
      return { ...p, author: u };
    })
  );
  return res.json({ items: withAuthors });
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
  await db.delete(postShares).where(eq(postShares.userId, req.userId));
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
