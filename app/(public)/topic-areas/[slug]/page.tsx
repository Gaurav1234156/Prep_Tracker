import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Building2, HelpCircle, Layers, ChevronLeft } from "lucide-react";

import { getTopicAreaQuestions } from "@/lib/queries/topic-area-detail";
import { StatsKpi } from "@/components/public/StatsKpi";
import { EmptyState } from "@/components/public/EmptyState";
import { TopicQuestionCard } from "@/components/public/TopicQuestionCard";
import {
  TopicQuestionExplorer,
  type ExplorerItem,
} from "@/components/public/TopicQuestionExplorer";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTopicAreaQuestions(slug);
  if (!data) return { title: "Topic Not Found — PrepIntel" };
  return {
    title: `${data.area.name} Interview Questions — PrepIntel`,
    description: `Browse ${data.questions.length} real ${data.area.name} interview questions, labeled by company and role, from candidate experiences.`,
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopicAreaPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTopicAreaQuestions(slug);
  if (!data) notFound();

  const { area, questions, meta } = data;

  // Server-render each question (so Markdown is rendered server-side) and attach
  // the plain metadata the client explorer needs for instant filtering.
  const items: ExplorerItem[] = questions.map((q) => ({
    key: q.id,
    node: <TopicQuestionCard q={q} />,
    companySlug: q.company.slug,
    roleLevelId: q.roleLevel.id,
    year: q.year,
    subTopicSlug: q.subTopic.slug,
    text: `${q.question} ${q.subTopic.name} ${q.company.name} ${q.role} ${q.roleLevel.name}`.toLowerCase(),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/topic-areas"
        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        All topic areas
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold tracking-wider uppercase select-none">
          <BookOpen className="w-3.5 h-3.5" />
          Topic Area
        </span>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            {area.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Every {area.name} question reported by candidates — labeled with the
            company and role that asked it. Filter to plan exactly what to study.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          <StatsKpi
            label="Questions"
            value={questions.length}
            icon={HelpCircle}
            colorClass="bg-primary/10 text-primary border-primary/20"
          />
          <StatsKpi
            label="Companies Asking"
            value={meta.companies.length}
            icon={Building2}
            colorClass="bg-primary/10 text-primary border-primary/20"
          />
          <StatsKpi
            label="Sub-topics"
            value={area.subTopicCount}
            icon={Layers}
            colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          />
        </div>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          title={`No ${area.name} questions reported yet`}
          description="Candidates haven't reported questions in this area yet. Check back as new interview experiences are submitted."
          icon={HelpCircle}
        />
      ) : (
        <TopicQuestionExplorer items={items} meta={meta} />
      )}
    </div>
  );
}
