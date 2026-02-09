import { Router, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db } from '../db';
import { posts, comments, postLikes, postFavorites, postShares, postTags, tags, users } from '../db/schema';
import { eq, and, desc, lt, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { apiError, ERROR_CODES } from '../lib/errors';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';
import { saveBuffer, getPublicUrl } from '../lib/storage';

export const communityRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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
  const q = (req.query.q as string)?.trim().slice(0, 100);
  const sort = (req.query.sort as string) ?? 'recent';
  let orderClause = desc(posts.createdAt);
  if (sort === 'hot') orderClause = desc(posts.likeCount);
  let conditions = section ? and(eq(posts.section, section), eq(posts.status, 'approved')) : eq(posts.status, 'approved');
  if (q) conditions = and(conditions, sql`${posts.title} ilike ${'%' + q + '%'}`);
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

function excerptAround(content: string | null, keyword: string, maxLen: number): string {
  if (!content || !keyword) return (content ?? '').slice(0, maxLen);
  const lower = content.toLowerCase();
  const k = keyword.toLowerCase();
  const idx = lower.indexOf(k);
  if (idx === -1) return content.slice(0, maxLen);
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + keyword.length + 80);
  const snippet = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '');
  return snippet;
}

function relevancePercent(post: { title: string | null; content: string | null }, keyword: string): number {
  if (!keyword.trim()) return 0;
  const k = keyword.toLowerCase().trim();
  const titleMatch = (post.title ?? '').toLowerCase().includes(k);
  const contentMatch = (post.content ?? '').toLowerCase().includes(k);
  if (titleMatch && contentMatch) return 90 + Math.min(10, k.length);
  if (titleMatch) return 85 + Math.min(15, k.length * 2);
  if (contentMatch) return 60 + Math.min(20, k.length * 3);
  return 0;
}

communityRouter.get('/search', optionalAuth, async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string)?.trim().slice(0, 100);
  const limit = Math.min(parseInt(String(req.query.limit ?? 20), 10) || 20, 50);
  if (!q) return res.json({ items: [], total: 0 });
  const conditions = and(eq(posts.status, 'approved'), sql`(${posts.title} ilike ${'%' + q + '%'} OR ${posts.content} ilike ${'%' + q + '%'})`);
  const list = await db.select().from(posts).where(conditions).orderBy(desc(posts.createdAt)).limit(limit * 2);
  const withRelevance = list
    .map((p) => ({ post: p, relevancePercent: relevancePercent(p, q) }))
    .filter((x) => x.relevancePercent > 0)
    .sort((a, b) => b.relevancePercent - a.relevancePercent)
    .slice(0, limit);
  const withAuthorsAndExcerpt = await Promise.all(
    withRelevance.map(async ({ post, relevancePercent: rel }) => {
      const [u] = await db.select({ id: users.id, nickname: users.nickname, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, post.userId)).limit(1);
      const excerpt = excerptAround(post.content, q, 160);
      return {
        id: post.id,
        title: post.title,
        excerpt,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        viewCount: post.viewCount ?? 0,
        createdAt: post.createdAt,
        author: u,
        relevancePercent: rel,
      };
    })
  );
  return res.json({ items: withAuthorsAndExcerpt, total: withAuthorsAndExcerpt.length });
});

communityRouter.get('/posts/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const [post] = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.status, 'approved'))).limit(1);
  if (!post) return res.status(404).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Post not found'));
  await db.update(posts).set({ viewCount: (post.viewCount ?? 0) + 1, updatedAt: new Date() }).where(eq(posts.id, id));
  const [author] = await db.select().from(users).where(eq(users.id, post.userId)).limit(1);
  const liked = req.userId ? (await db.select().from(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, req.userId))).limit(1)).length > 0 : false;
  const favorited = req.userId ? (await db.select().from(postFavorites).where(and(eq(postFavorites.postId, id), eq(postFavorites.userId, req.userId))).limit(1)).length > 0 : false;
  const tagRows = await db.select({ name: tags.name }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(postTags.postId, id));
  const tagNames = tagRows.map((r) => r.name);
  const commentRows = await db.select().from(comments).where(eq(comments.postId, id)).orderBy(comments.createdAt).limit(100);
  const commentAuthors = await Promise.all(
    commentRows.map(async (c) => {
      const [u] = await db.select({ id: users.id, nickname: users.nickname, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, c.userId)).limit(1);
      return { ...c, author: u };
    })
  );
  const postWithView = { ...post, viewCount: (post.viewCount ?? 0) + 1 };
  return res.json({ ...postWithView, author, liked, favorited, tags: tagNames, comments: commentAuthors });
});

communityRouter.post('/upload-image', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const file = req.file;
  if (!file) return res.status(400).json(apiError(ERROR_CODES.VALIDATION, 'No image file'));
  const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
  const imagePath = `user_${req.userId}/posts/${Date.now()}${ext}`;
  await saveBuffer(imagePath, file.buffer);
  const url = getPublicUrl(imagePath);
  return res.json({ url });
});

communityRouter.post('/posts', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  try {
    const body = createPostSchema.parse(req.body);
    const status = 'approved';
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
  const parentId = (req.body?.parentId as string) || null;
  const imageUrl = (req.body?.imageUrl as string) || null;
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return res.status(404).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Post not found'));
  const returningResult = await db.insert(comments).values({ postId: id, userId: req.userId, content, parentId: parentId || undefined, imageUrl: imageUrl || undefined }).returning();
  const comment = Array.isArray(returningResult) ? returningResult[0] : undefined;
  if (!comment) return res.status(500).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Failed to create comment'));
  await db.update(posts).set({ commentCount: post.commentCount + 1, updatedAt: new Date() }).where(eq(posts.id, id));
  const [author] = await db.select({ id: users.id, nickname: users.nickname, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, req.userId)).limit(1);
  return res.status(201).json({ ...comment, author: author ?? undefined });
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

communityRouter.post('/posts/:id/share', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Unauthorized'));
  const id = req.params.id;
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return res.status(404).json(apiError(ERROR_CODES.COMMUNITY.NOT_FOUND, 'Post not found'));
  await db.insert(postShares).values({ postId: id, userId: req.userId });
  await db.update(posts).set({ shareCount: (post.shareCount ?? 0) + 1, updatedAt: new Date() }).where(eq(posts.id, id));
  return res.json({ shared: true });
});
