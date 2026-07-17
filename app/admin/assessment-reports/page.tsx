import Link from "next/link";
import { Plus } from "lucide-react";
import { AssessmentFeedbackStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assessment Reports | Admin" };

export default async function AssessmentReportsPage() {
  await requireAdminOrPanelist();

  const reports = await prisma.assessmentFeedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { email: true, name: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight font-display">
            Assessment Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload Topin report URLs, generate AI feedback, and send to a
            student&apos;s profile.
          </p>
        </div>
        <Button render={<Link href="/admin/assessment-reports/new" />} className="gap-2">
          <Plus className="h-4 w-4" />
          New report
        </Button>
      </header>

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No assessment reports yet. Create one to get started.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/admin/assessment-reports/${report.id}`}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {report.companyName} · {report.role}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {report.student.name
                      ? `${report.student.name} · `
                      : ""}
                    {report.student.email}
                  </p>
                </div>
                <Badge
                  variant={
                    report.status === AssessmentFeedbackStatus.SENT
                      ? "default"
                      : "secondary"
                  }
                >
                  {report.status === AssessmentFeedbackStatus.SENT
                    ? "Sent"
                    : "Draft"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
