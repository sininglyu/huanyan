/**
 * Seed approved sample discussions for the community.
 * Run: npx tsx src/scripts/seed-community.ts
 * Uses the first user in DB as author; if no users exist, skips.
 */
import 'dotenv/config';
import { db } from '../db';
import { users, posts } from '../db/schema';
import { eq } from 'drizzle-orm';

const SAMPLE_POSTS = [
  { title: 'SPF 50 防晒真的有区别吗？', content: '大家平时都用多少倍的防晒？SPF50和30差别大吗？想听听真实使用感受。' },
  { title: '评测：Bloom 推出的新款玻尿酸精华', content: '刚入手了Bloom新出的玻尿酸精华，用了一周来分享一下质地和保湿效果。' },
  { title: '维C和视黄醇可以混合使用吗？', content: '早C晚A已经坚持半年了，想问问大家维C和视黄醇能不能同一天用？' },
  { title: '油皮夏日护肤流程分享', content: '作为大油皮，夏天精简到三步：洁面、爽肤水、乳液。大家呢？' },
  { title: '敏感肌换季维稳心得', content: '换季容易泛红，最近用修护精华+厚涂面霜，稳定很多。' },
];

async function main() {
  const [firstUser] = await db.select().from(users).limit(1);
  if (!firstUser) {
    console.log('No users in DB; skip community seed.');
    return;
  }
  const allPosts = await db.select().from(posts);
  if (allPosts.length >= SAMPLE_POSTS.length) {
    console.log('Community already has posts; skip seed.');
    return;
  }
  for (const p of SAMPLE_POSTS) {
    await db.insert(posts).values({
      userId: firstUser.id,
      title: p.title,
      content: p.content,
      status: 'approved',
      reviewedAt: new Date(),
    });
  }
  console.log(`Seeded ${SAMPLE_POSTS.length} sample discussions.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
