-- Add logto_user_id and email columns to users table for Logto authentication
ALTER TABLE "users" ADD COLUMN "logto_user_id" varchar(128) UNIQUE;
ALTER TABLE "users" ADD COLUMN "email" varchar(256) UNIQUE;
