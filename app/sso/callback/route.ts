import { NextRequest, NextResponse } from "next/server";

import { ensureSsoUser } from "@/lib/auth/ensure-db-user";
import {
  SSO_SESSION_COOKIE,
  SSO_SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifyExchangeToken,
} from "@/lib/auth/sso";

/**
 * SSO landing / Redirection URL registered with the CCBP Forms team.
 *
 * The student arrives here after Accounts login with `?auth_token=...`. We
 * verify the token (signature + expiry), resolve/create the Prisma User by
 * their CCBP userId, mint our own app session cookie, and drop them into the
 * app (onboarding for new accounts, otherwise the dashboard).
 */
export async function GET(req: NextRequest) {
  const authToken = req.nextUrl.searchParams.get("auth_token");

  if (!authToken) {
    return redirectWithError(req, "Missing SSO token.");
  }

  const ccbpUserId = await verifyExchangeToken(authToken);
  if (!ccbpUserId) {
    return redirectWithError(req, "Invalid or expired SSO token.");
  }

  const user = await ensureSsoUser(ccbpUserId);
  const sessionToken = await signSessionToken(user.id);

  const destination = user.onboardedAt ? "/dashboard" : "/onboarding";
  const res = NextResponse.redirect(new URL(destination, req.url));
  res.cookies.set(SSO_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SSO_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}

function redirectWithError(req: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(message)}`, req.url),
  );
}
