import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { SubmitExperienceForm } from "@/components/public/SubmitExperienceForm";

export const metadata: Metadata = {
  title: "Share your interview experience — PrepIntel",
  description:
    "Post your interview experience. An admin reviews every submission before it's published to help the next batch of candidates.",
};

export default async function NewExperiencePage() {
  // Signed-in only — redirects to /login?next=/experiences/new otherwise.
  await requireUser();

  const [roleLevels, topicAreas] = await Promise.all([
    prisma.roleLevel.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.topicArea.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold tracking-wider uppercase select-none">
          <Sparkles className="w-3.5 h-3.5" />
          Share your experience
        </span>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Post your interview experience
        </h1>
        <p className="text-sm text-muted-foreground">
          Help the next candidate. Add your rounds and the questions you were
          asked — an admin reviews every submission before it&apos;s published.
        </p>
      </header>

      <SubmitExperienceForm meta={{ roleLevels, topicAreas }} />
    </div>
  );
}
