import { Router, Request, Response } from 'express';
import { db } from '../db';
import { products, posts } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { optionalAuth, AuthRequest } from '../middleware/auth';

export const recommendRouter = Router();

recommendRouter.get('/tutorials', optionalAuth, async (_req: AuthRequest, res: Response) => {
  const items = [
    { id: '1', title: '新人护肤第一课', description: '避开测肤常见的3个误区', imageUrl: null },
    { id: '2', title: '日常护肤步骤', description: '早晚流程与周期护理', imageUrl: null },
  ];
  return res.json({ items });
});

recommendRouter.get('/products', optionalAuth, async (req: Request, res: Response) => {
  const tier = (req.query.tier as string) ?? 'all';
  let list = await db.select().from(products).orderBy(desc(products.createdAt)).limit(50);
  if (tier !== 'all') {
    list = list.filter((p: InferSelectModel<typeof products>) => p.tier === tier);
  }
  return res.json({ items: list });
});

recommendRouter.get('/feed', optionalAuth, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? 20), 10) || 20, 100);
  const list = await db.select().from(posts).where(eq(posts.status, 'approved')).orderBy(desc(posts.createdAt)).limit(limit);
  return res.json({ items: list });
});
