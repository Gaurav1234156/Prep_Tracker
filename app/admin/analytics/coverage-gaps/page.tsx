import React from "react";
import Link from "next/link";
import { getCoverageGaps } from "@/lib/analytics/queries";
import { ANALYTICS_TABS } from "../constants";
import { GapFilters } from "@/components/charts/GapFilters";
import {
  Clock,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    threshold?: string;
    staleMonths?: string;
  }>;
}

export default async function CoverageGapsAnalyticsPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15
  const resolvedParams = await searchParams;
  const threshold = resolvedParams.threshold ? parseInt(resolvedParams.threshold, 10) : 5;
  const staleMonths = resolvedParams.staleMonths ? parseInt(resolvedParams.staleMonths, 10) : 6;

  // Fetch coverage gaps
  const { thinTopicAreas, staleCompanies, thinRoleLevels } = await getCoverageGaps(
    threshold,
    staleMonths
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="mb-4 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Coverage Gaps Discovery
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Surface weak points in our data model coverage, locate inactive organizations, and plan structured interview submissions.
        </p>
      </header>

      {/* Shared Sub-Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-px mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-[600px]">
          {ANALYTICS_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.href === "/admin/analytics/coverage-gaps";
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-all ${
                  isActive
                    ? "border-brand-primary text-brand-primary dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Gap Sensitivity Selectors */}
      <GapFilters threshold={threshold} staleMonths={staleMonths} />

      {/* Structured Actionable Callouts Panel */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 dark:border-amber-500/20 dark:bg-amber-950/10 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">
            Content Acquisition Blueprint
          </h3>
        </div>
        <p className="text-xs text-amber-700/90 dark:text-amber-300/80 max-w-3xl leading-relaxed">
          Based on aggregate statistics, our content team should prioritize the following actions to ensure the platform remains fresh and highly comprehensive:
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
          {thinTopicAreas.length > 0 && (
            <li className="flex gap-2 items-start bg-white/40 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/30">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold">1</span>
              <span>
                <strong>Fill Topic Vacuums:</strong> Solicit submissions mapping to{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {thinTopicAreas.map((x) => x.name).slice(0, 3).join(", ")}
                </span>{" "}
                which currently have less than {threshold} rounds documented.
              </span>
            </li>
          )}
          {staleCompanies.length > 0 && (
            <li className="flex gap-2 items-start bg-white/40 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/30">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold">2</span>
              <span>
                <strong>Re-engage Alumni:</strong> Contact users working at{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {staleCompanies.map((x) => x.name).slice(0, 3).join(", ")}
                </span>{" "}
                to obtain fresh interview experience files since no updates were received in the last {staleMonths} months.
              </span>
            </li>
          )}
          {thinRoleLevels.length > 0 && (
            <li className="flex gap-2 items-start bg-white/40 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/30">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold">3</span>
              <span>
                <strong>Diversify Difficulties:</strong> Solicit details from senior/junior segments to build complete pathways for underrepresented{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {thinRoleLevels.map((x) => x.name).join(", ")}
                </span>{" "}
                levels.
              </span>
            </li>
          )}
          <li className="flex gap-2 items-start bg-white/40 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/30">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold">4</span>
            <span>
              <strong>Verify Taxonomy:</strong> Encourage administrators to review unassigned rounds to resolve gaps.
            </span>
          </li>
        </ul>
      </div>

      {/* Main Gaps Panels */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Panel 1: Thin Topic Areas */}
        <div className="rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                Thin Topic Areas
              </h3>
              <p className="text-[10px] text-slate-500">
                Topics with &lt; {threshold} coverage rounds
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {thinTopicAreas.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-slate-400 text-xs">
                All topic areas satisfy threshold!
              </div>
            ) : (
              thinTopicAreas.map((ta) => (
                <div
                  key={ta.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/20 text-xs font-semibold"
                >
                  <span className="text-slate-800 dark:text-slate-200">{ta.name}</span>
                  <span className="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 font-bold dark:bg-rose-950/30 dark:text-rose-400 text-[10px]">
                    {ta.count} {ta.count === 1 ? "round" : "rounds"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Stale Companies */}
        <div className="rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                Inactive Companies
              </h3>
              <p className="text-[10px] text-slate-500">
                No submissions in {staleMonths} months
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {staleCompanies.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-slate-400 text-xs">
                No inactive companies found!
              </div>
            ) : (
              staleCompanies.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/20 text-xs font-semibold"
                >
                  <span className="text-slate-800 dark:text-slate-200">{c.name}</span>
                  <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 font-bold dark:bg-amber-950/30 dark:text-amber-400 text-[10px]">
                    {c.count} total experiences
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 3: Thin Role Levels */}
        <div className="rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                Under-represented Levels
              </h3>
              <p className="text-[10px] text-slate-500">
                Levels with &lt; {threshold} total interviews
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {thinRoleLevels.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-slate-400 text-xs">
                All role levels satisfy threshold!
              </div>
            ) : (
              thinRoleLevels.map((rl) => (
                <div
                  key={rl.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/20 text-xs font-semibold"
                >
                  <span className="text-slate-800 dark:text-slate-200">{rl.name}</span>
                  <span className="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 font-bold dark:bg-rose-950/30 dark:text-rose-400 text-[10px]">
                    {rl.count} {rl.count === 1 ? "interview" : "interviews"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
