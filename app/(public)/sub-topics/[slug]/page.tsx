import { getSubTopicDetail } from "@/lib/queries/sub-topic-detail";
import { notFound } from "next/navigation";
import { SubTopicChip } from "@/components/public/SubTopicChip";
import { StatsKpi } from "@/components/public/StatsKpi";
import { SubTopicQuestionExpandable } from "@/components/public/SubTopicQuestionExpandable";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { EmptyState } from "@/components/public/EmptyState";
import { Building2, Calendar, HelpCircle, ArrowRight, Tag, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Dynamic SEO tags for indexing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSubTopicDetail(slug);

  if (!data) {
    return { title: "Sub-Topic Not Found | PrepIntel" };
  }

  return {
    title: `${data.subTopic.name} Interview Questions & Topics — PrepIntel`,
    description: `Real-world candidate interview questions on ${data.subTopic.name}. Tracked across ${data.stats.uniqueCompaniesCount} companies in ${data.stats.uniqueInterviewsCount} interviews.`,
  };
}

interface SubTopicInterview {
  id: string;
  role: string;
  year: number;
  exactQuestions: string[];
  roleLevel: {
    name: string;
  };
}

interface SubTopicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubTopicPage({ params }: SubTopicPageProps) {
  const { slug } = await params;
  const data = await getSubTopicDetail(slug);

  if (!data) {
    notFound();
  }

  const { subTopic, stats, groupedCompanies, relatedSubTopics } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header section with parent area path */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold tracking-wider uppercase select-none">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{subTopic.topicArea.name}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-display font-normal text-foreground tracking-tight leading-tight">
          {subTopic.name} <span className="text-muted-foreground font-semibold text-lg block sm:inline sm:ml-2">Interview Concept</span>
        </h1>

        {/* Stats KPIs strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          <StatsKpi
            label="Companies Asking"
            value={stats.uniqueCompaniesCount}
            icon={Building2}
            colorClass="bg-primary/10 text-primary border-primary/20"
          />
          <StatsKpi
            label="Total Interviews"
            value={stats.uniqueInterviewsCount}
            icon={Layers}
            colorClass="bg-primary/10 text-primary border-primary/20"
          />
          <StatsKpi
            label="Avg Appearances"
            value={`${stats.avgTimesPerRound}x`}
            description="Per round when covered"
            icon={Tag}
            colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          />
        </div>
      </div>

      {/* Main content split */}
      {groupedCompanies.length === 0 ? (
        <EmptyState
          title="No Experiences Cover This Sub-topic Yet"
          description="Candidates haven't reported questions covering this sub-topic. Check back as new panelist reports are submitted."
          icon={HelpCircle}
        />
      ) : (
        <div className="space-y-6">
          <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
            Asked by {groupedCompanies.length} Hiring {groupedCompanies.length === 1 ? "Company" : "Companies"}
          </h3>
          
          <div className="space-y-6">
            {groupedCompanies.map(({ company, interviews, count }) => (
              <div
                key={company.id}
                className="bg-background border border-border rounded-lg p-5 md:p-6 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 space-y-4"
              >
                {/* Company Header Row */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-[6px] bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {company.logoUrl ? (
                        <Image
                          src={company.logoUrl}
                          alt={`${company.name} logo`}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <Building2 className="w-4 h-4 text-muted-foreground/60" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm sm:text-base leading-tight">
                        {company.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                        {count} interview experience{count === 1 ? "" : "s"} cover this
                      </p>
                    </div>
                  </div>

                  <Link href={`/companies/${company.slug}`}>
                    <span className="text-[11px] font-extrabold text-primary hover:text-foreground transition-colors inline-flex items-center gap-1 cursor-pointer">
                      Company Detail <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>

                {/* Interviews List */}
                <div className="pl-0 md:pl-12 space-y-4">
                  {interviews.map((interview: SubTopicInterview) => (
                    <div
                      key={interview.id}
                      className="bg-secondary/40 hover:bg-secondary/70 border border-border rounded-[6px] p-4 transition-all duration-150 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-extrabold">{interview.role}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          <span className="text-primary">{interview.roleLevel.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/65" />
                            {interview.year}
                          </span>
                          
                          <Link href={`/experiences/${interview.id}`}>
                            <span className="text-[11px] font-extrabold text-primary hover:underline cursor-pointer">
                              View infographic &rarr;
                            </span>
                          </Link>
                        </div>
                      </div>

                      {/* Render exact candidate questions if present using server-side Markdown */}
                      {interview.exactQuestions.length > 0 && (
                        <SubTopicQuestionExpandable questionCount={interview.exactQuestions.length}>
                          {interview.exactQuestions.map((q: string, idx: number) => (
                            <div key={idx} className={idx > 0 ? "mt-4 pt-4 border-t border-border" : ""}>
                              <MarkdownRenderer content={q} />
                            </div>
                          ))}
                        </SubTopicQuestionExpandable>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sibling related subtopics tag cloud */}
      {relatedSubTopics.length > 0 && (
        <div className="bg-background border border-border p-5 md:p-6 rounded-lg space-y-4 hover:shadow-sm hover:scale-[1.01] transition-all duration-200">
          <h4 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
            <Tag className="w-4 h-4 text-primary" />
            Other concepts in {subTopic.topicArea.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {relatedSubTopics.map((sibling) => (
              <SubTopicChip
                key={sibling.id}
                name={sibling.name}
                slug={sibling.slug}
                topicAreaSlug={subTopic.topicArea.slug}
                count={sibling.count > 0 ? sibling.count : undefined}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
