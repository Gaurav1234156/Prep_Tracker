import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoleLevelsAnalyticsLoading() {
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

      {/* Stacked Chart Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>
        <div className="h-[280px] flex flex-col justify-center space-y-6 pt-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <Skeleton className="h-4 w-16 rounded" />
              <div className="flex-1 flex gap-1 h-5">
                <Skeleton className="h-full rounded-l" style={{ width: "45%" }} />
                <Skeleton className="h-full" style={{ width: "25%" }} />
                <Skeleton className="h-full" style={{ width: "15%" }} />
                <Skeleton className="h-full rounded-r" style={{ width: "15%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matrix Table Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4">
        <Skeleton className="h-4.5 w-36 rounded" />
        <div className="space-y-3">
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          {Array.from({ length: 3 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-4 items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
