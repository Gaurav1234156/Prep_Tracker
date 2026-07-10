"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import {
  FEATURE_FLAG_KEYS,
  isFeatureEnabled,
} from "@/lib/feature-flags";

export async function toggleBookmark(
  interviewId: string,
): Promise<{ bookmarked: boolean }> {
  const enabled = await isFeatureEnabled(FEATURE_FLAG_KEYS.STUDENT_BOOKMARKS);
  if (!enabled) {
    throw new Error("Bookmarks are currently disabled.");
  }

  const user = await requireUser();

  const existing = await prisma.bookmark.findUnique({
    where: { userId_interviewId: { userId: user.id, interviewId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_interviewId: { userId: user.id, interviewId } },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/experiences/${interviewId}`);
    return { bookmarked: false };
  }

  await prisma.bookmark.create({
    data: { userId: user.id, interviewId },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/experiences/${interviewId}`);
  return { bookmarked: true };
}
