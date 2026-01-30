import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { posts, comments, postLikes, postFavorites, postTags, tags, users } from '../db/schema';
import { eq, and, desc, lt } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';

export const communityRouter = Router();

const createPostSchema = z.object({
  title: z.string().min(1).max(256),
  content: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  section: z.string().max(32).optional(),
  tagNames: z.array(z.string().max(64)).optional(),
});

communityRouter.get('/posts', optionalAuth, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? 20), 10) || 20, 100);
  const cursor = req.query.cursor as string | undefined;
  const section = req.query.section as string | undefined;
  const sort = (req.query.sort as string) ?? 'recent';
  let orderClause = desc(posts.createdAt);
  if (sort === 'hot') orderClause = desc(posts.likeCount);
  const conditions = section ? and(eq(posts.section, section), eq(posts.status, 'approved')) : eq(posts.status, 'approved');
  const cursorCondition = cursor ? and(conditions, lt(posts.createdAt, new Date(cursor))) : conditions;
  const list = await db.select().from(posts).where(cursorCondition).orderBy(orderClause).limit(limit + 1);
  const hasMore = list.length > limit;
  const items = hasMore ? list.slice(0, limit) : list;
  const nextCursor = hasMore ? items[items.length - 1]?.createdAt?.toISOString() ?? null : null;
  const withAuthors = await Promise.all(
    items.map(async (p: InferSelectModel<typeof posts>) => {
      const [u] = await db.select({ id: users.id, nickname: users.nickname, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, p.userId)).limit(1);
      return { ...p, author: u };
    })
  );
  return res.json({ items: withAuthors, nextCursor, hasMore });
});

communityRouter.get('/posts/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const [post] = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.status, 'approved'))).limit(1);
  if (!post) return res.status(404).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Post not found'));
  const [author] = await db.select().from(users).where(eq(users.id, post.userId)).limit(1);
  const liked = req.userId ? (await db.select().from(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, req.userId))).limit(1)).length > 0 : false;
  const favorited = req.userId ? (await db.select().from(postFavorites).where(and(eq(postFavorites.postId, id), eq(postFavorites.userId, req.userId))).limit(1)).length > 0 : false;
  const commentList = await db.select().from(comments).where(eq(comments.postId, id)).orderBy(desc(comments.createdAt)).limit(50);
  return res.json({ ...post, author, liked, favorited, comments: commentList });
});

communityRouter.post('/posts', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  try {
    const body = createPostSchema.parse(req.body);
    const status = 'pending';
    const [post] = await db
      .insert(posts)
      .values({
        userId: req.userId,
        title: body.title,
        content: body.content ?? null,
        imageUrls: body.imageUrls ?? [],
        section: body.section ?? null,
        status,
      })
      .returning();
    if (!post) throw new Error('Insert failed');
    if (body.tagNames?.length) {
      for (const name of body.tagNames) {
        let [tag] = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
        if (!tag) {
          [tag] = await db.insert(tags).values({ name }).returning();
        }
        if (tag) {
          try {
            await db.insert(postTags).values({ postId: post.id, tagId: tag.id });
          } catch {
            // ignore duplicate
          }
        }
      }
    }
    return res.status(201).json(post);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'Validation failed', { errors: e.flatten() }));
    }
    throw e;
  }
});

communityRouter.post('/posts/:id/likes', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const id = req.params.id;
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return res.status(404).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Post not found'));
  const existing = await db.select().from(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, req.userId))).limit(1);
  if (existing.length) {
    await db.delete(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, req.userId)));
    await db.update(posts).set({ likeCount: Math.max(0, post.likeCount - 1), updatedAt: new Date() }).where(eq(posts.id, id));
    return res.json({ liked: false });
  }
  await db.insert(postLikes).values({ postId: id, userId: req.userId });
  await db.update(posts).set({ likeCount: post.likeCount + 1, updatedAt: new Date() }).where(eq(posts.id, id));
  return res.json({ liked: true });
});

communityRouter.post('/posts/:id/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const id = req.params.id;
  const content = String(req.body?.content ?? '').trim();
  if (!content) return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'content required'));
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return res.status(404).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Post not found'));
  const [comment] = await db.insert(comments).values({ postId: id, userId: req.userId, content }).returning();
  await db.update(posts).set({ commentCount: post.commentCount + 1, updatedAt: new Date() }).where(eq(posts.id, id));
  return res.status(201).json(comment);
});

communityRouter.post('/posts/:id/favorites', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const id = req.params.id;
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return res.status(404).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Post not found'));
  const existing = await db.select().from(postFavorites).where(and(eq(postFavorites.postId, id), eq(postFavorites.userId, req.userId))).limit(1);
  if (existing.length) {
    await db.delete(postFavorites).where(and(eq(postFavorites.postId, id), eq(postFavorites.userId, req.userId)));
    await db.update(posts).set({ favoriteCount: Math.max(0, post.favoriteCount - 1), updatedAt: new Date() }).where(eq(posts.id, id));
    return res.json({ favorited: false });
  }
  await db.insert(postFavorites).values({ postId: id, userId: req.userId });
  await db.update(posts).set({ favoriteCount: post.favoriteCount + 1, updatedAt: new Date() }).where(eq(posts.id, id));
  return res.json({ favorited: true });
});
