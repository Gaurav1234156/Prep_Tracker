import React from "react";
import Link from "next/link";
import {
  getTopicAreaFrequency,
  getSubTopicsForTopicArea,
  getCompaniesAskingSubTopic,
} from "@/lib/analytics/queries";
import nextDynamic from "next/dynamic";
import { ANALYTICS_TABS } from "../constants";
import { TopicFilters } from "@/components/charts/TopicFilters";
import { ChartCard } from "@/components/charts/ChartCard";

const HorizontalBarChart = nextDynamic(
  () => import("@/components/charts/HorizontalBarChart").then((mod) => mod.HorizontalBarChart),
  { loading: () => <div className="h-[280px] w-full animate-pulse bg-muted rounded-lg" /> }
);

interface PageProps {
  searchParams: Promise<{
    topicAreaId?: string;
    subTopicId?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function TopicsAnalyticsPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15
  const resolvedParams = await searchParams;
  const topicAreaIdParam = resolvedParams.topicAreaId;
  const subTopicIdParam = resolvedParams.subTopicId;

  // 1. Fetch all Topic Areas
  const topicAreas = await getTopicAreaFrequency();

  // Determine active Topic Area
  const activeTopicArea =
    topicAreas.find((ta) => ta.id === topicAreaIdParam) || topicAreas[0];
  const selectedTopicAreaId = activeTopicArea?.id || "";

  // 2. Fetch all Subtopics for the active Topic Area
  const subTopics = selectedTopicAreaId
    ? await getSubTopicsForTopicArea(selectedTopicAreaId)
    : [];

  // Determine active Subtopic
  const activeSubTopic =
    subTopics.find((sub) => sub.id === subTopicIdParam) || subTopics[0];
  const selectedSubTopicId = activeSubTopic?.id || "";

  // 3. Fetch companies asking for this specific Subtopic
  const companiesAsking = selectedSubTopicId
    ? await getCompaniesAskingSubTopic(selectedSubTopicId)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="mb-4 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Topics Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Drill down from high-level topic categories into specific sub-topic concepts and the companies asking them.
        </p>
      </header>

      {/* Shared Sub-Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-px mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-[600px]">
          {ANALYTICS_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.href === "/admin/analytics/topics";
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

      {/* Interactive Selection Dropdowns */}
      <TopicFilters
        topicAreas={topicAreas}
        subTopics={subTopics}
        selectedTopicAreaId={selectedTopicAreaId}
        selectedSubTopicId={selectedSubTopicId}
      />

      {/* Data Visualization Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Subtopic distribution inside the selected Topic Area */}
        <ChartCard
          title={`${activeTopicArea?.name || "Topic Area"} Distribution`}
          description={`Frequency of specific concept mentions in rounds covering ${activeTopicArea?.name || "this area"}.`}
          isEmpty={subTopics.length === 0}
          csvData={subTopics}
          csvHeaders={[
            { label: "Subtopic Name", key: "name" },
            { label: "Mentions Count", key: "count" },
          ]}
        >
          <HorizontalBarChart
            data={subTopics}
            dataKey="count"
            nameKey="name"
            color="#3B82F6"
            height={320}
            tooltipLabel="Mentions"
          />
        </ChartCard>

        {/* Right Card: Companies asking this specific Subtopic */}
        <ChartCard
          title={`Companies Querying: ${activeSubTopic?.name || "Subtopic"}`}
          description={`Submissions mapped by companies requesting knowledge in ${activeSubTopic?.name || "this concept"}.`}
          isEmpty={companiesAsking.length === 0}
          csvData={companiesAsking}
          csvHeaders={[
            { label: "Company", key: "companyName" },
            { label: "Mentions Count", key: "count" },
          ]}
        >
          <HorizontalBarChart
            data={companiesAsking}
            dataKey="count"
            nameKey="companyName"
            color="#EC4899"
            height={320}
            tooltipLabel="Mentions"
          />
        </ChartCard>
      </div>
    </div>
  );
}
