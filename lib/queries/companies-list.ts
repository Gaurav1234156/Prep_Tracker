/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

interface GetCompaniesListFilters {
  q?: string;
  roleLevels?: string[]; // IDs of role levels
  cursor?: string; // ID of the company
  limit?: number;
  branches?: string[]; // Branch enum values
  cgpaMin?: number;
  cgpaMax?: number;
  ctcMin?: number;
  ctcMax?: number;
}

export async function getCompaniesList({
  q,
  roleLevels,
  cursor,
  limit = 9,
  branches,
  cgpaMin,
  cgpaMax,
  ctcMin,
  ctcMax,
}: GetCompaniesListFilters) {
  const baseFilters: any[] = [];

  if (q && q.trim()) {
    baseFilters.push({
      name: {
        contains: q.trim(),
        mode: "insensitive",
      },
    });
  }

  if (ctcMin != null || ctcMax != null) {
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

    baseFilters.push({ OR: ctcFilters });
  }

  const interviewFilters: any = {};
  if (roleLevels && roleLevels.length > 0) {
    interviewFilters.roleLevelId = { in: roleLevels };
  }
  if (branches && branches.length > 0) {
    interviewFilters.candidateBranch = { in: branches };
  }
  if (cgpaMin != null || cgpaMax != null) {
    interviewFilters.candidateCgpa = {};
    if (cgpaMin != null) interviewFilters.candidateCgpa.gte = cgpaMin;
    if (cgpaMax != null) interviewFilters.candidateCgpa.lte = cgpaMax;
  }

  const hasRoleLevelFilter = Boolean(roleLevels && roleLevels.length > 0);
  const hasCandidateFilters =
    (branches && branches.length > 0) ||
    cgpaMin != null ||
    cgpaMax != null;

  if (hasCandidateFilters) {
    baseFilters.push({ interviews: { some: interviewFilters } });
  } else if (hasRoleLevelFilter) {
    baseFilters.push({
      OR: [
        { interviews: { some: interviewFilters } },
        { jobs: { some: {} } },
      ],
    });
  } else if (Object.keys(interviewFilters).length > 0) {
    baseFilters.push({ interviews: { some: interviewFilters } });
  } else {
    baseFilters.push({
      OR: [{ interviews: { some: {} } }, { jobs: { some: {} } }],
    });
  }

  const whereClause =
    baseFilters.length === 1 ? baseFilters[0] : { AND: baseFilters };

  const companies = await prisma.company.findMany({
    // Single SQL JOIN instead of separate relation queries → one DB round-trip.
    relationLoadStrategy: "join",
    where: whereClause,
    take: limit + 1, // Get one extra to check if there is a next page
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: [
      { jobs: { _count: "desc" } },
      { interviews: { _count: "desc" } },
      { name: "asc" },
    ],
    include: {
      _count: {
        select: { interviews: true, jobs: true },
      },
      interviews: {
        select: {
          year: true,
          roleLevel: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  let nextCursor: string | undefined = undefined;
  if (companies.length > limit) {
    const nextItem = companies.pop();
    nextCursor = nextItem?.id;
  }

  // Format companies with derived statistics for presentation
  const formattedCompanies = companies.map((c) => {
    // Collect unique role levels covered
    const levelsMap = new Map<string, { id: string; name: string; slug: string }>();
    let maxYear = 0;

    c.interviews.forEach((i) => {
      if (i.roleLevel) {
        levelsMap.set(i.roleLevel.id, i.roleLevel);
      }
      if (i.year > maxYear) {
        maxYear = i.year;
      }
    });

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      logoUrl: c.logoUrl,
      description: c.description,
      websiteUrl: c.websiteUrl,
      createdAt: c.createdAt,
      interviewCount: c._count.interviews,
      jobCount: c._count.jobs,
      hasIntelligence: c._count.jobs > 0,
      roleLevelsCovered: Array.from(levelsMap.values()),
      mostRecentYear: maxYear > 0 ? maxYear : null,
      ctc: c.ctc,
      ctcMin: c.ctcMin,
      ctcMax: c.ctcMax,
    };
  });

  return {
    companies: formattedCompanies,
    nextCursor,
  };
}

// Role levels change rarely, so we cache them across requests (5 min window +
// tag invalidation) to keep them off the page's hot path.
export const getFilterMetadata = unstable_cache(
  async () => {
    const roleLevels = await prisma.roleLevel.findMany({
      orderBy: { name: "asc" },
    });

    return { roleLevels };
  },
  ["companies-filter-metadata"],
  { revalidate: 300, tags: ["filter-metadata"] },
);

// Feature flags rarely change; cache so the flag read drops out of the hot path.
// Invalidated immediately by toggleFeatureFlag() via revalidateTag("feature-flags").
export const getFeatureFlag = (key: string) =>
  unstable_cache(
    async () => prisma.featureFlag.findUnique({ where: { key } }),
    ["feature-flag", key],
    { revalidate: 300, tags: ["feature-flags"] },
  )();
