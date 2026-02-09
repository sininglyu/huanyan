import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  timestamp,
  date,
  jsonb,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core';
import type { PrimaryKeyBuilder } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  logtoUserId: varchar('logto_user_id', { length: 128 }).unique(), // Logto sub claim
  phone: varchar('phone', { length: 20 }).unique(),
  openId: varchar('open_id', { length: 128 }).unique(),
  email: varchar('email', { length: 256 }).unique(), // User's email from Logto
  nickname: varchar('nickname', { length: 64 }).notNull(),
  avatarUrl: text('avatar_url'),
  gender: varchar('gender', { length: 20 }),
  age: smallint('age'),
  level: smallint('level').default(1).notNull(),
  followersCount: integer('followers_count').default(0).notNull(),
  totalLikesReceived: integer('total_likes_received').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  lastCheckinAt: timestamp('last_checkin_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const skinAnalyses = pgTable('skin_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  imagePath: text('image_path').notNull(),
  thumbnailPath: text('thumbnail_path'),
  resultJson: jsonb('result_json'),
  score: smallint('score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content'),
  imageUrls: jsonb('image_urls').$type<string[]>(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  section: varchar('section', { length: 32 }),
  likeCount: integer('like_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  favoriteCount: integer('favorite_count').default(0).notNull(),
  shareCount: integer('share_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (commentsTable) => [
    foreignKey({
      columns: [commentsTable.parentId],
      foreignColumns: [commentsTable.id],
    }).onDelete('cascade'),
  ]
);

export const postLikes = pgTable(
  'post_likes',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t): PrimaryKeyBuilder[] => [primaryKey({ columns: [t.postId, t.userId] })]
);

export const postFavorites = pgTable(
  'post_favorites',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t): PrimaryKeyBuilder[] => [primaryKey({ columns: [t.postId, t.userId] })]
);

export const postShares = pgTable('post_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 64 }).unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const postTags = pgTable(
  'post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t): PrimaryKeyBuilder[] => [primaryKey({ columns: [t.postId, t.tagId] })]
);

export const checkins = pgTable('checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  checkinDate: date('checkin_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  tier: varchar('tier', { length: 20 }).notNull(),
  category: varchar('category', { length: 64 }),
  imageUrl: text('image_url'),
  externalUrl: text('external_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tryonResults = pgTable('tryon_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  originalImagePath: text('original_image_path').notNull(),
  resultImagePath: text('result_image_path').notNull(),
  makeupParams: jsonb('makeup_params').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
