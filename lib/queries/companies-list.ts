/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";

interface GetCompaniesListFilters {
  q?: string;
  roleLevels?: string[]; // IDs of role levels
  years?: number[];
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
  years,
  cursor,
  limit = 9,
  branches,
  cgpaMin,
  cgpaMax,
  ctcMin,
  ctcMax,
}: GetCompaniesListFilters) {
  const whereClause: any = {};

  if (q && q.trim()) {
    whereClause.name = {
      contains: q.trim(),
      mode: "insensitive",
    };
  }

  if (ctcMin != null || ctcMax != null) {
    whereClause.ctc = {};
    if (ctcMin != null) whereClause.ctc.gte = ctcMin;
    if (ctcMax != null) whereClause.ctc.lte = ctcMax;
  }

  const interviewFilters: any = {};
  if (roleLevels && roleLevels.length > 0) {
    interviewFilters.roleLevelId = { in: roleLevels };
  }
  if (years && years.length > 0) {
    interviewFilters.year = { in: years };
  }
  if (branches && branches.length > 0) {
    interviewFilters.candidateBranch = { in: branches };
  }
  if (cgpaMin != null || cgpaMax != null) {
    interviewFilters.candidateCgpa = {};
    if (cgpaMin != null) interviewFilters.candidateCgpa.gte = cgpaMin;
    if (cgpaMax != null) interviewFilters.candidateCgpa.lte = cgpaMax;
  }
  if (Object.keys(interviewFilters).length > 0) {
    whereClause.interviews = { some: interviewFilters };
  }

  const companies = await prisma.company.findMany({
    where: whereClause,
    take: limit + 1, // Get one extra to check if there is a next page
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: { interviews: true },
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
      roleLevelsCovered: Array.from(levelsMap.values()),
      mostRecentYear: maxYear > 0 ? maxYear : null,
      ctc: c.ctc,
    };
  });

  return {
    companies: formattedCompanies,
    nextCursor,
  };
}

export async function getFilterMetadata() {
  const [roleLevels, yearsData] = await Promise.all([
    prisma.roleLevel.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.interview.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);

  return {
    roleLevels,
    years: yearsData.map((y) => y.year),
  };
}
