import { SiteNav } from "@/components/public/SiteNav";
import { SiteFooter } from "@/components/public/SiteFooter";
import { requireOnboarded } from "@/lib/auth/guards";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarded();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
