import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsOverviewLoading() {
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

      {/* KPI Cards Loading */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-background p-5 shadow-sm space-y-3 dark:border-border dark:bg-background"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-8 w-8 rounded-[6px]" />
            </div>
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Visualizations Grid Loading */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Timeline Chart spans 3 cols */}
        <div className="md:col-span-3">
          <div className="rounded-lg border border-border bg-background p-5 dark:border-border dark:bg-background space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
            <div className="flex items-end gap-3 h-[240px] pt-4">
              {Array.from({ length: 20 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.floor(Math.random() * 60) + 20}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2 Bar Charts */}
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="md:col-span-1.5 lg:col-span-1.5 rounded-lg border border-border bg-background p-5 dark:border-border dark:bg-background space-y-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-3.5 w-48 rounded" />
            </div>
            <div className="space-y-3.5 pt-2">
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton
                    className="h-4 rounded-[6px] flex-1"
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
