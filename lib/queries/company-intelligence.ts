import { cache } from "react";
import { prisma } from "@/lib/db";

export type CompanyIntelligence = {
  jobCount: number;
  roles: string[];
  techStacks: string[];
  locations: string[];
  ctcMin: number | null;
  ctcMax: number | null;
  totalOpenings: number;
  jobTypes: string[];
  products: string[];
  difficultyBreakdown: { easy: number; medium: number; hard: number };
  roundTypes: string[];
};

export async function fetchCompanyIntelligence(
  companyId: string,
): Promise<CompanyIntelligence | null> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        ctcMin: true,
        ctcMax: true,
        ctc: true,
        jobs: {
          select: {
            role: true,
            techStack: true,
            optionalSkills: true,
            location: true,
            ctcMin: true,
            ctcMax: true,
            openings: true,
            jobType: true,
            product: true,
          },
        },
        interviews: {
          where: { jobId: { not: null } },
          select: {
            rounds: {
              select: {
                roundType: true,
                topicCoverages: {
                  select: {
                    entries: {
                      select: { difficulty: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!company || company.jobs.length === 0) return null;

    const roles = new Set<string>();
    const techStacks = new Set<string>();
    const locations = new Set<string>();
    const jobTypes = new Set<string>();
    const products = new Set<string>();
    const roundTypes = new Set<string>();
    let totalOpenings = 0;
    let ctcMin: number | null = company.ctcMin;
    let ctcMax: number | null = company.ctcMax;
    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };

    for (const job of company.jobs) {
      if (job.role) roles.add(job.role);
      if (job.techStack) {
        job.techStack.split(/[;,]/).forEach((t) => {
          const s = t.trim();
          if (s) techStacks.add(s);
        });
      }
      if (job.optionalSkills) {
        job.optionalSkills.split(/[;,]/).forEach((t) => {
          const s = t.trim();
          if (s) techStacks.add(s);
        });
      }
      if (job.location) locations.add(job.location);
      if (job.jobType) jobTypes.add(job.jobType);
      if (job.product) products.add(job.product);
      if (job.openings) totalOpenings += job.openings;
      if (job.ctcMin != null) {
        ctcMin = ctcMin == null ? job.ctcMin : Math.min(ctcMin, job.ctcMin);
      }
      if (job.ctcMax != null) {
        ctcMax = ctcMax == null ? job.ctcMax : Math.max(ctcMax, job.ctcMax);
      }
    }

    for (const interview of company.interviews) {
      for (const round of interview.rounds) {
        roundTypes.add(round.roundType);
        for (const cov of round.topicCoverages) {
          for (const entry of cov.entries) {
            if (entry.difficulty === "EASY") difficultyBreakdown.easy += 1;
            if (entry.difficulty === "MEDIUM") difficultyBreakdown.medium += 1;
            if (entry.difficulty === "HARD") difficultyBreakdown.hard += 1;
          }
        }
      }
    }

    return {
      jobCount: company.jobs.length,
      roles: Array.from(roles).sort(),
      techStacks: Array.from(techStacks).sort(),
      locations: Array.from(locations).sort(),
      ctcMin,
      ctcMax,
      totalOpenings,
      jobTypes: Array.from(jobTypes).sort(),
      products: Array.from(products).sort(),
      difficultyBreakdown,
      roundTypes: Array.from(roundTypes).sort(),
    };
}

/** Cached for Server Components only — do not use in Route Handlers. */
export const getCompanyIntelligence = cache(fetchCompanyIntelligence);
