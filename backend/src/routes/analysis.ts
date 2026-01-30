import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { skinAnalyses } from '../db/schema';
import { eq, and, desc, lt } from 'drizzle-orm';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getImagePath, saveBuffer } from '../lib/storage';

export const analysisRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

analysisRouter.post('/upload', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const file = req.file;
  if (!file) return res.status(400).json(apiError(ERROR_CODES.ANALYSIS.IMAGE_TOO_SMALL, 'No image file'));
  const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
  const imagePath = getImagePath(req.userId, ext);
  await saveBuffer(imagePath, file.buffer);
  const mockResult = {
    skinType: 'combination' as const,
    skinTone: 'neutral' as const,
    faceShape: 'oval',
    issues: [{ type: 'dark_circles', label: '黑眼圈', severity: 1 as const }],
    makeupState: 'none',
    makeupStyles: [
      { id: '1', name: '日常', steps: ['保湿打底', '轻透底妆', '自然眉'] },
      { id: '2', name: '职场', steps: ['遮瑕', '哑光底妆', '大地色眼影'] },
      { id: '3', name: '约会', steps: ['提亮', '轻薄底妆', '粉色系眼唇'] },
    ],
    skincareRoutine: { morning: ['洁面', '爽肤水', '精华', '乳液', '防晒'], evening: ['卸妆', '洁面', '爽肤水', '精华', '面霜'], weekly: ['面膜'] },
    productRecommendations: [],
    score: 82,
  };
  const [row] = await db
    .insert(skinAnalyses)
    .values({
      userId: req.userId,
      imagePath,
      resultJson: mockResult as unknown as Record<string, unknown>,
      score: mockResult.score,
    })
    .returning();
  return res.status(201).json({ analysisId: row.id });
});

analysisRouter.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const limit = Math.min(parseInt(String(req.query.limit ?? 20), 10) || 20, 100);
  const cursor = req.query.cursor as string | undefined;
  const conditions = cursor
    ? and(eq(skinAnalyses.userId, req.userId), lt(skinAnalyses.id, cursor))
    : eq(skinAnalyses.userId, req.userId);
  const list = await db
    .select()
    .from(skinAnalyses)
    .where(conditions)
    .orderBy(desc(skinAnalyses.createdAt))
    .limit(limit + 1);
  const hasMore = list.length > limit;
  const items = hasMore ? list.slice(0, limit) : list;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;
  return res.json({ items, nextCursor, hasMore });
});

analysisRouter.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const id = req.params.id;
  const [row] = await db.select().from(skinAnalyses).where(and(eq(skinAnalyses.id, id), eq(skinAnalyses.userId, req.userId))).limit(1);
  if (!row) return res.status(404).json(apiError(ERROR_CODES.ANALYSIS.NOT_FOUND, 'Analysis not found'));
  return res.json({
    id: row.id,
    imagePath: row.imagePath,
    thumbnailPath: row.thumbnailPath,
    result: row.resultJson,
    score: row.score,
    createdAt: row.createdAt,
  });
});
