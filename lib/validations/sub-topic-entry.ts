import { z } from "zod";
import { Difficulty } from "@prisma/client";

export const subTopicEntryCreateSchema = z.object({
  subTopicId: z.string().min(1, "Sub-topic selection is required."),
  subTopicName: z.string().trim().optional(),
  orderIndex: z.number().int().min(0),
  exactQuestionText: z.string().trim().max(4000).optional().nullable(),
  referenceUrl: z.string().trim().url("Provide a valid URL.").optional().or(z.literal("")).nullable(),
  externalQuestionId: z.string().trim().optional().nullable(),
  questionType: z.string().trim().optional().nullable(),
  difficulty: z.nativeEnum(Difficulty).optional().nullable(),
  skillsAssessed: z.string().trim().optional().nullable(),
}).refine(
  (data) =>
    data.subTopicId !== "__new__" ||
    (!!data.subTopicName && data.subTopicName.trim().length > 0),
  {
    message: "Name is required when creating a new sub-topic.",
    path: ["subTopicName"],
  }
);

export type SubTopicEntryCreate = z.infer<typeof subTopicEntryCreateSchema>;
