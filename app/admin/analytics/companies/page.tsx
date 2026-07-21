import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCoverageHeatmap, getCompanyTopicProfile } from "@/lib/analytics/queries";
import nextDynamic from "next/dynamic";
import { ANALYTICS_TABS } from "../constants";
import { ChartCard } from "@/components/charts/ChartCard";

const Heatmap = nextDynamic(
  () => import("@/components/charts/Heatmap").then((mod) => mod.Heatmap),
  { loading: () => <div className="h-[350px] w-full animate-pulse bg-muted rounded-lg" /> }
);

const CompanyComparisonChart = nextDynamic(
  () => import("@/components/charts/CompanyComparisonChart").then((mod) => mod.CompanyComparisonChart),
  { loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded-lg" /> }
);

interface PageProps {
  searchParams: Promise<{
    companyIds?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function CompaniesAnalyticsPage({ searchParams }: PageProps) {
  // Await Next.js 15 searchParams
  const resolvedParams = await searchParams;
  const companyIdsParam = resolvedParams.companyIds;

  // 1. Fetch entire heatmap matrix data
  const heatmapData = await getCoverageHeatmap();

  // 2. Fetch list of all companies for the selection picker
  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Parse or default selected company IDs (default to top 3 companies if empty)
  const selectedCompanyIds = companyIdsParam
    ? companyIdsParam.split(",").filter(Boolean)
    : allCompanies.slice(0, 3).map((c) => c.id);

  // 3. Fetch comparative profiles for selected companies
  const comparisonData = selectedCompanyIds.length
    ? await getCompanyTopicProfile(selectedCompanyIds)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="mb-4 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Companies Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Map out the interview topic landscape across companies using our coverage heatmap or conduct detailed cross-organizational comparisons.
        </p>
      </header>

      {/* Shared Sub-Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-px mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-[600px]">
          {ANALYTICS_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.href === "/admin/analytics/companies";
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

      {/* Section A: Comprehensive Heatmap Grid */}
      <ChartCard
        title="Company-Topic Coverage Matrix"
        description="A grid mapping every company against round count per topic area. Darker cells signify higher density."
        isEmpty={heatmapData.length === 0}
        csvData={heatmapData}
        csvHeaders={[
          { label: "Company", key: "companyName" },
          { label: "Topic Area", key: "topicAreaName" },
          { label: "Round Count", key: "count" },
        ]}
      >
        <Heatmap data={heatmapData} />
      </ChartCard>

      {/* Section B: Comparative side-by-side analysis */}
      {allCompanies.length > 0 && (
        <CompanyComparisonChart
          allCompanies={allCompanies}
          selectedCompanyIds={selectedCompanyIds}
          comparisonData={comparisonData}
        />
      )}
    </div>
  );
}
