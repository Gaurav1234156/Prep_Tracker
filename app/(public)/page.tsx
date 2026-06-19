import { Suspense } from "react";
import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { Hero } from "@/components/public/Hero";
import { StatsStrip } from "@/components/public/StatsStrip";
import { FeaturedCompaniesRow } from "@/components/public/FeaturedCompaniesRow";
import { RecentExperiencesRow } from "@/components/public/RecentExperiencesRow";
import { TopicAreaHighlights } from "@/components/public/TopicAreaHighlights";
import { CardGridSkeleton } from "@/components/loading/Skeletons";

export const revalidate = 3600; // ISR: Cache for 1 hour

export const metadata: Metadata = {
  title: "PrepIntel — Real Interview Experiences & Structured Taxonomy",
  description:
    "Browse real interview experiences from top companies, structured meticulously into core topic areas and specific coding prompts.",
};

export default async function LandingPage() {
  // Above-the-fold counts run inline so the Hero + StatsStrip paint with real
  // numbers. Everything below is streamed via <Suspense>.
  const [interviewsCount, companiesCount, subTopicsCount, questionsCount] =
    await Promise.all([
      prisma.interview.count(),
      prisma.company.count(),
      prisma.subTopic.count(),
      prisma.subTopicEntry.count(),
    ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        interviewCount={interviewsCount}
        companyCount={companiesCount}
      />

      <StatsStrip
        stats={{
          interviewsCount,
          companiesCount,
          subTopicsCount,
          questionsCount,
        }}
      />

      <Suspense fallback={<RowSkeleton />}>
        <RecentExperiencesRowAsync />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <FeaturedCompaniesRowAsync />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <TopicAreaHighlightsAsync />
      </Suspense>
    </div>
  );
}

async function RecentExperiencesRowAsync() {
  const recentInterviews = await prisma.interview.findMany({
    take: 6,
    orderBy: { publishedAt: "desc" },
    include: {
      company: true,
      roleLevel: true,
      _count: { select: { rounds: true } },
    },
  });
  return <RecentExperiencesRow interviews={recentInterviews} />;
}

async function FeaturedCompaniesRowAsync() {
  const featuredCompaniesRaw = await prisma.company.findMany({
    take: 8,
    include: {
      _count: { select: { interviews: true } },
      interviews: {
        select: {
          year: true,
          roleLevel: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { interviews: { _count: "desc" } },
  });

  const featuredCompanies = featuredCompaniesRaw.map((c) => {
    const levelsMap = new Map<
      string,
      { id: string; name: string; slug: string }
    >();
    let maxYear = 0;
    c.interviews.forEach((i) => {
      if (i.roleLevel) levelsMap.set(i.roleLevel.id, i.roleLevel);
      if (i.year > maxYear) maxYear = i.year;
    });
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      logoUrl: c.logoUrl,
      description: c.description,
      websiteUrl: c.websiteUrl,
      interviewCount: c._count.interviews,
      roleLevelsCovered: Array.from(levelsMap.values()),
      mostRecentYear: maxYear > 0 ? maxYear : null,
      ctc: c.ctc,
    };
  });

  return <FeaturedCompaniesRow companies={featuredCompanies} />;
}

async function TopicAreaHighlightsAsync() {
  const topicAreas = await prisma.topicArea.findMany({
    include: { _count: { select: { subTopics: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return <TopicAreaHighlights topicAreas={topicAreas} />;
}

function RowSkeleton() {
  return (
    <section className="border-b border-border bg-background-elevated py-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded-md skeleton" />
        <CardGridSkeleton count={3} />
      </div>
    </section>
  );
}
