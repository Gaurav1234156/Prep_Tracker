import Link from "next/link";

import { AssessmentFeedbackCreateForm } from "@/components/admin/AssessmentFeedbackCreateForm";
import { Button } from "@/components/ui/button";
import { requireAdminOrPanelist } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Assessment Report | Admin" };

export default async function NewAssessmentReportPage() {
  await requireAdminOrPanelist();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight font-display">
          New assessment report
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose the student, attach the Topin report URL, then generate AI
          analysis on the next screen.
        </p>
      </header>

      <AssessmentFeedbackCreateForm />

      <Button variant="outline" render={<Link href="/admin/assessment-reports" />}>
        Back to list
      </Button>
    </div>
  );
}
