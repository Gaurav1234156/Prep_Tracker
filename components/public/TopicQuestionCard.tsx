import Link from "next/link";
import { Calendar, ArrowUpRight, Tag, ExternalLink } from "lucide-react";

import { CompanyLogo } from "@/components/common/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { MarkdownRendererPlain } from "@/components/MarkdownRenderer";
import type { TopicAreaQuestion } from "@/lib/queries/topic-area-detail";

/**
 * Server-rendered so the question Markdown is turned into HTML on the server.
 * The instances are passed as nodes into the client explorer for filtering.
 */
export function TopicQuestionCard({ q }: { q: TopicAreaQuestion }) {
  return (
    <article className="bg-background border border-border rounded-lg p-5 md:p-6 space-y-4 hover:shadow-sm transition-all duration-150">
      {/* Label row: company + role + year */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo
            name={q.company.name}
            website={q.company.websiteUrl}
            logoUrl={q.company.logoUrl}
            size="sm"
          />
          <div className="min-w-0">
            <Link
              href={`/companies/${q.company.slug}`}
              className="font-extrabold text-foreground text-sm leading-tight hover:text-primary transition-colors"
            >
              {q.company.name}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-bold text-muted-foreground">
              <span className="text-foreground/80 truncate">{q.role}</span>
              <span className="w-1 h-1 rounded-full bg-border shrink-0" />
              <span className="text-primary shrink-0">{q.roleLevel.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/65" />
            {q.year}
          </span>
          <Link
            href={`/experiences/${q.interviewId}`}
            className="text-[11px] font-extrabold text-primary hover:underline inline-flex items-center gap-0.5"
          >
            Experience <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Sub-topic tag */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/sub-topics/${q.subTopic.slug}`}>
          <Badge variant="secondary" className="gap-1">
            <Tag className="w-3 h-3" />
            {q.subTopic.name}
          </Badge>
        </Link>
        {q.referenceUrl ? (
          <a
            href={q.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-3 h-3" />
            Reference
          </a>
        ) : null}
      </div>

      {/* Question text */}
      <div className="text-sm text-foreground leading-relaxed">
        <MarkdownRendererPlain content={q.question} />
      </div>
    </article>
  );
}
