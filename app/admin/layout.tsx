import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signOut } from "@/app/_actions/auth";
import { getCurrentDbUser } from "@/lib/auth/guards";

// The admin area is authenticated and data-driven per request. Force dynamic
// rendering for the whole subtree so pages are never statically prerendered at
// build time (which would fail when the database is unreachable during build).
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN" && user.role !== "PANELIST") {
    // Students don't see the admin area.
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-5">
            <Link href="/admin" className="font-semibold">
              Interview Experience Platform
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View site
            </Link>
            <Link
              href="/admin/submissions"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Submissions
            </Link>
            <Link
              href="/admin/assessment-reports"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Assessment Reports
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{user.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
