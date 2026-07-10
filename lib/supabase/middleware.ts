import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/safe-next-path";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser.
  // A simple mistake here can cause logged-in users to be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/admin");
  const isAuthPage = path === "/login" || path === "/signup";

  // Logged-in users on auth pages → honor ?next= when present.
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = safeNextPath(url.searchParams.get("next"));
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Anonymous users on /admin/* → bounce to /login with ?next=
  if (!user && isAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Surface current path to server components via header so requireUser()
  // can build a ?next= redirect.
  supabaseResponse.headers.set("x-pathname", path);
  return supabaseResponse;
}
