"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ensureDbUser } from "@/lib/auth/ensure-db-user";
import { requireUser } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const BRANCHES = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "CHEM",
  "AI_ML",
  "OTHER",
] as const;

const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  branch: z.enum(BRANCHES).optional(),
  gradYear: z.coerce.number().int().min(2000).max(2035).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(input: OnboardingInput) {
  const user = await requireUser();
  const data = onboardingSchema.parse(input);
  await prisma.user.update({
    where: { id: user.id },
    data: { ...data, onboardedAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true } as const;
}

const profileSchema = onboardingSchema.partial();
export type ProfileUpdateInput = z.infer<typeof profileSchema>;

export async function updateProfile(input: ProfileUpdateInput) {
  const user = await requireUser();
  const data = profileSchema.parse(input);
  await prisma.user.update({ where: { id: user.id }, data });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type SignInInput = z.infer<typeof signInSchema>;

export async function signIn(input: SignInInput, nextParam?: string | null) {
  try {
    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      } as const;
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { error: error.message } as const;
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      return { error: "Sign-in succeeded but no user was returned." } as const;
    }

    const dbUser = await ensureDbUser(authUser);

    revalidatePath("/", "layout");

    if (!dbUser.onboardedAt) {
      return { redirectTo: "/onboarding" } as const;
    }

    return { redirectTo: safeNextPath(nextParam) } as const;
  } catch (err) {
    console.error("[signIn]", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please try again.",
    } as const;
  }
}
