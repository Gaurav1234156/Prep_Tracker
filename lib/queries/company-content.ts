import { prisma } from "@/lib/db";

export type CompanyTabInterview = {
  id: string;
  role: string;
  year: number;
  publishedAt: string;
  biggestTip?: string | null;
  roleLevelId: string;
  company: {
    name: string;
    logoUrl?: string | null;
    slug: string;
  };
  roleLevel: {
    id: string;
    name: string;
  };
  rounds: {
    id: string;
    roundNumber: number;
    topicCoverages: {
      id: string;
      entries: {
        id: string;
        subTopic: {
          name: string;
          slug: string;
          topicArea: {
            slug: string;
          };
        };
      }[];
    }[];
  }[];
};

export type CompanyTabData = {
  interviews: CompanyTabInterview[];
  roleLevels: { id: string; name: string }[];
};

export async function fetchCompanyTabData(
  companyId: string,
): Promise<CompanyTabData> {
  const interviews = await prisma.interview.findMany({
    where: { companyId },
    orderBy: { year: "desc" },
    include: {
      roleLevel: true,
      company: {
        select: {
          name: true,
          logoUrl: true,
          slug: true,
        },
      },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          topicCoverages: {
            include: {
              entries: {
                include: {
                  subTopic: {
                    include: {
                      topicArea: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const levelsMap = new Map<string, { id: string; name: string }>();
  for (const interview of interviews) {
    if (interview.roleLevel) {
      levelsMap.set(interview.roleLevel.id, {
        id: interview.roleLevel.id,
        name: interview.roleLevel.name,
      });
    }
  }

  return {
    interviews: interviews.map((interview) => ({
      id: interview.id,
      role: interview.role,
      year: interview.year,
      publishedAt: interview.publishedAt.toISOString(),
      biggestTip: interview.biggestTip,
      roleLevelId: interview.roleLevelId,
      company: interview.company,
      roleLevel: interview.roleLevel,
      rounds: interview.rounds.map((round) => ({
        id: round.id,
        roundNumber: round.roundNumber,
        topicCoverages: round.topicCoverages.map((coverage) => ({
          id: coverage.id,
          entries: coverage.entries.map((entry) => ({
            id: entry.id,
            subTopic: {
              name: entry.subTopic.name,
              slug: entry.subTopic.slug,
              topicArea: { slug: entry.subTopic.topicArea.slug },
            },
          })),
        })),
      })),
    })),
    roleLevels: Array.from(levelsMap.values()),
  };
}
