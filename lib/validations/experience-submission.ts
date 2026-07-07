import { z } from "zod";
import { Branch, InterviewMode, RoundOutcome, RoundType } from "@prisma/client";

const currentYear = new Date().getUTCFullYear();

// Turns "" / null into undefined, then validates the number. Lets the same
// schema back both the client form (zodResolver) and the server action.
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    schema.optional(),
  );

export const submissionQuestionSchema = z.object({
  subTopicName: z
    .string()
    .trim()
    .min(1, "Name the concept (e.g. Dynamic Programming).")
    .max(120),
  questionText: z
    .string()
    .trim()
    .min(1, "Describe the question that was asked.")
    .max(4000),
});

export const submissionRoundSchema = z.object({
  roundName: z.string().trim().min(1, "Round name is required.").max(120),
  roundType: z.nativeEnum(RoundType),
  mode: z.nativeEnum(InterviewMode),
  outcome: z.nativeEnum(RoundOutcome),
  durationMinutes: optionalNumber(z.number().int().min(0).max(1440)),
  topicAreaId: z.string().min(1, "Pick the main topic area for this round."),
  keyLearnings: z.string().trim().max(4000).optional(),
  questions: z
    .array(submissionQuestionSchema)
    .min(1, "Add at least one question for this round.")
    .max(30, "At most 30 questions per round."),
});

export const experienceSubmissionSchema = z
  .object({
    companyName: z.string().trim().min(1, "Company is required.").max(120),
    role: z.string().trim().min(1, "Role is required.").max(120),
    roleLevelId: z.string().min(1, "Role level is required."),
    roleLevelName: z.string().trim().max(120).optional(),
    year: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z
        .number({ message: "Year is required." })
        .int()
        .min(2000, "Year must be 2000 or later.")
        .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}.`),
    ),
    candidateBranch: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.nativeEnum(Branch).optional(),
    ),
    candidateCgpa: optionalNumber(z.number().min(0).max(10)),
    candidateGradYear: optionalNumber(
      z.number().int().min(2000).max(currentYear + 6),
    ),
    candidateBackground: z.string().trim().max(2000).optional(),
    biggestTip: z.string().trim().max(2000).optional(),
    rounds: z
      .array(submissionRoundSchema)
      .min(1, "Add at least one round.")
      .max(15, "At most 15 rounds."),
  })
  .refine((d) => d.roleLevelId !== "__new__" || !!d.roleLevelName?.trim(), {
    message: "Specify a custom role level name.",
    path: ["roleLevelName"],
  });

export type ExperienceSubmissionInput = z.infer<
  typeof experienceSubmissionSchema
>;
export type SubmissionRoundInput = z.infer<typeof submissionRoundSchema>;
