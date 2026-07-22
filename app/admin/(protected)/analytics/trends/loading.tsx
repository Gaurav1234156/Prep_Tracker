import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendsAnalyticsLoading() {
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
        <div className="flex items-end gap-3 h-[280px] pt-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="w-full rounded-t"
              style={{
                height: `${Math.floor(Math.random() * 50) + 30}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Matrix Table Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4">
        <Skeleton className="h-4.5 w-44 rounded" />
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
