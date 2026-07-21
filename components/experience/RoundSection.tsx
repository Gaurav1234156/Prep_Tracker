import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { InterviewDetail } from "@/lib/queries/interview-detail";
import { cn } from "@/lib/utils";
import { Clock, Lightbulb, UserCheck, Video, Mic, FileText } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { SubTopicEntriesList } from "./SubTopicEntriesList";

type Round = InterviewDetail["rounds"][number];

export function RoundSection({ round }: { round: Round }) {
  const {
    roundNumber,
    roundName,
    roundType,
    durationMinutes,
    mode,
    numInterviewers,
    interviewStyle,
    outcome,
    keyLearnings,
    topicCoverages,
    recordingUrl,
    transcriptUrl,
    assessmentPattern,
    pocRemarks,
  } = round;

  const outcomeColors: Record<string, string> = {
    CLEARED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    NO_SHOW: "bg-secondary text-muted-foreground border-border",
  };

  const isFirst = roundNumber === 1;

  return (
    <section
      id={`round-${roundNumber}`}
      className="space-y-6 scroll-mt-20"
      data-print-break={!isFirst ? "true" : undefined}
    >
      <ScrollReveal className="bg-background rounded-lg border border-border border-l-4 border-l-primary p-5 md:p-6 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 relative overflow-hidden">
        {/* Round Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2 py-0.5 rounded-[6px] bg-foreground text-background text-[10px] font-black tracking-wider uppercase font-mono">
                Round {roundNumber}
              </span>
              <Badge variant="secondary" className="text-muted-foreground bg-secondary font-bold border-border rounded-[6px]">
                {roundType.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-bold rounded-[6px]">
                <Video className="mr-1 h-3.5 w-3.5" />
                {mode.replace(/_/g, " ")}
              </Badge>
              {durationMinutes && (
                <Badge variant="outline" className="text-muted-foreground border-border bg-card font-semibold rounded-[6px]">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {durationMinutes} mins
                </Badge>
              )}
              {numInterviewers != null && (
                <Badge variant="outline" className="text-muted-foreground border-border bg-card font-semibold rounded-[6px]">
                  <UserCheck className="mr-1 h-3.5 w-3.5" />
                  {numInterviewers} interviewer{numInterviewers === 1 ? "" : "s"}
                </Badge>
              )}
            </div>

            <h3 className="text-lg md:text-xl font-display font-bold text-foreground tracking-tight">
              {roundName}
            </h3>
          </div>

          <div className="flex-shrink-0 self-start lg:self-center">
            <span className={cn(
              "px-3 py-1 rounded-[6px] text-[11px] font-extrabold tracking-wider border",
              outcomeColors[outcome] || "bg-secondary text-muted-foreground border-border"
            )}>
              Result: <span className="uppercase">{outcome}</span>
            </span>
          </div>
        </div>

        {/* Interview Style Callout */}
        {interviewStyle && (
          <div className="mt-4 pt-3 border-t border-border text-xs text-primary font-semibold italic bg-primary/5 px-4 py-2.5 rounded-[6px] border border-primary/10">
            <span className="text-foreground/60 uppercase tracking-widest text-[9px] font-extrabold block not-italic mb-0.5">
              Interview Format & Style
            </span>
            &ldquo;{interviewStyle}&rdquo;
          </div>
        )}
      </ScrollReveal>

      {(recordingUrl || transcriptUrl) && (
        <ScrollReveal className="flex flex-wrap gap-2">
          {recordingUrl ? (
            <a
              href={recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary transition-colors"
            >
              <Mic className="h-3.5 w-3.5" />
              Interview Recording
            </a>
          ) : null}
          {transcriptUrl ? (
            <a
              href={transcriptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Interview Transcript
            </a>
          ) : null}
        </ScrollReveal>
      )}

      {assessmentPattern && (
        <ScrollReveal className="rounded-md border border-border bg-secondary/30 p-4 text-xs text-foreground">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-1">
            Assessment Pattern
          </span>
          {assessmentPattern}
        </ScrollReveal>
      )}

      {pocRemarks && (
        <ScrollReveal className="rounded-md border border-border bg-secondary/30 p-4 text-xs text-foreground italic">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-1 not-italic">
            Company Remarks
          </span>
          {pocRemarks}
        </ScrollReveal>
      )}

      {/* Sub Topic Entries List (Client-side interactive list) */}
      {topicCoverages.length > 0 && (
        <SubTopicEntriesList coverages={topicCoverages} />
      )}

      {/* Key Learnings Callout Box */}
      {keyLearnings && (
        <ScrollReveal className="bg-secondary/40 border border-border rounded-lg p-5 md:p-6 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 flex items-start gap-4 relative overflow-hidden">
          <div className="w-9 h-9 rounded-[6px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <Lightbulb className="w-4 h-4 fill-primary/10" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-1.5">
              Round Key Learnings
            </h4>
            <div className="text-foreground text-sm leading-relaxed">
              <MarkdownRenderer content={keyLearnings} />
            </div>
          </div>
        </ScrollReveal>
      )}
    </section>
  );
}
