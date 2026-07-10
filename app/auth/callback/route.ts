import { NextRequest, NextResponse } from "next/server";

import { ensureDbUser } from "@/lib/auth/ensure-db-user";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url),
    );
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const dbUser = await ensureDbUser(authUser);

  // Force onboarding for new accounts.
  if (!dbUser.onboardedAt) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}
