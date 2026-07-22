import { cookies } from "next/headers";

import { SSO_SESSION_COOKIE, verifySessionToken } from "./sso";

/**
 * Cookie read/clear helpers for Node contexts (server components + actions).
 * The session cookie is *written* directly on the response in the /sso/callback
 * route handler; middleware reads it straight off the request.
 */

/** Remove the SSO session cookie (used on sign-out). */
export async function clearSsoSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SSO_SESSION_COOKIE);
}

/** Read + verify the SSO session cookie; returns the Prisma User id or null. */
export async function getSsoUserIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SSO_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
