"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Link as LinkIcon, FileText } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { PlatformLinkChip } from "./PlatformLinkChip";
import type { InterviewDetail } from "@/lib/queries/interview-detail";

type TopicCoverage = InterviewDetail["rounds"][number]["topicCoverages"][number];

const TOPIC_AREA_COLORS: Record<string, string> = {
  "dsa-easy": "border-l-emerald-500",
  "dsa-medium": "border-l-amber-500",
  "dsa-hard": "border-l-rose-500",
  "system-design": "border-l-blue-500",
  "frontend-fundamentals": "border-l-teal-500",
  "frontend-frameworks": "border-l-teal-600",
  "backend-api": "border-l-indigo-500",
  "backend-db": "border-l-violet-500",
  "devops-cloud": "border-l-cyan-500",
  "cs-theory": "border-l-purple-500",
  "resume-projects": "border-l-pink-500",
  "puzzles-math": "border-l-orange-500",
  "behavioral-star": "border-l-rose-500",
  "hr-fit": "border-l-fuchsia-500",
  "other": "border-l-slate-400",
};

function getTopicAreaBorder(slug: string) {
  return TOPIC_AREA_COLORS[slug] || "border-l-primary";
}

function hasEntryDetails(entry: TopicCoverage["entries"][number]) {
  return !!(
    entry.exactQuestionText ||
    entry.referenceUrl ||
    entry.difficulty
  );
}

function getDifficultyStyles(difficulty: string | null | undefined) {
  switch (difficulty) {
    case "EASY":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    case "MEDIUM":
      return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    case "HARD":
      return "bg-rose-500/10 text-rose-700 border-rose-500/20";
    default:
      return "";
  }
}

export function SubTopicEntriesList({ coverages }: { coverages: TopicCoverage[] }) {
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const expandableEntryIds = useMemo(
    () =>
      coverages.flatMap((cov) =>
        cov.entries.filter(hasEntryDetails).map((entry) => entry.id),
      ),
    [coverages],
  );

  const allExpanded =
    expandableEntryIds.length > 0 &&
    expandableEntryIds.every((id) => expandedEntries[id]);

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllEntries = () => {
    if (allExpanded) {
      setExpandedEntries({});
    } else {
      setExpandedEntries(
        Object.fromEntries(expandableEntryIds.map((id) => [id, true])),
      );
    }
  };

  return (
    <div className="pl-0 md:pl-6 border-l-0 md:border-l border-border space-y-4">
      {expandableEntryIds.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleAllEntries}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-extrabold border transition-all cursor-pointer",
              allExpanded
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card hover:bg-secondary text-foreground border-border",
            )}
          >
            {allExpanded ? "Collapse all questions" : "Expand all questions"}
            {allExpanded ? (
              <ChevronUp className="size-3 ml-0.5" />
            ) : (
              <ChevronDown className="size-3 ml-0.5" />
            )}
          </button>
        </div>
      )}
      {coverages.map((cov, covIdx) => {
        const borderClass = getTopicAreaBorder(cov.topicArea.slug);
        return (
          <ScrollReveal key={cov.id} delay={covIdx * 0.05}>
            <div className={cn(
              "bg-card rounded-md border border-border border-l-4 p-5 shadow-sm space-y-4",
              borderClass
            )}>
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-foreground text-sm tracking-tight">{cov.topicArea.name}</h4>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 border border-border">
                  {cov.subTopicCount} sub-topic{cov.subTopicCount === 1 ? "" : "s"}
                </Badge>
              </div>

              {cov.entries.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No sub-topics listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {cov.entries.map((entry) => {
                    const hasDetails = hasEntryDetails(entry);
                    const isExpanded = !!expandedEntries[entry.id];
                    
                    return (
                      <div key={entry.id} className="w-full">
                        <div className="flex items-center">
                          {hasDetails ? (
                            <button
                              type="button"
                              onClick={() => toggleEntry(entry.id)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-extrabold border transition-all text-left cursor-pointer",
                                isExpanded
                                  ? "bg-foreground text-background border-foreground shadow-sm"
                                  : "bg-card hover:bg-secondary text-foreground border-border"
                              )}
                            >
                              <span>{entry.subTopic.name}</span>
                              {entry.difficulty ? (
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 ml-1 ${getDifficultyStyles(entry.difficulty)}`}
                                >
                                  {entry.difficulty}
                                </Badge>
                              ) : null}
                              {entry.exactQuestionText && <FileText className="size-3 opacity-80" />}
                              {entry.referenceUrl && <LinkIcon className="size-3 opacity-80" />}
                              {isExpanded ? <ChevronUp className="size-3 ml-0.5" /> : <ChevronDown className="size-3 ml-0.5" />}
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold bg-secondary text-muted-foreground border border-border gap-1.5">
                              {entry.subTopic.name}
                              {entry.difficulty ? (
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 ${getDifficultyStyles(entry.difficulty)}`}
                                >
                                  {entry.difficulty}
                                </Badge>
                              ) : null}
                            </span>
                          )}
                        </div>

                        {isExpanded && hasDetails && (
                          <div className="mt-2.5 p-4 bg-secondary text-foreground rounded-md shadow-inner border border-border space-y-3 max-w-3xl animate-in fade-in slide-in-from-top-2 duration-200">
                            {entry.exactQuestionText && (
                              <div className="space-y-1.5">
                                <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">
                                  Exact Question / Coding prompt
                                </h5>
                                <div className="text-foreground text-xs leading-relaxed whitespace-pre-wrap font-mono bg-card p-3 rounded-md border border-border">
                                  {entry.exactQuestionText}
                                </div>
                              </div>
                            )}

                            {entry.referenceUrl && (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Reference:
                                </span>
                                <PlatformLinkChip url={entry.referenceUrl} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
