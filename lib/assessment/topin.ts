import "server-only";

/**
 * Server-side client for the Topin/Nxtwave assessment backend. All calls
 * require `ASSESSMENT_API_KEY` and are never exposed to the browser — the
 * "Get Result" flow proxies through our own API route.
 */

export type SectionDetail = {
  title: string;
  section_type: string;
  attempt_status: string;
  user_score: number;
  section_total_score: number;
  time_spent_in_seconds: number;
  attempt_end_reason?: string;
  exam_id?: string;
  exam_attempt_id?: string;
  trait_details?: unknown[];
};

export type CandidateAttemptStats = {
  candidate_id: string;
  user_total_score: number;
  assessment_total_score: number;
  time_spent_in_seconds: number;
  report_link?: string;
  section_details: SectionDetail[];
  [key: string]: unknown;
};

export type TagGroupAttempt = {
  tag_group: string[];
  user_score: number;
  total_score: number;
  user_score_accuracy_percentage: number;
};

/** Thrown when the candidate has no attempted section to report on. */
export class ResultsNotAvailableError extends Error {
  constructor(message = "No attempted assessment section found for this candidate.") {
    super(message);
    this.name = "ResultsNotAvailableError";
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function devLog(label: string, data: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[assessment] ${label}:`, JSON.stringify(data, null, 2));
  }
}

async function postToTopin<T>(url: string, body: unknown): Promise<T> {
  const apiKey = requiredEnv("ASSESSMENT_API_KEY");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `Topin API ${url} responded ${res.status}: ${text.slice(0, 500)}`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Topin API ${url} returned non-JSON response.`);
  }
}

/**
 * Step 1 — fetch candidate attempt stats for the configured assessment.
 */
export async function fetchCandidateAttemptStats(): Promise<CandidateAttemptStats> {
  const statsUrl = requiredEnv("ASSESSMENT_STATS_URL");
  const assessmentId = requiredEnv("ASSESSMENT_ID");
  const candidateId = requiredEnv("CANDIDATE_ID");

  const data = await postToTopin<{
    candidate_attempt_stats: CandidateAttemptStats[];
  }>(statsUrl, {
    assessment_id: assessmentId,
    candidate_ids: [candidateId],
  });

  devLog("candidate attempt stats (raw)", data);

  const stats = data.candidate_attempt_stats?.[0];
  if (!stats) {
    throw new ResultsNotAvailableError(
      "No candidate attempt stats returned for this assessment/candidate.",
    );
  }

  return stats;
}

/**
 * Picks the section to drive Step 2 from: prefer the coding/technical
 * section (PRIMITIVE_CODING), otherwise fall back to the first attempted
 * section. Throws ResultsNotAvailableError if nothing is attempted yet.
 */
export function extractExamIdentifiers(stats: CandidateAttemptStats): {
  examId: string;
  examAttemptId: string;
} {
  const sections = stats.section_details ?? [];

  const preferred =
    sections.find(
      (s) =>
        s.section_type === "PRIMITIVE_CODING" &&
        s.attempt_status === "ATTEMPTED" &&
        s.exam_id &&
        s.exam_attempt_id,
    ) ??
    sections.find(
      (s) => s.attempt_status === "ATTEMPTED" && s.exam_id && s.exam_attempt_id,
    );

  if (!preferred?.exam_id || !preferred?.exam_attempt_id) {
    throw new ResultsNotAvailableError(
      "Candidate has not completed any attempted section yet.",
    );
  }

  return { examId: preferred.exam_id, examAttemptId: preferred.exam_attempt_id };
}

/**
 * Step 2 — fetch tag-wise (topic/sub-topic/difficulty) accuracy for the
 * given exam attempt.
 */
export async function fetchTagGroupDetails(
  examId: string,
  examAttemptId: string,
): Promise<TagGroupAttempt[]> {
  const tagDetailsUrl = requiredEnv("ASSESSMENT_TAG_DETAILS_URL");
  const assessmentId = requiredEnv("ASSESSMENT_ID");

  const data = await postToTopin<{ tag_group_attempts: TagGroupAttempt[] }>(
    tagDetailsUrl,
    {
      org_assess_id: assessmentId,
      exam_id: examId,
      exam_attempt_id: examAttemptId,
    },
  );

  devLog("tag group attempts (raw)", data);

  return data.tag_group_attempts ?? [];
}
