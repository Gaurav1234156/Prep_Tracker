"use server";

import { AssessmentFeedbackStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { analyzeAssessmentReport } from "@/lib/ai/assessment-analysis";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import {
  createAssessmentFeedbackSchema,
  updateAssessmentFeedbackSchema,
} from "@/lib/validations/assessment-feedback";

export async function searchStudents(query: string) {
  await requireAdminOrPanelist();
  const q = query.trim();
  if (q.length < 1) return [];

  return prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, name: true },
    take: 20,
    orderBy: { email: "asc" },
  });
}

export async function createAssessmentFeedback(input: unknown) {
  const admin = await requireAdminOrPanelist();
  const data = createAssessmentFeedbackSchema.parse(input);

  const student = await prisma.user.findFirst({
    where: { id: data.studentUserId, role: UserRole.STUDENT },
    select: { id: true },
  });
  if (!student) {
    throw new Error("Student not found.");
  }

  const feedback = await prisma.assessmentFeedback.create({
    data: {
      studentUserId: data.studentUserId,
      createdById: admin.id,
      companySlug: data.companySlug,
      companyName: data.companyName,
      role: data.role,
      reportUrl: data.reportUrl,
      reportNotes: data.reportNotes || null,
      status: AssessmentFeedbackStatus.DRAFT,
    },
    select: { id: true },
  });

  revalidatePath("/admin/assessment-reports");
  revalidatePath("/admin");
  return feedback;
}

export async function generateAssessmentAnalysis(id: string) {
  await requireAdminOrPanelist();

  const feedback = await prisma.assessmentFeedback.findUnique({
    where: { id },
  });
  if (!feedback) throw new Error("Assessment feedback not found.");
  if (feedback.status === AssessmentFeedbackStatus.SENT) {
    throw new Error("Cannot regenerate analysis after sending.");
  }

  const analysis = await analyzeAssessmentReport({
    companyName: feedback.companyName,
    role: feedback.role,
    reportUrl: feedback.reportUrl,
    reportNotes: feedback.reportNotes,
  });

  const updated = await prisma.assessmentFeedback.update({
    where: { id },
    data: {
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      summary: analysis.summary,
    },
  });

  revalidatePath(`/admin/assessment-reports/${id}`);
  revalidatePath("/admin/assessment-reports");
  return {
    strengths: updated.strengths,
    weaknesses: updated.weaknesses,
    summary: updated.summary,
  };
}

export async function updateAssessmentFeedback(input: unknown) {
  await requireAdminOrPanelist();
  const data = updateAssessmentFeedbackSchema.parse(input);

  const existing = await prisma.assessmentFeedback.findUnique({
    where: { id: data.id },
    select: { status: true },
  });
  if (!existing) throw new Error("Assessment feedback not found.");
  if (existing.status === AssessmentFeedbackStatus.SENT) {
    throw new Error("Cannot edit feedback after sending.");
  }

  await prisma.assessmentFeedback.update({
    where: { id: data.id },
    data: {
      strengths: data.strengths ?? undefined,
      weaknesses: data.weaknesses ?? undefined,
      summary: data.summary ?? undefined,
      reportNotes: data.reportNotes === undefined ? undefined : data.reportNotes,
    },
  });

  revalidatePath(`/admin/assessment-reports/${data.id}`);
  revalidatePath("/admin/assessment-reports");
}

export async function sendAssessmentFeedback(id: string) {
  await requireAdminOrPanelist();

  const feedback = await prisma.assessmentFeedback.findUnique({
    where: { id },
  });
  if (!feedback) throw new Error("Assessment feedback not found.");
  if (feedback.status === AssessmentFeedbackStatus.SENT) {
    throw new Error("Already sent.");
  }
  if (!feedback.strengths?.trim() || !feedback.weaknesses?.trim()) {
    throw new Error("Generate or enter strengths and weaknesses before sending.");
  }

  await prisma.assessmentFeedback.update({
    where: { id },
    data: {
      status: AssessmentFeedbackStatus.SENT,
      sentAt: new Date(),
    },
  });

  revalidatePath(`/admin/assessment-reports/${id}`);
  revalidatePath("/admin/assessment-reports");
  revalidatePath("/admin");
  revalidatePath("/profile");
}
