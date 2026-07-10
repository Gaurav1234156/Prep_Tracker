import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, Lock } from "lucide-react";
import type { ReactNode } from "react";

import { ExperienceDetailView } from "@/components/experience/ExperienceDetailView";
import { getCurrentDbUser } from "@/lib/auth/guards";
import { checkCompanyAccess } from "@/lib/intelligence/access";
import { prisma } from "@/lib/db";
import { fetchInterviewDetail } from "@/lib/queries/interview-detail";

interface GatedExperienceContentProps {
  interviewId: string;
  companySlug: string;
  companyName: string;
}

function ExperienceGateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Interview Experience
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{title}</p>
          </div>
          {action}
        </div>
      </div>
    </section>
  );
}

export async function GatedExperienceContent({
  interviewId,
  companySlug,
  companyName,
}: GatedExperienceContentProps) {
  const user = await getCurrentDbUser();
  const nextPath = `/experiences/${interviewId}`;

  if (!user) {
    return (
      <ExperienceGateCard
        title="Sign in to view this experience"
        description={`Full interview experiences for ${companyName} are available to signed-in users.`}
        action={
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="inline-flex h-8 items-center justify-center rounded-md bg-brand px-3 text-xs font-medium text-brand-foreground transition-colors hover:bg-brand-dim"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  const interviewMeta = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: { id: true, companyId: true },
  });

  if (!interviewMeta) notFound();

  const access = await checkCompanyAccess(
    user.id,
    interviewMeta.companyId,
    user.role,
  );

  if (!access.allowed) {
    return (
      <ExperienceGateCard
        title="You've viewed 2 companies today"
        description="Your daily company content limit resets at midnight IST. Visit this company's page tomorrow or explore companies you've already unlocked today."
        action={
          <Link
            href={`/companies/${companySlug}`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background-elevated px-3 text-xs font-medium text-foreground transition-colors hover:bg-background-subtle"
          >
            Back to {companyName}
          </Link>
        }
      />
    );
  }

  const [interview, bookmark] = await Promise.all([
    fetchInterviewDetail(interviewId),
    prisma.bookmark.findUnique({
      where: {
        userId_interviewId: { userId: user.id, interviewId },
      },
    }),
  ]);

  if (!interview) notFound();

  return (
    <ExperienceDetailView
      interview={interview}
      bookmarked={!!bookmark}
      remaining={access.remaining}
    />
  );
}
