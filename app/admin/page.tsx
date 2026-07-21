import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import {
  FileText,
  Layers,
  Tag,
  Activity,
  BarChart3,
  Flag,
  Upload,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "Admin | Interview Experience Platform",
};

export const dynamic = "force-dynamic";

type Tile = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  metric?: string;
};

export default async function AdminPage() {
  const user = await requireAdminOrPanelist();

  const [interviewCount, topicAreaCount, subTopicCount, pendingImportsCount] =
    await Promise.all([
      prisma.interview.count(),
      prisma.topicArea.count(),
      prisma.subTopic.count(),
      prisma.importRow.count({
        where: { status: { in: ["READY_FOR_REVIEW", "FAILED"] } },
      }),
    ]);

  const tiles: Tile[] = [
    {
      title: "Interviews",
      description: "Create, edit, and review collected interview experiences.",
      href: "/admin/interviews",
      icon: FileText,
      metric: `${interviewCount} total`,
    },
    {
      title: "Bulk Import",
      description: "Upload a CSV and let the AI extract structured interview data for review.",
      href: "/admin/imports",
      icon: Upload,
      metric:
        pendingImportsCount > 0
          ? `${pendingImportsCount} pending review`
          : undefined,
    },
    {
      title: "Analytics Hub",
      description: "Drill down into topic frequencies, company coverage heatmaps, and year-over-year trends.",
      href: "/admin/analytics",
      icon: BarChart3,
      metric: "6 detailed reports",
    },
    {
      title: "Topic Areas",
      description: "Manage the 15 high-level categories used across the wizard.",
      href: "/admin/topic-areas",
      icon: Layers,
      metric: `${topicAreaCount} areas`,
    },
    {
      title: "Sub-Topics",
      description: "Manage individual sub-topics that roll up into each area.",
      href: "/admin/sub-topics",
      icon: Tag,
      metric: `${subTopicCount} sub-topics`,
    },
    {
      title: "Feature flags",
      description: "Toggle features on/off at runtime without redeploying.",
      href: "/admin/feature-flags",
      icon: Flag,
    },
    {
      title: "Diagnostics",
      description: "Verify every Prisma model is queryable and storage is reachable.",
      href: "/admin/db-check",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight font-display">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.email}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group block">
            <Card className="h-full border border-border bg-background transition-all hover:border-primary hover:shadow-sm hover:scale-[1.01] duration-200 cursor-pointer p-4 gap-3">
              <CardHeader className="flex flex-row items-center gap-3 pb-1">
                <div className="rounded-[6px] bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <tile.icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-bold text-foreground font-display">{tile.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tile.description}
                </p>
                {tile.metric && (
                  <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-[6px] w-fit">
                    {tile.metric}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
