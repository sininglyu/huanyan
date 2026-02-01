import { Router, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { skinAnalyses } from '../db/schema';
import { eq, and, desc, lt } from 'drizzle-orm';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getImagePath, saveBuffer } from '../lib/storage';
import { callAILabSkinAnalysis, AILabError } from '../lib/ailab';
import { transformToReport } from '../lib/skin-report-transformer';

export const analysisRouter = Router();

const AILAB_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

analysisRouter.post('/upload', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const file = req.file;
  if (!file) return res.status(400).json(apiError(ERROR_CODES.ANALYSIS.IMAGE_TOO_SMALL, 'No image file'));

  // AILab accepts JPG/JPEG only, max 2 MB
  if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
    return res.status(400).json(apiError(ERROR_CODES.ANALYSIS.IMAGE_TOO_SMALL, 'Please use JPG/JPEG format. PNG is not supported.'));
  }
  if (file.size > AILAB_MAX_SIZE) {
    return res.status(400).json(apiError(ERROR_CODES.ANALYSIS.IMAGE_TOO_SMALL, 'Image size must not exceed 2 MB'));
  }

  const ext = '.jpg';
  const imagePath = getImagePath(req.userId, ext);
  await saveBuffer(imagePath, file.buffer);

  let ailabResponse;
  try {
    ailabResponse = await callAILabSkinAnalysis(file.buffer);
  } catch (err) {
    if (err instanceof AILabError) {
      const status = err.errorCode === ERROR_CODES.ANALYSIS.NO_FACE_DETECTED ? 422 : 400;
      return res.status(status).json(apiError(err.errorCode, err.message));
    }
    throw err;
  }

  const report = transformToReport(ailabResponse.result!);

  const [row] = await db
    .insert(skinAnalyses)
    .values({
      userId: req.userId,
      imagePath,
      resultJson: report as unknown as Record<string, unknown>,
      score: report.score,
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
