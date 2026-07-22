import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopicsAnalyticsLoading() {
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

      {/* Filter panel skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Visualizations Grid Loading */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-3.5 w-64 rounded" />
            </div>
            <div className="space-y-3.5 pt-2">
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton
                    className="h-4 rounded-md flex-1"
                    style={{
                      width: `${Math.floor(Math.random() * 50) + 30}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
