import { InterviewMode, RoundOutcome, RoundType } from "@prisma/client";
import { z } from "zod";

export const roundCreateSchema = z.object({
  roundNumber: z
    .number()
    .int()
    .min(1, "Round number must be 1 or greater."),
  roundName: z.string().trim().min(1, "Round name is required.").max(120),
  roundType: z.nativeEnum(RoundType),
  durationMinutes: z.number().int().min(0).max(24 * 60).nullish(),
  mode: z.nativeEnum(InterviewMode),
  numInterviewers: z.number().int().min(0).max(20).nullish(),
  interviewStyle: z.string().trim().max(200).nullish(),
  outcome: z.nativeEnum(RoundOutcome),
  keyLearnings: z.string().trim().max(4000).nullish(),
  assessmentPattern: z.string().trim().max(4000).nullish(),
  pocRemarks: z.string().trim().max(4000).nullish(),
  recordingUrl: z.string().trim().url().optional().or(z.literal("")).nullish(),
  transcriptUrl: z.string().trim().url().optional().or(z.literal("")).nullish(),
});

export type RoundCreate = z.infer<typeof roundCreateSchema>;
