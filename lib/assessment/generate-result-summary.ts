import "server-only";

import { z } from "zod";

import { callLLMWithFallback } from "@/lib/ai/providers";
import type { CandidateAttemptStats, TagGroupAttempt } from "./topin";

// Accuracy % at/above which a topic counts as a strength. Below this, it's a weakness.
// Tune this single constant if the classification cutoff needs to change.
const STRENGTH_THRESHOLD = 75;

const SYSTEM_PROMPT = `You are analyzing a student's technical assessment performance. You will be given the overall score, time spent, and a tag-wise accuracy breakdown (topic / sub-topic / difficulty).

CLASSIFICATION RULE (MOST IMPORTANT — READ CAREFULLY)
Classify each topic by its ABSOLUTE accuracy percentage, NOT by ranking topics against each other.
- A topic is a STRENGTH only if its accuracy percentage is >= ${STRENGTH_THRESHOLD}.
- A topic is a WEAKNESS if its accuracy percentage is < ${STRENGTH_THRESHOLD}.
- Every topic belongs to exactly ONE bucket. Never place the same topic (or its accuracy value) in both "strengths" and "weaknesses".
- Do NOT force 3 items into a bucket just to fill it. If fewer than 3 topics qualify, return fewer. If zero topics qualify for a bucket, return an empty array [] for that bucket — do not backfill with topics that fail the threshold.
- Within each bucket, sort strengths by accuracy percentage descending, and weaknesses by accuracy percentage ascending (worst first).
- Cap each bucket at a maximum of 3 entries.
- If ALL topics are below ${STRENGTH_THRESHOLD} (i.e. strengths is empty), the summary must say so honestly (e.g. "No topic yet reaches a strong level of accuracy") instead of implying strength exists. Likewise, if weaknesses is empty, do not invent one.

TASK
Generate a concise, encouraging but honest report with:
1. summary — an overall performance summary (2-3 sentences). Must be consistent with the strengths/weaknesses actually returned (e.g. don't call performance "strong in X" if X didn't cross the threshold).
2. strengths — topics with accuracy percentage >= ${STRENGTH_THRESHOLD}, per the rule above.
3. weaknesses — topics with accuracy percentage < ${STRENGTH_THRESHOLD}, per the rule above.
4. recommendations — one specific, actionable recommendation per weakness, in the same order as weaknesses. If weaknesses is empty, return an empty array for recommendations.

FORMATTING RULES
- Base every claim strictly on the provided data. Do not invent topics or numbers.
- Keep topic/sub-topic names as given (strip prefixes like "TOPIC_" / "SUB_TOPIC_" / "DIFFICULTY_" and format as readable text).
- Each strength/weakness entry must include the topic name and its exact accuracy percentage from the input (do not round differently or recompute).
- Return ONLY valid JSON. No prose, no markdown code fences.

OUTPUT SCHEMA (return exactly this shape):
{
  "summary": "string",
  "strengths": [{ "topic": "string", "accuracyPercentage": 0 }],
  "weaknesses": [{ "topic": "string", "accuracyPercentage": 0 }],
  "recommendations": ["string"]
}`;

function parseTagGroup(tagGroup: string[]): {
  topic?: string;
  subTopic?: string;
  difficulty?: string;
  isPublic: boolean;
} {
  const result: {
    topic?: string;
    subTopic?: string;
    difficulty?: string;
    isPublic: boolean;
  } = { isPublic: false };

  for (const tag of tagGroup) {
    if (tag.startsWith("TOPIC_")) result.topic = tag.replace("TOPIC_", "");
    else if (tag.startsWith("SUB_TOPIC_"))
      result.subTopic = tag.replace("SUB_TOPIC_", "");
    else if (tag.startsWith("DIFFICULTY_"))
      result.difficulty = tag.replace("DIFFICULTY_", "");
    else if (tag === "IS_PUBLIC") result.isPublic = true;
  }

  return result;
}

function buildUserPrompt(
  stats: CandidateAttemptStats,
  tagGroupAttempts: TagGroupAttempt[],
): string {
  const overallAccuracy =
    stats.assessment_total_score > 0
      ? ((stats.user_total_score / stats.assessment_total_score) * 100).toFixed(1)
      : "0.0";

  const tagLines = tagGroupAttempts.map((attempt) => {
    const { topic, subTopic, difficulty } = parseTagGroup(attempt.tag_group);
    return `- Topic: ${topic ?? "Unknown"} | Sub-topic: ${subTopic ?? "N/A"} | Difficulty: ${difficulty ?? "N/A"} | Accuracy: ${attempt.user_score_accuracy_percentage.toFixed(1)}% (score ${attempt.user_score}/${attempt.total_score})`;
  });

  return `OVERALL PERFORMANCE
Total score: ${stats.user_total_score} / ${stats.assessment_total_score} (${overallAccuracy}%)
Time spent: ${stats.time_spent_in_seconds} seconds
Strength threshold: a topic counts as a strength only if its accuracy is >= ${STRENGTH_THRESHOLD}%. Everything below that is a weakness.

TAG-WISE ACCURACY BREAKDOWN
${tagLines.join("\n")}

Generate the report per the schema.`;
}

const resultSummarySchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(
    z.object({
      topic: z.string().min(1),
      accuracyPercentage: z.number(),
    }),
  ),
  weaknesses: z.array(
    z.object({
      topic: z.string().min(1),
      accuracyPercentage: z.number(),
    }),
  ),
  recommendations: z.array(z.string().min(1)),
});

export type AssessmentResultSummary = z.infer<typeof resultSummarySchema>;

/**
 * Deterministic guardrail: even if the LLM misclassifies a topic despite the
 * prompt instructions, re-bucket strengths/weaknesses here based on the same
 * STRENGTH_THRESHOLD so a topic can never appear in — or be missing from —
 * the wrong list, and dedupe any topic that the model accidentally placed in
 * both buckets.
 */
function reconcileWithThreshold(
  result: AssessmentResultSummary,
): AssessmentResultSummary {
  const allEntries = [...result.strengths, ...result.weaknesses];
  const seen = new Set<string>();
  const deduped = allEntries.filter((entry) => {
    const key = `${entry.topic}__${entry.accuracyPercentage}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const strengths = deduped
    .filter((entry) => entry.accuracyPercentage >= STRENGTH_THRESHOLD)
    .sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)
    .slice(0, 3);

  const weaknesses = deduped
    .filter((entry) => entry.accuracyPercentage < STRENGTH_THRESHOLD)
    .sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)
    .slice(0, 3);

  // Trim recommendations to match reconciled weaknesses count; if the LLM's
  // weakness order changed after reconciliation, we keep recommendations
  // aligned by truncating rather than risking a mismatched pairing.
  const recommendations = result.recommendations.slice(0, weaknesses.length);

  return {
    summary: result.summary,
    strengths,
    weaknesses,
    recommendations,
  };
}

export async function generateResultSummary(
  stats: CandidateAttemptStats,
  tagGroupAttempts: TagGroupAttempt[],
): Promise<AssessmentResultSummary> {
  const userPrompt = buildUserPrompt(stats, tagGroupAttempts);
  const { text, provider, model } = await callLLMWithFallback(
    SYSTEM_PROMPT,
    userPrompt,
  );

  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `LLM (${provider}/${model}) returned invalid JSON for result summary. First 500 chars: ${cleaned.slice(0, 500)}`,
    );
  }

  const validated = resultSummarySchema.parse(parsed);
  return reconcileWithThreshold(validated);
}