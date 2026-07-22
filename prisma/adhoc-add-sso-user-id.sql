-- Additive, non-destructive: add nullable ssoUserId column + unique index.
-- Applied directly (not via `prisma migrate dev`) because the live DB has
-- pre-existing drift and `migrate dev` would require a destructive reset.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ssoUserId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_ssoUserId_key" ON "User" ("ssoUserId");
