import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

function extractAuthProfile(authUser: SupabaseUser) {
  const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;
  const avatarUrl =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
        ? metadata.picture
        : null;
  return { name, avatarUrl };
}

/**
 * Ensure a Prisma User row exists for a CCBP SSO user, keyed by their unique
 * CCBP userId. Students authenticated via SSO have no email/password, so we
 * store a synthetic email to satisfy the required+unique `email` column while
 * `ssoUserId` remains the authoritative identifier.
 */
export async function ensureSsoUser(ccbpUserId: string): Promise<User> {
  const syntheticEmail = `${ccbpUserId}@ccbp-sso.local`;
  return prisma.user.upsert({
    where: { ssoUserId: ccbpUserId },
    update: {},
    create: {
      ssoUserId: ccbpUserId,
      email: syntheticEmail,
      role: "STUDENT",
    },
  });
}

/** Ensure a Prisma User row exists for the authenticated Supabase user. */
export async function ensureDbUser(authUser: SupabaseUser): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { email: authUser.email! },
  });
  if (existing) return existing;

  const { name, avatarUrl } = extractAuthProfile(authUser);
  try {
    return await prisma.user.create({
      data: {
        email: authUser.email!,
        name,
        avatarUrl,
        role: "STUDENT",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const raced = await prisma.user.findUnique({
        where: { email: authUser.email! },
      });
      if (raced) return raced;
    }
    throw error;
  }
}
