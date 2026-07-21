import type { Metadata } from "next";

import { AssessmentResultView } from "@/components/public/AssessmentResultView";

export const metadata: Metadata = {
  title: "Assessment Result — PrepIntel",
  robots: { index: false, follow: false },
};

export default function AssessmentResultPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Assessment Result
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
          An AI-generated breakdown of your strengths, weaknesses, and
          recommended next steps.
        </p>
      </div>

      <AssessmentResultView />
    </div>
  );
}
