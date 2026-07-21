import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AssetDownloads } from "@/components/experience/AssetDownloads";
import { BiggestTipCallout } from "@/components/experience/BiggestTipCallout";
import { ExperienceHero } from "@/components/experience/ExperienceHero";
import { ProcessStepper } from "@/components/experience/ProcessStepper";
import { RecentlyViewedTracker } from "@/components/experience/RecentlyViewedTracker";
import { RelatedExperiences } from "@/components/experience/RelatedExperiences";
import { RoundSection } from "@/components/experience/RoundSection";
import { TopicCloud } from "@/components/experience/TopicCloud";
import { formatDailyCompanyLimitUsage } from "@/lib/intelligence/messages";
import type { InterviewDetail } from "@/lib/queries/interview-detail";

const TopicAreaDistribution = dynamic(
  () =>
    import("@/components/experience/TopicAreaDistribution").then(
      (mod) => mod.TopicAreaDistribution,
    ),
  {
    loading: () => (
      <div className="h-64 bg-card border border-border rounded-md animate-pulse flex items-center justify-center text-xs text-muted-foreground/50 font-bold">
        Loading visual taxonomy distribution...
      </div>
    ),
  },
);

interface ExperienceDetailViewProps {
  interview: InterviewDetail;
  bookmarked: boolean;
  remaining: number | null;
  showBookmark?: boolean;
}

export function ExperienceDetailView({
  interview,
  bookmarked,
  remaining,
  showBookmark = true,
}: ExperienceDetailViewProps) {
  return (
    <article className="min-h-screen bg-background pb-20 font-sans antialiased text-foreground selection:bg-primary/10 selection:text-primary">
      <RecentlyViewedTracker interviewId={interview.id} />
      <ExperienceHero
        interview={interview}
        bookmarked={bookmarked}
        isAuthenticated
        showBookmark={showBookmark}
      />
      {remaining != null ? (
        <p className="container mx-auto max-w-6xl px-4 pt-6 text-sm font-semibold text-foreground">
          {formatDailyCompanyLimitUsage(remaining)}
        </p>
      ) : null}
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
        <ProcessStepper rounds={interview.rounds} />

        <section className="space-y-10">
          {interview.rounds.map((round) => (
            <RoundSection key={round.id} round={round} />
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <TopicCloud rounds={interview.rounds} />
          <TopicAreaDistribution rounds={interview.rounds} />
        </section>

        <BiggestTipCallout interview={interview} />

        <AssetDownloads
          interviewAssets={interview.assets}
          roundAssets={interview.rounds.flatMap((r) => r.assets)}
        />

        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 w-48 bg-slate-200/50 rounded animate-pulse" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-slate-200/50 border border-border rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          }
        >
          <RelatedExperiences interview={interview} />
        </Suspense>
      </div>
    </article>
  );
}
