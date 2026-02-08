-- Add share_count to posts and create post_shares table
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "share_count" integer DEFAULT 0 NOT NULL;
CREATE TABLE IF NOT EXISTS "post_shares" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
