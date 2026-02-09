-- Add view_count to posts
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "view_count" integer DEFAULT 0 NOT NULL;

-- Add parent_id and image_url to comments for replies
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "parent_id" uuid REFERENCES "comments"("id") ON DELETE CASCADE;
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "image_url" text;
