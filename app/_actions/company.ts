"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";

const updateCtcSchema = z.object({
  id: z.string(),
  ctc: z.number().nullable(),
});

export async function updateCompanyCtc(id: string, ctc: number | null) {
  await requireAdminOrPanelist();
  const parsed = updateCtcSchema.parse({ id, ctc });

  const updated = await prisma.company.update({
    where: { id: parsed.id },
    data: { ctc: parsed.ctc },
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${updated.slug}`);
  revalidatePath("/");
  return updated;
}
