import Link from "next/link";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

import { HeaderSearch } from "./HeaderSearch";
import { UserMenu } from "./UserMenu";

export async function SiteNav() {
  const user = await getCurrentDbUser();
  const bookmarkCount = user
    ? await prisma.bookmark.count({ where: { userId: user.id } })
    : 0;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Glass surface: translucent white + heavy blur + saturation boost.
          The saturate-150 is the real glass-effect trick — it makes content
          showing through the bar look richer instead of washed-out. */}
      <div className="border-b border-border/60 bg-background-elevated/70 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_4px_16px_-8px_rgba(15,23,42,0.06)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-7">
              {/* Logo mark — gradient tile + subtle inner highlight + soft shadow */}
              <Link
                href="/"
                className="group flex items-center gap-2.5"
                aria-label="PrepIntel home"
              >
                <span
                  className="relative flex size-8 items-center justify-center rounded-lg text-[15px] font-semibold text-white shadow-[0_2px_8px_-2px_rgba(79,70,229,0.5)] ring-1 ring-white/10 transition-transform duration-150 group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(234 89% 60%) 0%, hsl(258 78% 50%) 100%)",
                  }}
                >
                  {/* Inner highlight for glassy logo */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-white/30 to-transparent"
                  />
                  <span className="relative">i</span>
                </span>
                <span className="font-semibold tracking-tight text-foreground">
                  Prep<span className="text-brand">Intel</span>
                </span>
              </Link>

              <nav className="hidden items-center gap-1 text-sm md:flex">
                <Link
                  href="/companies"
                  className="rounded-md px-3 py-1.5 text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                >
                  Companies
                </Link>
                <Link
                  href="/topic-areas"
                  className="rounded-md px-3 py-1.5 text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                >
                  Topics
                </Link>
              </nav>
            </div>

            <div className="hidden flex-1 justify-center sm:flex sm:max-w-md">
              <HeaderSearch />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                render={<Link href="/experiences/new" />}
              >
                Share experience
              </Button>
              {user ? (
                <UserMenu
                  email={user.email}
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  role={user.role}
                  bookmarkCount={bookmarkCount}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href="/login" />}
                  >
                    Sign in
                  </Button>
                  <Button size="sm" render={<Link href="/signup" />}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
