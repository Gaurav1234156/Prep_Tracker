import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentFeedbackEditor } from "@/components/admin/AssessmentFeedbackEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assessment Report | Admin" };

export default async function AssessmentReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminOrPanelist();
  const { id } = await params;

  const report = await prisma.assessmentFeedback.findUnique({
    where: { id },
    include: {
      student: { select: { email: true, name: true } },
    },
  });

  if (!report) notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight font-display">
            {report.companyName} · {report.role}
          </h1>
          <Badge variant={report.status === "SENT" ? "default" : "secondary"}>
            {report.status === "SENT" ? "Sent" : "Draft"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Student:{" "}
          {report.student.name ? `${report.student.name} · ` : ""}
          {report.student.email}
        </p>
      </header>

      <AssessmentFeedbackEditor
        id={report.id}
        reportUrl={report.reportUrl}
        initialNotes={report.reportNotes}
        initialStrengths={report.strengths}
        initialWeaknesses={report.weaknesses}
        initialSummary={report.summary}
        status={report.status}
      />

      <Button variant="outline" render={<Link href="/admin/assessment-reports" />}>
        Back to list
      </Button>
    </div>
  );
}
