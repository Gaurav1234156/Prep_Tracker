import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoverageGapsAnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Loading */}
      <header className="mb-4 space-y-2">
        <Skeleton className="h-8 w-56 rounded" />
        <Skeleton className="h-4 w-96 rounded" />
      </header>

      {/* Tabs Sub-Nav Loading */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-px mb-6 flex space-x-6 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="py-3 px-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Gap Sensitivity Selectors Skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <Skeleton className="h-3 w-44 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-48 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Blueprint Skeletons */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/20 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4.5 w-4.5 rounded" />
          <Skeleton className="h-4.5 w-44 rounded" />
        </div>
        <Skeleton className="h-4 w-3/4 rounded" />
        <div className="grid gap-2 sm:grid-cols-2 pt-1">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex gap-2 p-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-1/3 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Gaps Columns Loading */}
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-36 rounded" />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {Array.from({ length: 4 }).map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20"
                >
                  <Skeleton className="h-4.5 w-24 rounded" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
