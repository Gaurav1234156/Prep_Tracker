import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { User, UserRole } from "@prisma/client";

import { ensureDbUser } from "@/lib/auth/ensure-db-user";
import { getSsoUserIdFromCookie } from "@/lib/auth/sso-session";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// Memoized per request: multiple callers in one render share a single
// auth check + user lookup instead of repeating the round-trips.
export const getCurrentDbUser = cache(
  async (): Promise<User | null> => {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    // CCBP SSO students have no Supabase session — fall back to our own
    // signed session cookie, which carries the Prisma User id directly.
    if (!authUser?.email) {
      const ssoUserId = await getSsoUserIdFromCookie();
      if (!ssoUserId) return null;
      return prisma.user.findUnique({ where: { id: ssoUserId } });
    }

    const existing = await prisma.user.findUnique({
      where: { email: authUser.email },
    });
    if (existing) return existing;

    try {
      return await ensureDbUser(authUser);
    } catch {
      return await prisma.user.findUnique({
        where: { email: authUser.email },
      });
    }
  },
);

/** Alias matching Step 7 spec naming. */
export const getCurrentUser = getCurrentDbUser;

export async function requireSignedIn(): Promise<User> {
  const user = await getCurrentDbUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** API routes: returns the current user or null (caller responds with 401). */
export async function getApiUser(): Promise<User | null> {
  return getCurrentDbUser();
}

/**
 * Server-component-friendly: redirects unauthenticated visitors to /login,
 * preserving the current path as `?next=` so we can return them after sign-in.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentDbUser();
  if (!user) {
    const hdrs = await headers();
    const path = hdrs.get("x-pathname") ?? "/";
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  return user;
}

/** Same as requireUser but additionally forces /onboarding for incomplete profiles. */
export async function requireOnboarded(): Promise<User> {
  const user = await requireUser();
  if (!user.onboardedAt) {
    redirect("/onboarding");
  }
  return user;
}

export async function requireAdminOrPanelist(): Promise<User> {
  const user = await requireSignedIn();
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.PANELIST) {
    throw new ForbiddenError(
      "Only admins and panelists can perform this action.",
    );
  }
  return user;
}
