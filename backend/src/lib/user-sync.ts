import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface LogtoUserInfo {
  sub: string; // Logto user ID
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Find or create a local user based on Logto user ID (sub claim)
 * This syncs users from Logto to our local database
 */
export async function findOrCreateUserByLogtoId(logtoUserInfo: LogtoUserInfo): Promise<string> {
  const { sub, email, name, picture } = logtoUserInfo;

  // Try to find existing user by Logto user ID
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.logtoUserId, sub))
    .limit(1);

  if (existingUser) {
    return existingUser.id;
  }

  // Create new user
  const nickname = name || email?.split('@')[0] || `User_${sub.slice(0, 8)}`;
  
  const [newUser] = await db
    .insert(users)
    .values({
      logtoUserId: sub,
      email: email || null,
      nickname,
      avatarUrl: picture || null,
    })
    .returning({ id: users.id });

  console.log(`[UserSync] Created new user: ${newUser.id} for Logto user: ${sub}`);
  return newUser.id;
}

/**
 * Update user info from Logto (e.g., after profile changes)
 */
export async function updateUserFromLogto(localUserId: string, logtoUserInfo: LogtoUserInfo): Promise<void> {
  const { email, name, picture } = logtoUserInfo;

  const updateData: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (email) updateData.email = email;
  if (name) updateData.nickname = name;
  if (picture) updateData.avatarUrl = picture;

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, localUserId));
}
