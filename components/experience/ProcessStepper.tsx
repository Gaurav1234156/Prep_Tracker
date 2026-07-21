"use client";

import { InterviewDetail } from "@/lib/queries/interview-detail";
import { cn } from "@/lib/utils";
import { Clock, Users, Video } from "lucide-react";

type Round = InterviewDetail["rounds"][number];

function humanizeLabel(value: string): string {
  const stripped = value.replace(/Technical Round \d+: |Round \d+: /i, "").trim();
  if (!stripped.includes("_") && stripped !== stripped.toUpperCase()) {
    return stripped;
  }
  return stripped
    .replace(/_/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ProcessStepper({ rounds }: { rounds: Round[] }) {
  const handleScroll = (roundNumber: number) => {
    const el = document.getElementById(`round-${roundNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const outcomeDot: Record<string, string> = {
    CLEARED: "bg-emerald-500 ring-emerald-500/20",
    REJECTED: "bg-rose-500 ring-rose-500/20",
    PENDING: "bg-amber-500 ring-amber-500/20",
    NO_SHOW: "bg-slate-400 ring-slate-400/20",
  };

  return (
    <div className="bg-card rounded-md border border-border p-6 shadow-sm no-print">
      <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-6">
        Interview Process Steps
      </h2>

      {/* Desktop view (horizontal) */}
      <div className="hidden md:flex w-full">
        {rounds.map((round, index) => {
          const isLast = index === rounds.length - 1;
          const colorClass = outcomeDot[round.outcome] || "bg-slate-300";
          const displayName = humanizeLabel(round.roundName);

          return (
            <div key={round.id} className="flex flex-1 min-w-0 flex-col items-center">
              <div className="relative flex w-full items-center justify-center">
                {/* Connecting line from previous step */}
                {index > 0 && (
                  <div className="absolute right-1/2 left-0 top-1/2 h-px -translate-y-1/2 bg-border">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-foreground/10 rounded" />
                  </div>
                )}
                {/* Connecting line to next step */}
                {!isLast && (
                  <div className="absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-border">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-foreground/10 rounded" />
                  </div>
                )}

                {/* Bubble & Tooltip wrapper */}
                <div
                  className="relative z-10 group cursor-pointer"
                  onClick={() => handleScroll(round.roundNumber)}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-200",
                      "bg-foreground text-background hover:bg-primary hover:text-white hover:border-primary border-border"
                    )}
                  >
                    {round.roundNumber}
                  </div>

                  {/* Outcome Indicator Dot */}
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-4 border-2 border-card",
                      colorClass
                    )}
                  />

                  {/* Pure CSS Tooltip */}
                  <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-foreground text-background text-xs rounded-md shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                    <p className="font-bold text-[12px] border-b border-background/10 pb-1 mb-1.5 leading-tight">
                      {round.roundName}
                    </p>
                    <div className="space-y-1 text-background/80 leading-normal">
                      <p className="flex items-center gap-1">
                        <span className="font-semibold text-background/60">Type:</span>{" "}
                        {humanizeLabel(round.roundType)}
                      </p>
                      {round.durationMinutes && (
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{round.durationMinutes} minutes</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1">
                        <Video className="w-3 h-3 text-primary" />
                        <span>{humanizeLabel(round.mode)}</span>
                      </p>
                      {round.numInterviewers != null && (
                        <p className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-primary" />
                          <span>{round.numInterviewers} interviewer(s)</span>
                        </p>
                      )}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground" />
                  </div>
                </div>
              </div>

              {/* Title labels under step — in-flow, contained by column */}
              <button
                type="button"
                onClick={() => handleScroll(round.roundNumber)}
                className="mt-3 w-full px-1 text-center cursor-pointer"
              >
                <p className="text-[11px] font-bold text-foreground line-clamp-2 break-words leading-snug">
                  {displayName}
                </p>
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile view (vertical list) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {rounds.map((round) => {
          const colorClass = outcomeDot[round.outcome] || "bg-slate-300";
          return (
            <button
              key={round.id}
              onClick={() => handleScroll(round.roundNumber)}
              className="flex items-center gap-3 text-left p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                  {round.roundNumber}
                </div>
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 border border-card",
                    colorClass
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">
                  {humanizeLabel(round.roundName)}
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                  {[
                    humanizeLabel(round.roundType),
                    round.durationMinutes ? `${round.durationMinutes}m` : null,
                    humanizeLabel(round.mode),
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
