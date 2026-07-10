/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Layers,
  Lightbulb,
} from "lucide-react";

import { CompanyLogo } from "@/components/common/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/experience/BookmarkButton";

interface InterviewCardProps {
  interview: {
    id: string;
    role: string;
    year: number;
    totalSelected?: number | null;
    biggestTip?: string | null;
    publishedAt: Date;
    company: {
      name: string;
      logoUrl?: string | null;
      slug: string;
      websiteUrl?: string | null;
    };
    roleLevel: {
      name: string;
    };
    _count?: {
      rounds: number;
    } | null;
    rounds?: any[];
  };
  bookmarkedIds?: Set<string>;
  isAuthenticated?: boolean;
}

export function InterviewCard({
  interview,
  bookmarkedIds,
  isAuthenticated,
}: InterviewCardProps) {
  const roundCount = interview._count?.rounds ?? interview.rounds?.length ?? 0;
  const tipPreview = interview.biggestTip
    ? interview.biggestTip.length > 110
      ? `${interview.biggestTip.slice(0, 110)}…`
      : interview.biggestTip
    : null;

  const showBookmark = bookmarkedIds !== undefined;
  const isBookmarked = bookmarkedIds?.has(interview.id) ?? false;

  return (
    <Link
      href={`/experiences/${interview.id}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-background-elevated p-6 transition-all duration-150 hover:border-border-strong hover:shadow-sm"
    >
      {showBookmark ? (
        <div className="absolute right-3 top-3 z-10">
          <BookmarkButton
            interviewId={interview.id}
            initialBookmarked={isBookmarked}
            isAuthenticated={!!isAuthenticated}
            variant="icon"
          />
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo
            name={interview.company.name}
            website={interview.company.websiteUrl}
            logoUrl={interview.company.logoUrl}
            size="sm"
          />
          <div className="min-w-0">
            <span className="block truncate text-xs font-medium text-brand">
              {interview.company.name}
            </span>
            <h4 className="line-clamp-1 text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-brand">
              {interview.role}
            </h4>
          </div>
          {!showBookmark ? (
            <Badge variant="secondary" className="ml-auto self-start">
              {interview.roleLevel.name}
            </Badge>
          ) : null}
        </div>

        {tipPreview ? (
          <div className="flex gap-2.5 rounded-md border border-border bg-background-subtle p-3 text-sm text-foreground">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p className="line-clamp-2 leading-relaxed italic">
              &ldquo;{tipPreview}&rdquo;
            </p>
          </div>
        ) : (
          <div className="h-12" aria-hidden />
        )}
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {roundCount} {roundCount === 1 ? "round" : "rounds"}
            </span>
            {interview.totalSelected != null && interview.totalSelected > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-success/20 bg-success-subtle px-1.5 py-0.5 text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                {interview.totalSelected} selected
              </span>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {interview.year}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-foreground-muted">
            {new Date(interview.publishedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-brand transition-transform duration-150 group-hover:translate-x-0.5">
            Read <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
