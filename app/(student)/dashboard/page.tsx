import Link from "next/link";
import { Suspense } from "react";
import { Bookmark, Building2, Search, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireOnboarded } from "@/lib/auth/guards";
import { InterviewCard } from "@/components/public/InterviewCard";
import { CardGridSkeleton } from "@/components/loading/Skeletons";
import {
  FEATURE_FLAG_KEYS,
  isFeatureEnabled,
} from "@/lib/feature-flags";

import { RecentlyViewed } from "@/components/student/RecentlyViewed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const user = await requireOnboarded();

  const [bookmarks, bookmarksEnabled] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        interview: {
          include: {
            company: true,
            roleLevel: true,
            _count: { select: { rounds: true } },
          },
        },
      },
    }),
    isFeatureEnabled(FEATURE_FLAG_KEYS.STUDENT_BOOKMARKS),
  ]);

  const firstName = (user.name ?? user.email).split(" ")[0].split("@")[0];

  const tiles = [
    { title: "Browse companies", href: "/companies", icon: Building2 },
    { title: "Search topics", href: "/search", icon: Search },
    { title: "Manage profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <div>
      <header className="border-b border-border bg-brand-subtle">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-base text-foreground-muted">
            Here&apos;s what you&apos;ve saved and recently explored.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">

      {bookmarksEnabled ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Saved interviews
            </h2>
            <span className="text-sm text-muted-foreground">
              {bookmarks.length} {bookmarks.length === 1 ? "saved" : "saved"}
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Bookmark className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground max-w-md">
                You haven&apos;t bookmarked any interviews yet. Browse companies
                and bookmark experiences to save them here.
              </p>
              <Button render={<Link href="/companies" />}>
                Browse companies
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((b) => (
                <InterviewCard
                  key={b.interview.id}
                  interview={{
                    id: b.interview.id,
                    role: b.interview.role,
                    year: b.interview.year,
                    totalSelected: b.interview.totalSelected,
                    biggestTip: b.interview.biggestTip,
                    publishedAt: b.interview.publishedAt,
                    company: b.interview.company,
                    roleLevel: b.interview.roleLevel,
                    _count: b.interview._count,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <Suspense fallback={<CardGridSkeleton count={3} />}>
        <RecentlyViewed />
      </Suspense>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="flex items-center gap-3 rounded-lg border border-border bg-background-elevated p-4 transition-all hover:border-border-strong hover:shadow-sm"
            >
              <div className="rounded-md bg-brand-subtle p-2 text-brand">
                <tile.icon className="size-4" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {tile.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
