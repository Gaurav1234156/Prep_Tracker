import { Calendar, Users } from "lucide-react";

import { CompanyLogo } from "@/components/common/CompanyLogo";
import { BookmarkButton } from "@/components/experience/BookmarkButton";
import { InterviewDetail } from "@/lib/queries/interview-detail";

export function ExperienceHero({
  interview,
  bookmarked = false,
  isAuthenticated = false,
}: {
  interview: InterviewDetail;
  bookmarked?: boolean;
  isAuthenticated?: boolean;
}) {
  const { company, role, roleLevel, year, totalSelected } = interview;

  return (
    <header className="relative isolate overflow-hidden text-slate-200">
      {/* Dark diagonal gradient — slate / charcoal tones with a hint of indigo. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(225 25% 10%) 0%, hsl(232 22% 16%) 38%, hsl(228 20% 12%) 70%, hsl(220 18% 7%) 100%)",
        }}
      />
      {/* Subtle indigo glow at top-left so the band isn't dead-flat black */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 0% 0%, hsl(234 70% 35% / 0.22), transparent 70%)",
        }}
      />
      {/* Faint cool shadow at bottom-right for asymmetry */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 50% at 100% 100%, hsl(255 40% 30% / 0.20), transparent 70%)",
        }}
      />
      {/* Deep vignette at the bottom-left to anchor the band */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 40% at 0% 100%, hsl(220 30% 4% / 0.55), transparent 70%)",
        }}
      />
      {/* Faint dot grid for designed-surface texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Bottom hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-white/10"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-5 sm:gap-6">
            {/* Highlighted logo — bright white tile pops against the dark band */}
            <div className="relative shrink-0">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-2xl bg-white/15 blur-xl"
              />
              <CompanyLogo
                name={company.name}
                website={company.websiteUrl}
                logoUrl={company.logoUrl}
                size="lg"
                className="relative bg-white p-2 ring-1 ring-white/30 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              {/* Eyebrow — muted slate, not bright */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {company.name}
              </p>

              {/* Headline — off-white slate-50, the focal point */}
              <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-tight text-slate-50 sm:text-5xl md:text-[56px] md:leading-[1.02]">
                {role}
              </h1>

              {/* Meta chips — neutral grey tints */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center rounded-md bg-slate-700/60 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-200 ring-1 ring-slate-500/30">
                  {roleLevel.name}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-slate-500/25">
                  <Calendar className="h-3.5 w-3.5" />
                  {year}
                </span>
                {totalSelected != null && totalSelected > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-900/40 px-2.5 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-500/30">
                    <Users className="h-3.5 w-3.5" />
                    {totalSelected} selected
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="shrink-0 md:self-start">
            <BookmarkButton
              interviewId={interview.id}
              initialBookmarked={bookmarked}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
