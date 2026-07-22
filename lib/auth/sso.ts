import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe CCBP SSO token primitives (pure `jose`, no `next/headers`).
 *
 * Two token shapes, both HMAC-signed with SSO_TOKEN_SECRET:
 *  - exchange token ("auth_token"): short-lived, minted by our Client Backend
 *    endpoint for a CCBP user_id, verified once on the /sso/callback landing.
 *  - session token: longer-lived, stored in the httpOnly `sso_session` cookie,
 *    carries our own Prisma User id.
 *
 * Cookie read/write helpers live in `sso-session.ts` (they need `next/headers`
 * and therefore run in Node contexts only).
 */

export const SSO_SESSION_COOKIE = "sso_session";
export const SSO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const ALG = "HS256";
const EXCHANGE_TTL = "5m";
const SESSION_TTL = "30d";
const EXCHANGE_PURPOSE = "sso-exchange";
const SESSION_TYPE = "sso";

function getSecret(): Uint8Array {
  const secret = process.env.SSO_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SSO_TOKEN_SECRET must be set and at least 32 characters long.",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Mint the short-lived `auth_token` for a CCBP user_id. */
export async function signExchangeToken(ccbpUserId: string): Promise<string> {
  return new SignJWT({ purpose: EXCHANGE_PURPOSE })
    .setProtectedHeader({ alg: ALG })
    .setSubject(ccbpUserId)
    .setIssuedAt()
    .setExpirationTime(EXCHANGE_TTL)
    .sign(getSecret());
}

/** Verify an `auth_token`; returns the CCBP user_id or null. */
export async function verifyExchangeToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== EXCHANGE_PURPOSE) return null;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Mint the app session token carrying our Prisma User id. */
export async function signSessionToken(userId: string): Promise<string> {
  return new SignJWT({ typ: SESSION_TYPE })
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

/** Verify an app session token; returns the Prisma User id or null. */
export async function verifySessionToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.typ !== SESSION_TYPE) return null;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
