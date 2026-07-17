import "server-only";

import { z } from "zod";

import { callLLMWithFallback } from "./providers";

const analysisSchema = z.object({
  strengths: z.string().min(1),
  weaknesses: z.string().min(1),
  summary: z.string().min(1),
});

export type AssessmentAnalysis = z.infer<typeof analysisSchema>;

const SYSTEM_PROMPT = `You are a career coach reviewing a student's online assessment (OA) performance for an interview-prep platform.

Given company/role context and whatever report details are available (URL and/or pasted notes/scores), produce constructive feedback.

RULES:
1. Be specific and actionable. Avoid generic praise.
2. Strengths and weaknesses should be short paragraphs or bullet-style lines separated by newlines.
3. If report details are thin, infer carefully from what is present and say what is uncertain — do not invent scores.
4. Return ONLY valid JSON with keys: strengths, weaknesses, summary. No markdown fences.`;

export async function analyzeAssessmentReport(input: {
  companyName: string;
  role: string;
  reportUrl: string;
  reportNotes?: string | null;
}): Promise<AssessmentAnalysis> {
  const userPrompt = `Company: ${input.companyName}
Role: ${input.role}
Report URL: ${input.reportUrl}
Additional notes / scores from admin:
${input.reportNotes?.trim() || "(none provided)"}

Return JSON: { "strengths": "...", "weaknesses": "...", "summary": "..." }`;

  const result = await callLLMWithFallback(SYSTEM_PROMPT, userPrompt);
  const parsed = JSON.parse(result.text) as unknown;
  return analysisSchema.parse(parsed);
}
