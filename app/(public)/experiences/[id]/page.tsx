import { notFound } from "next/navigation";
import { GatedExperienceContent } from "@/components/experience/GatedExperienceContent";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 3600; // ISR: re-render at most once per hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const interview = await prisma.interview.findUnique({
    where: { id },
    select: {
      role: true,
      year: true,
      company: { select: { name: true } },
    },
  });
  if (!interview) return { title: "Not found | Interview Experience Platform" };
  return {
    title: `${interview.company.name} — ${interview.role} (${interview.year}) Interview Experience`,
    description: `Interview experience for ${interview.role} at ${interview.company.name}. Sign in to read the full breakdown.`,
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const interviewMeta = await prisma.interview.findUnique({
    where: { id },
    select: {
      id: true,
      company: { select: { name: true, slug: true } },
    },
  });

  if (!interviewMeta) notFound();

  return (
    <GatedExperienceContent
      interviewId={interviewMeta.id}
      companySlug={interviewMeta.company.slug}
      companyName={interviewMeta.company.name}
    />
  );
}
