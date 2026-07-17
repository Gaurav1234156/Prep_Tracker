import { z } from "zod";

export const createAssessmentFeedbackSchema = z.object({
  studentUserId: z.string().min(1),
  companySlug: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  reportUrl: z.string().trim().url().max(2000),
  reportNotes: z.string().trim().max(8000).optional().nullable(),
});

export const updateAssessmentFeedbackSchema = z.object({
  id: z.string().min(1),
  strengths: z.string().trim().max(8000).optional().nullable(),
  weaknesses: z.string().trim().max(8000).optional().nullable(),
  summary: z.string().trim().max(8000).optional().nullable(),
  reportNotes: z.string().trim().max(8000).optional().nullable(),
});

export type CreateAssessmentFeedbackInput = z.infer<
  typeof createAssessmentFeedbackSchema
>;
