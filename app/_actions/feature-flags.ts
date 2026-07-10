"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { FEATURE_FLAG_KEYS } from "@/lib/feature-flags.constants";

const toggleSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
});

export async function toggleFeatureFlag(
  input: z.infer<typeof toggleSchema>,
) {
  await requireAdminOrPanelist();
  const { key, enabled } = toggleSchema.parse(input);

  await prisma.featureFlag.upsert({
    where: { key },
    update: { enabled },
    create: { key, enabled },
  });

  revalidateTag("feature-flags");
  revalidatePath("/admin/feature-flags");
  revalidatePath("/companies");
  if (key === FEATURE_FLAG_KEYS.STUDENT_BOOKMARKS) {
    revalidatePath("/dashboard");
  }
  return { ok: true } as const;
}

const updateDescriptionSchema = z.object({
  key: z.string().min(1),
  description: z.string().max(500).nullable(),
});

export async function updateFeatureFlagDescription(
  input: z.infer<typeof updateDescriptionSchema>,
) {
  await requireAdminOrPanelist();
  const { key, description } = updateDescriptionSchema.parse(input);
  await prisma.featureFlag.update({
    where: { key },
    data: { description },
  });
  revalidateTag("feature-flags");
  revalidatePath("/admin/feature-flags");
  return { ok: true } as const;
}
