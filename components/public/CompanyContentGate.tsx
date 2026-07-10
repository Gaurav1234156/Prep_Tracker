"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Lock, TrendingUp } from "lucide-react";

import { CompanyIntelligencePanel } from "@/components/public/CompanyIntelligencePanel";
import { CompanyTabs } from "@/components/public/CompanyTabs";
import { Button } from "@/components/ui/button";
import type { CompanyIntelligence } from "@/lib/queries/company-intelligence";
import type { CompanyTabInterview } from "@/lib/queries/company-content";

function ContentSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-48 rounded-md border border-border bg-card animate-pulse" />
      <div className="h-96 rounded-md border border-border bg-card animate-pulse flex items-center justify-center text-xs text-muted-foreground/50 font-bold">
        Loading company experiences and analytics...
      </div>
    </div>
  );
}

interface CompanyContentGateProps {
  companySlug: string;
  companyName: string;
  hasContent: boolean;
}

type GateState =
  | { status: "loading" }
  | { status: "sign_in_required" }
  | { status: "daily_limit_reached" }
  | { status: "error" }
  | {
      status: "success";
      intelligence: CompanyIntelligence | null;
      interviews: CompanyTabInterview[];
      roleLevels: { id: string; name: string }[];
      remaining: number | null;
    };

function ContentGateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Company Insights
        </h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{title}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

export function CompanyContentGate({
  companySlug,
  companyName,
  hasContent,
}: CompanyContentGateProps) {
  const [state, setState] = useState<GateState>(() =>
    hasContent ? { status: "loading" } : { status: "error" },
  );

  useEffect(() => {
    if (!hasContent) return;

    let cancelled = false;

    async function loadContent() {
      try {
        const response = await fetch(
          `/api/companies/${encodeURIComponent(companySlug)}/content`,
        );

        if (response.status === 401) {
          if (!cancelled) setState({ status: "sign_in_required" });
          return;
        }

        if (response.status === 403) {
          if (!cancelled) setState({ status: "daily_limit_reached" });
          return;
        }

        if (!response.ok) {
          if (!cancelled) setState({ status: "error" });
          return;
        }

        const data = (await response.json()) as {
          intelligence: CompanyIntelligence | null;
          interviews: CompanyTabInterview[];
          roleLevels: { id: string; name: string }[];
          remaining: number | null;
        };

        if (!cancelled) {
          setState({
            status: "success",
            intelligence: data.intelligence,
            interviews: data.interviews,
            roleLevels: data.roleLevels,
            remaining: data.remaining,
          });
        }
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [companySlug, hasContent]);

  if (!hasContent) return null;
  if (state.status === "loading") return <ContentSkeleton />;

  const nextPath = `/companies/${companySlug}`;

  if (state.status === "sign_in_required") {
    return (
      <ContentGateCard
        title="Sign in to view company insights"
        description={`Hiring intelligence, experiences, topic trends, and tips for ${companyName} are available to signed-in users.`}
        action={
          <Button size="sm" render={<Link href={`/login?next=${encodeURIComponent(nextPath)}`} />}>
            Sign in
          </Button>
        }
      />
    );
  }

  if (state.status === "daily_limit_reached") {
    return (
      <ContentGateCard
        title="You've viewed 2 companies today"
        description="Your daily company content limit resets at midnight IST. Come back tomorrow to explore more companies."
      />
    );
  }

  if (state.status === "error") {
    return (
      <ContentGateCard
        title="Couldn't load company content"
        description="Something went wrong while fetching company data. Please refresh and try again."
      />
    );
  }

  const tabsInterviews = state.interviews.map((interview) => ({
    ...interview,
    publishedAt: new Date(interview.publishedAt),
  }));

  return (
    <div className="space-y-8">
      {state.remaining != null && state.remaining > 0 ? (
        <p className="text-xs text-muted-foreground">
          {state.remaining} of 2 companies remaining today
        </p>
      ) : null}

      {state.intelligence ? (
        <CompanyIntelligencePanel
          intelligence={state.intelligence}
          companyName={companyName}
        />
      ) : null}

      {state.interviews.length > 0 ? (
        <CompanyTabs
          interviews={tabsInterviews}
          roleLevels={state.roleLevels}
        />
      ) : null}
    </div>
  );
}
