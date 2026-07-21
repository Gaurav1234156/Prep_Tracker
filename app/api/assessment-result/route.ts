import { NextResponse } from "next/server";

import { generateResultSummary } from "@/lib/assessment/generate-result-summary";
import {
  extractExamIdentifiers,
  fetchCandidateAttemptStats,
  fetchTagGroupDetails,
  ResultsNotAvailableError,
} from "@/lib/assessment/topin";

export async function GET() {
  try {
    const stats = await fetchCandidateAttemptStats();
    const { examId, examAttemptId } = extractExamIdentifiers(stats);
    const tagGroupAttempts = await fetchTagGroupDetails(examId, examAttemptId);

    const aiSummary = await generateResultSummary(stats, tagGroupAttempts);

    return NextResponse.json({
      userTotalScore: stats.user_total_score,
      assessmentTotalScore: stats.assessment_total_score,
      timeSpentInSeconds: stats.time_spent_in_seconds,
      ...aiSummary,
    });
  } catch (error) {
    if (error instanceof ResultsNotAvailableError) {
      console.warn("[assessment-result] not available:", error.message);
      return NextResponse.json(
        { error: "results_not_available", message: error.message },
        { status: 404 },
      );
    }

    console.error("[assessment-result] failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";
    const isConfigError = message.startsWith("Missing required environment variable");

    return NextResponse.json(
      {
        error: isConfigError ? "misconfigured" : "internal_error",
        message: isConfigError
          ? message
          : "Failed to generate assessment result. Please try again later.",
      },
      { status: isConfigError ? 500 : 502 },
    );
  }
}
