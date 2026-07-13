import { SiteNav } from "@/components/public/SiteNav";
import { SiteFooter } from "@/components/public/SiteFooter";
import { requireOnboarded } from "@/lib/auth/guards";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarded();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteNav />
      <main className="flex-1 flex flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
