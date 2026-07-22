import React from "react";
import Link from "next/link";
import {
  getOverviewKpis,
  getTopSubTopics,
  getSubmissionsOverTime,
  getTopCompaniesByInterviewCount,
} from "@/lib/analytics/queries";
import nextDynamic from "next/dynamic";
import { KpiCard } from "@/components/charts/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";

const LineChart = nextDynamic(
  () => import("@/components/charts/LineChart").then((mod) => mod.LineChart),
  { loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" /> }
);

const HorizontalBarChart = nextDynamic(
  () => import("@/components/charts/HorizontalBarChart").then((mod) => mod.HorizontalBarChart),
  { loading: () => <div className="h-[280px] w-full animate-pulse bg-muted rounded-lg" /> }
);
import {
  FileText,
  Layers,
  Bookmark,
  Activity,
} from "lucide-react";
import { ANALYTICS_TABS } from "./constants";

export const dynamic = "force-dynamic";

export default async function AnalyticsOverviewPage() {
  // Fetch overview data in parallel
  const [kpis, submissions, topCompanies, topSubTopics] = await Promise.all([
    getOverviewKpis(),
    getSubmissionsOverTime(26), // Last 26 weeks
    getTopCompaniesByInterviewCount(10), // Top 10 companies
    getTopSubTopics(10), // Top 10 subtopics
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="mb-4 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">
          Admin Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Translate raw student interview data into aggregated topic frequencies and insights.
        </p>
      </header>

      {/* Premium Tab-Bar Sub-Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-px mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-[600px]">
          {ANALYTICS_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.href === "/admin/analytics";
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

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Interviews"
          value={kpis.totalInterviews}
          icon={FileText}
          description="Aggregate interview entries"
          change={{ value: "+8%", type: "positive" }}
        />
        <KpiCard
          title="Interview Rounds"
          value={kpis.totalRounds}
          icon={Activity}
          description="Rounds documented in total"
        />
        <KpiCard
          title="Taxonomy Mappings"
          value={kpis.totalCoverages}
          icon={Layers}
          description="Rounds covered by topic areas"
        />
        <KpiCard
          title="Subtopic Mentions"
          value={kpis.totalEntries}
          icon={Bookmark}
          description="Aggregated concept counts"
        />
      </div>

      {/* Central Visualizations */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Timeline Chart spans 2 cols */}
        <div className="md:col-span-3">
          <ChartCard
            title="Interview Submissions Timeline"
            description="Weekly trend of compiled interview submissions (last 26 weeks)."
            csvData={submissions}
            csvHeaders={[
              { label: "Week", key: "week" },
              { label: "Submissions", key: "count" },
            ]}
          >
            <LineChart
              data={submissions}
              xKey="week"
              series={[{ key: "count", name: "Submissions" }]}
              height={300}
            />
          </ChartCard>
        </div>

        {/* Top Companies (Bar Chart) */}
        <div className="md:col-span-1.5 lg:col-span-1.5">
          <ChartCard
            title="Top Companies"
            description="Volume of interview records by company."
            csvData={topCompanies}
            csvHeaders={[
              { label: "Company", key: "name" },
              { label: "Interviews Count", key: "count" },
            ]}
          >
            <HorizontalBarChart
              data={topCompanies}
              dataKey="count"
              nameKey="name"
              color="#2D5BFF"
              height={280}
              tooltipLabel="Interviews"
            />
          </ChartCard>
        </div>

        {/* Top Subtopics (Bar Chart) */}
        <div className="md:col-span-1.5 lg:col-span-1.5 flex-1">
          <ChartCard
            title="Most Frequent Subtopics"
            description="Specific concepts requested across all rounds."
            csvData={topSubTopics}
            csvHeaders={[
              { label: "Subtopic Name", key: "name" },
              { label: "Topic Area", key: "topicAreaName" },
              { label: "Mentions Count", key: "count" },
            ]}
          >
            <HorizontalBarChart
              data={topSubTopics}
              dataKey="count"
              nameKey="name"
              color="#10B981"
              height={280}
              tooltipLabel="Mentions"
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
