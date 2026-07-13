import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  CTC_RANGE_OPTIONS,
  paramsToCtcRangeId,
} from "@/lib/constants/ctc-ranges";
import { inferRoleLevel } from "@/lib/imports/intelligence-mapping";

export type FilteredRoleIntelligence = {
  roleNames: string[];
  ctcLabel: string | null;
  topTopics: string[];
  topTechStacks: string[];
  avgCgpa: number | null;
  topRoundTypes: string[];
  interviewCount: number;
};

interface FilteredRoleIntelligenceParams {
  roleLevelIds: string[];
  ctcMin?: number;
  ctcMax?: number;
}

function buildCompanyCtcFilter(ctcMin?: number, ctcMax?: number) {
  if (ctcMin == null && ctcMax == null) return undefined;

  const ctcFilters: object[] = [];
  const singleCtc: Record<string, number> = {};
  if (ctcMin != null) singleCtc.gte = ctcMin;
  if (ctcMax != null) singleCtc.lte = ctcMax;
  ctcFilters.push({ ctc: singleCtc });

  const rangeFilter: Record<string, object> = {};
  if (ctcMin != null) rangeFilter.ctcMax = { gte: ctcMin };
  if (ctcMax != null) rangeFilter.ctcMin = { lte: ctcMax };
  if (Object.keys(rangeFilter).length > 0) {
    ctcFilters.push(rangeFilter);
  }

  return { OR: ctcFilters };
}

function buildInterviewWhere(
  roleLevelIds: string[],
  ctcMin?: number,
  ctcMax?: number,
) {
  const companyFilter = buildCompanyCtcFilter(ctcMin, ctcMax);
  return {
    roleLevelId: { in: roleLevelIds },
    ...(companyFilter ? { company: companyFilter } : {}),
  };
}

function getCtcLabel(ctcMin?: number, ctcMax?: number): string | null {
  if (ctcMin == null && ctcMax == null) return null;

  const id = paramsToCtcRangeId(
    ctcMin != null ? String(ctcMin) : null,
    ctcMax != null ? String(ctcMax) : null,
  );

  if (id) {
    const option = CTC_RANGE_OPTIONS.find((o) => o.id === id);
    if (option) return `${option.label} LPA`;
  }

  if (ctcMin != null && ctcMax != null) return `${ctcMin}–${ctcMax} LPA`;
  if (ctcMin != null) return `${ctcMin}+ LPA`;
  if (ctcMax != null) return `up to ${ctcMax} LPA`;
  return null;
}

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function formatRoleNames(names: string[]): string {
  if (names.length === 0) return "these";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function humanizeRoundType(roundType: string): string {
  return roundType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildFilterSummaryText(
  data: FilteredRoleIntelligence,
): string[] {
  const lines: string[] = [];
  const roleLabel = formatRoleNames(data.roleNames);
  const ctcPart = data.ctcLabel ? ` in the ${data.ctcLabel} band` : "";

  if (data.topTopics.length > 0) {
    lines.push(
      `For ${roleLabel} roles${ctcPart}, interviews most commonly focus on ${formatList(data.topTopics.slice(0, 3))}.`,
    );
  } else if (data.interviewCount > 0) {
    lines.push(
      `For ${roleLabel} roles${ctcPart}, we have ${data.interviewCount} candidate experience${data.interviewCount === 1 ? "" : "s"} to explore.`,
    );
  }

  const roundLabel =
    data.topRoundTypes.length > 0
      ? formatList(
          data.topRoundTypes.slice(0, 2).map((rt) => humanizeRoundType(rt)),
        )
      : null;
  const techLabel =
    data.topTechStacks.length > 0
      ? formatList(data.topTechStacks.slice(0, 4))
      : null;

  if (roundLabel && techLabel) {
    lines.push(
      `Expect ${roundLabel} rounds; common stacks include ${techLabel}.`,
    );
  } else if (roundLabel) {
    lines.push(`Expect ${roundLabel} rounds.`);
  } else if (techLabel) {
    lines.push(`Common tech stacks include ${techLabel}.`);
  }

  if (data.avgCgpa != null) {
    lines.push(
      `Candidates in our experiences averaged ~${data.avgCgpa.toFixed(1)} CGPA.`,
    );
  }

  return lines.slice(0, 3);
}

async function fetchFilteredRoleIntelligence({
  roleLevelIds,
  ctcMin,
  ctcMax,
}: FilteredRoleIntelligenceParams): Promise<FilteredRoleIntelligence | null> {
  if (roleLevelIds.length === 0) return null;

  const interviewWhere = buildInterviewWhere(roleLevelIds, ctcMin, ctcMax);

  const [
    roleLevels,
    interviewCount,
    topicGroups,
    roundGroups,
    cgpaAgg,
    matchingInterviews,
  ] = await Promise.all([
    prisma.roleLevel.findMany({
      where: { id: { in: roleLevelIds } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.interview.count({ where: interviewWhere }),
    prisma.topicCoverage.groupBy({
      by: ["topicAreaId"],
      where: { round: { interview: interviewWhere } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.round.groupBy({
      by: ["roundType"],
      where: { interview: interviewWhere },
      _count: { roundType: true },
      orderBy: { _count: { roundType: "desc" } },
      take: 3,
    }),
    prisma.interview.aggregate({
      where: { ...interviewWhere, candidateCgpa: { not: null } },
      _avg: { candidateCgpa: true },
      _count: { candidateCgpa: true },
    }),
    prisma.interview.findMany({
      where: interviewWhere,
      select: { companyId: true },
      distinct: ["companyId"],
    }),
  ]);

  const topicAreaIds = topicGroups.map((g) => g.topicAreaId);
  const topicAreas =
    topicAreaIds.length > 0
      ? await prisma.topicArea.findMany({
          where: { id: { in: topicAreaIds } },
          select: { id: true, name: true },
        })
      : [];
  const topicNameById = new Map(topicAreas.map((ta) => [ta.id, ta.name]));
  const topTopics = topicGroups
    .map((g) => topicNameById.get(g.topicAreaId))
    .filter((name): name is string => Boolean(name));

  const roleNames = roleLevels.map((rl) => rl.name);
  const roleNameSet = new Set(roleNames);

  const companyIds = matchingInterviews.map((i) => i.companyId);
  const jobs =
    companyIds.length > 0
      ? await prisma.job.findMany({
          where: { companyId: { in: companyIds } },
          select: { role: true, techStack: true, optionalSkills: true },
        })
      : [];

  const techCounts = new Map<string, number>();
  for (const job of jobs) {
    if (!roleNameSet.has(inferRoleLevel(job.role))) continue;

    const skills: string[] = [];
    if (job.techStack) {
      job.techStack.split(/[;,]/).forEach((t) => {
        const s = t.trim();
        if (s) skills.push(s);
      });
    }
    if (job.optionalSkills) {
      job.optionalSkills.split(/[;,]/).forEach((t) => {
        const s = t.trim();
        if (s) skills.push(s);
      });
    }

    for (const skill of skills) {
      techCounts.set(skill, (techCounts.get(skill) ?? 0) + 1);
    }
  }

  const topTechStacks = [...techCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  const avgCgpa =
    cgpaAgg._count.candidateCgpa >= 3 && cgpaAgg._avg.candidateCgpa != null
      ? cgpaAgg._avg.candidateCgpa
      : null;

  return {
    roleNames,
    ctcLabel: getCtcLabel(ctcMin, ctcMax),
    topTopics,
    topTechStacks,
    avgCgpa,
    topRoundTypes: roundGroups.map((g) => g.roundType),
    interviewCount,
  };
}

export async function getFilteredRoleIntelligence(
  params: FilteredRoleIntelligenceParams,
): Promise<FilteredRoleIntelligence | null> {
  const { roleLevelIds, ctcMin, ctcMax } = params;
  if (roleLevelIds.length === 0) return null;

  const sortedIds = [...roleLevelIds].sort().join(",");
  const cacheKey = [
    "filtered-role-intelligence",
    sortedIds,
    String(ctcMin ?? ""),
    String(ctcMax ?? ""),
  ];

  return unstable_cache(
    () => fetchFilteredRoleIntelligence({ roleLevelIds, ctcMin, ctcMax }),
    cacheKey,
    { revalidate: 300, tags: ["filter-intelligence"] },
  )();
}
