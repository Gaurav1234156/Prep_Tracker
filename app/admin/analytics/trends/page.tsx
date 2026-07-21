import React from "react";
import Link from "next/link";
import { getYearlyTopicAreaDistribution } from "@/lib/analytics/queries";
import nextDynamic from "next/dynamic";
import { ANALYTICS_TABS } from "../constants";
import { ChartCard } from "@/components/charts/ChartCard";

const TrendsChart = nextDynamic(
  () => import("@/components/charts/TrendsChart").then((mod) => mod.TrendsChart),
  { loading: () => <div className="h-[360px] w-full animate-pulse bg-muted rounded-lg" /> }
);

export const dynamic = "force-dynamic";

export default async function TrendsAnalyticsPage() {
  // Fetch trend data
  const trendsData = await getYearlyTopicAreaDistribution();

  // Restructure for tabular matrix display
  const yearlyStats: Record<number, { total: number; topics: Record<string, number> }> = {};
  trendsData.forEach((row) => {
    const yr = row.year;
    if (!yearlyStats[yr]) {
      yearlyStats[yr] = { total: 0, topics: {} };
    }
    yearlyStats[yr].topics[row.topicAreaName] = row.count;
    yearlyStats[yr].total += row.count;
  });

  const uniqueTopicAreas = Array.from(new Set(trendsData.map((d) => d.topicAreaName))).sort();
  const sortedYears = Object.keys(yearlyStats)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="mb-4 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          YoY Trends Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visualize and monitor how different topic areas fluctuate year-over-year to identify shifting conceptual focus in company interviews.
        </p>
      </header>

      {/* Shared Sub-Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-px mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-[600px]">
          {ANALYTICS_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.href === "/admin/analytics/trends";
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

      {/* Section 1: YoY Stacked Area Chart */}
      <ChartCard
        title="Year-over-Year Topic Area Distribution"
        description="Stacked volume representation of topics asked in rounds, distributed across different calendar years."
        isEmpty={trendsData.length === 0}
        csvData={trendsData}
        csvHeaders={[
          { label: "Year", key: "year" },
          { label: "Topic Area", key: "topicAreaName" },
          { label: "Rounds Count", key: "count" },
        ]}
      >
        <TrendsChart data={trendsData} />
      </ChartCard>

      {/* Section 2: Tabular matrix of yearly trends */}
      <div className="rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-950 dark:text-slate-50 text-sm">
            Yearly Trend Matrix Aggregates
          </h3>
          <p className="text-xs text-slate-500">
            Absolute round volume distribution.
          </p>
        </div>

        {trendsData.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No trend aggregates found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 pl-2 font-semibold">Year</th>
                  {uniqueTopicAreas.map((t) => (
                    <th key={t} className="py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">{t}</th>
                  ))}
                  <th className="py-2.5 pr-2 text-right font-bold text-slate-800 dark:text-slate-200">Total Rounds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {sortedYears.map((year) => {
                  const stats = yearlyStats[year];
                  return (
                    <tr
                      key={year}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <td className="py-3 pl-2 font-semibold text-slate-900 dark:text-slate-100">
                        {year}
                      </td>
                      {uniqueTopicAreas.map((topic) => {
                        const count = stats.topics[topic] || 0;
                        return (
                          <td key={topic} className="py-3 text-center">
                            {count > 0 ? (
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {count}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 pr-2 text-right font-bold text-slate-900 dark:text-slate-100">
                        {stats.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
