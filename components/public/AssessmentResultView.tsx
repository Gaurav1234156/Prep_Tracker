"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lightbulb, Sparkles, TrendingDown } from "lucide-react";

import { InlineSpinner } from "@/components/loading/InlineSpinner";

type ResultData = {
  userTotalScore: number;
  assessmentTotalScore: number;
  timeSpentInSeconds: number;
  summary: string;
  strengths: { topic: string; accuracyPercentage: number }[];
  weaknesses: { topic: string; accuracyPercentage: number }[];
  recommendations: string[];
};

type ViewState =
  | { status: "loading" }
  | { status: "not_available"; message: string }
  | { status: "error"; message: string }
  | { status: "success"; data: ResultData };

function ResultCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function ResultMessageCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-6 text-center space-y-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function AssessmentResultView() {
  const [state, setState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/assessment-result");
        const body = await res.json().catch(() => null);

        if (res.status === 404) {
          if (!cancelled) {
            setState({
              status: "not_available",
              message:
                body?.message ??
                "Results not available yet. Make sure the assessment has been attempted.",
            });
          }
          return;
        }

        if (!res.ok) {
          if (!cancelled) {
            setState({
              status: "error",
              message:
                body?.message ?? "Something went wrong while loading your results.",
            });
          }
          return;
        }

        if (!cancelled) {
          setState({ status: "success", data: body as ResultData });
        }
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Something went wrong while loading your results.",
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-12 text-sm text-muted-foreground">
        <InlineSpinner className="h-5 w-5" />
        Generating your result summary...
      </div>
    );
  }

  if (state.status === "not_available") {
    return (
      <ResultMessageCard
        title="Results not available yet"
        description={state.message}
      />
    );
  }

  if (state.status === "error") {
    return (
      <ResultMessageCard
        title="Couldn't load your results"
        description={state.message}
      />
    );
  }

  const { data } = state;
  const accuracyPercentage =
    data.assessmentTotalScore > 0
      ? Math.round((data.userTotalScore / data.assessmentTotalScore) * 100)
      : 0;
  const minutesSpent = Math.round(data.timeSpentInSeconds / 60);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overall Score
            </p>
            <p className="text-3xl font-black text-foreground tracking-tight">
              {data.userTotalScore} / {data.assessmentTotalScore}
              <span className="ml-2 text-base font-semibold text-muted-foreground">
                ({accuracyPercentage}%)
              </span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Time spent: {minutesSpent} min
          </p>
        </div>
        <p className="mt-4 text-sm text-foreground/90 border-t border-border pt-4">
          {data.summary}
        </p>
      </section>

      <ResultCard title="Strengths" icon={CheckCircle2}>
        {data.strengths.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No standout strengths identified yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.strengths.map((s) => (
              <li
                key={s.topic}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/10 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">
                  {s.topic}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {s.accuracyPercentage.toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </ResultCard>

      <ResultCard title="Weaknesses" icon={TrendingDown}>
        {data.weaknesses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No significant weak areas identified.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.weaknesses.map((w) => (
              <li
                key={w.topic}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/10 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">
                  {w.topic}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {w.accuracyPercentage.toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </ResultCard>

      <ResultCard title="Recommendations" icon={Lightbulb}>
        {data.recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No specific recommendations at this time.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground/90">{rec}</span>
              </li>
            ))}
          </ul>
        )}
      </ResultCard>
    </div>
  );
}