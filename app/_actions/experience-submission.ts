"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma, SubmissionStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireSignedIn, requireAdminOrPanelist } from "@/lib/auth/guards";
import { createInterviewTree } from "@/lib/interview/write";
import { slugify } from "@/lib/slug";
import {
  experienceSubmissionSchema,
  type ExperienceSubmissionInput,
} from "@/lib/validations/experience-submission";
import type { InterviewFullCreate } from "@/lib/validations/interview-full";

/** Student / signed-in candidate submits an experience for admin review. */
export async function submitExperience(
  input: unknown,
): Promise<{ id: string }> {
  const user = await requireSignedIn();
  const data = experienceSubmissionSchema.parse(input);

  const submission = await prisma.experienceSubmission.create({
    data: {
      submittedById: user.id,
      companyName: data.companyName,
      role: data.role,
      year: data.year,
      payload: data as unknown as Prisma.InputJsonValue,
      status: SubmissionStatus.PENDING,
    },
    select: { id: true },
  });

  revalidatePath("/admin/submissions");
  revalidatePath("/dashboard");
  return { id: submission.id };
}

/** Maps a reviewed submission into the shared interview-tree create payload. */
function toInterviewPayload(
  data: ExperienceSubmissionInput,
): InterviewFullCreate {
  return {
    company: {
      mode: "new",
      data: { name: data.companyName, slug: slugify(data.companyName) },
    },
    interview: {
      role: data.role,
      roleLevelId: data.roleLevelId,
      roleLevelName: data.roleLevelName,
      year: data.year,
      totalSelected: null,
      biggestTip: data.biggestTip || null,
    },
    rounds: data.rounds.map((r, i) => ({
      roundNumber: i + 1,
      roundName: r.roundName,
      roundType: r.roundType,
      mode: r.mode,
      outcome: r.outcome,
      durationMinutes: r.durationMinutes ?? null,
      numInterviewers: null,
      interviewStyle: null,
      keyLearnings: r.keyLearnings || null,
      topicCoverages: [
        {
          topicAreaId: r.topicAreaId,
          subTopicCount: r.questions.length,
          orderIndex: 0,
          entries: r.questions.map((q, entryIndex) => ({
            subTopicId: "__new__",
            subTopicName: q.subTopicName,
            orderIndex: entryIndex,
            exactQuestionText: q.questionText,
            referenceUrl: null,
          })),
        },
      ],
    })),
    assets: [],
  };
}

/** Admin approves + publishes: creates the real Interview, marks submission published. */
export async function publishSubmission(
  id: string,
): Promise<{ interviewId: string }> {
  const admin = await requireAdminOrPanelist();

  const submission = await prisma.experienceSubmission.findUnique({
    where: { id },
  });
  if (!submission) throw new Error("Submission not found.");
  if (submission.status === SubmissionStatus.PUBLISHED) {
    throw new Error("This submission has already been published.");
  }

  const data = experienceSubmissionSchema.parse(submission.payload);
  const payload = toInterviewPayload(data);

  const interviewId = await prisma.$transaction(
    async (tx) => {
      const created = await createInterviewTree(tx, admin.id, payload);
      // Candidate profile fields aren't part of the shared tree writer.
      await tx.interview.update({
        where: { id: created.id },
        data: {
          candidateBranch: data.candidateBranch ?? null,
          candidateCgpa: data.candidateCgpa ?? null,
          candidateGradYear: data.candidateGradYear ?? null,
          candidateBackground: data.candidateBackground || null,
        },
      });
      await tx.experienceSubmission.update({
        where: { id },
        data: {
          status: SubmissionStatus.PUBLISHED,
          reviewedById: admin.id,
          reviewedAt: new Date(),
          publishedInterviewId: created.id,
        },
      });
      return created.id;
    },
    { maxWait: 10_000, timeout: 30_000 },
  );

  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  revalidatePath("/");
  revalidatePath("/companies");
  revalidateTag("analytics");
  revalidateTag("topic-questions");
  return { interviewId };
}

/** Admin rejects with feedback. Nothing is published. */
export async function rejectSubmission(
  id: string,
  notes: string,
): Promise<{ ok: true }> {
  const admin = await requireAdminOrPanelist();

  await prisma.experienceSubmission.update({
    where: { id },
    data: {
      status: SubmissionStatus.REJECTED,
      reviewNotes: notes?.trim() || null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  return { ok: true };
}
