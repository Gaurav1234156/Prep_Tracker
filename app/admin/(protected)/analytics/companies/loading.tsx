import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesAnalyticsLoading() {
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

      {/* Section A: Heatmap Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3.5 w-80 rounded" />
        </div>
        <div className="space-y-2 pt-2">
          {/* Header Row */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[180px] rounded" />
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 flex-1 rounded" />
            ))}
          </div>
          {/* Data Rows */}
          {Array.from({ length: 5 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-2">
              <Skeleton className="h-11 w-[180px] rounded" />
              {Array.from({ length: 4 }).map((_, colIdx) => (
                <Skeleton key={colIdx} className="h-11 flex-1 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Picker grid skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-44 rounded" />
          <Skeleton className="h-3 w-[300px] rounded" />
        </div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-5 pt-2">
          {Array.from({ length: 10 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
