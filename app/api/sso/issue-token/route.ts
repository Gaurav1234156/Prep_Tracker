import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { signExchangeToken } from "@/lib/auth/sso";

/**
 * Client Backend endpoint registered with the CCBP Forms/Accounts team.
 *
 * After a student authenticates on the Accounts login page, the Forms backend
 * calls this endpoint (server-to-server) with the student's CCBP `user_id` and
 * our shared API key. We return a short-lived `auth_token` that Forms appends
 * to our Redirection URL as a query param; /sso/callback then validates it.
 */

const bodySchema = z.object({
  user_id: z.union([z.string(), z.number()]).transform(String),
});

export async function POST(req: NextRequest) {
  const expectedKey = process.env.SSO_CLIENT_API_KEY;
  if (!expectedKey) {
    console.error("[sso/issue-token] SSO_CLIENT_API_KEY is not configured.");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  if (req.headers.get("x-api-key") !== expectedKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "user_id is required" },
      { status: 400 },
    );
  }

  const authToken = await signExchangeToken(parsed.data.user_id);
  return NextResponse.json({ auth_token: authToken });
}
