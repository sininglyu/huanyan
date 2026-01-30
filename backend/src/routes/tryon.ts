import { Router, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { tryonResults } from '../db/schema';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getImagePath, saveBuffer } from '../lib/storage';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const tryonRouter = Router();

tryonRouter.post('/preview', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
  const file = req.file;
  if (!file) return res.status(400).json({ error: { code: 'VALIDATION', message: 'No image' } });
  const style = (req.body?.style as string) ?? 'natural';
  const intensity = (req.body?.intensity as string) ?? '0.5';
  const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
  const originalPath = getImagePath(req.userId, `_original${ext}`);
  const resultPath = getImagePath(req.userId, `_tryon${ext}`);
  await saveBuffer(originalPath, file.buffer);
  await saveBuffer(resultPath, file.buffer);
  const [row] = await db
    .insert(tryonResults)
    .values({
      userId: req.userId,
      originalImagePath: originalPath,
      resultImagePath: resultPath,
      makeupParams: { style, intensity },
    })
    .returning();
  return res.status(201).json({
    tryonId: row?.id,
    resultImagePath: resultPath,
    makeupParams: { style, intensity },
  });
});
