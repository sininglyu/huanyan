-- Add gender and age to users table for profile edit
ALTER TABLE "users" ADD COLUMN "gender" varchar(20);
ALTER TABLE "users" ADD COLUMN "age" smallint;
