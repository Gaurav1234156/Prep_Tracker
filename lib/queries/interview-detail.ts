import { prisma } from "@/lib/db";
import { cache } from "react";

export async function fetchInterviewDetail(id: string) {
  return prisma.interview.findUnique({
    where: { id },
    include: {
      company: true,
      roleLevel: true,
      createdBy: { select: { name: true } },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          topicCoverages: {
            orderBy: { orderIndex: "asc" },
            include: {
              topicArea: true,
              entries: {
                orderBy: { orderIndex: "asc" },
                include: {
                  subTopic: true,
                },
              },
            },
          },
          assets: true,
        },
      },
      assets: { where: { roundId: null } },
    },
  });
}

/** Cached for Server Components only — do not use in Route Handlers. */
export const getInterviewDetail = cache(fetchInterviewDetail);

export type InterviewDetail = NonNullable<
  Awaited<ReturnType<typeof fetchInterviewDetail>>
>;

export async function fetchRelatedExperiences(interview: InterviewDetail) {
  const [sameCompany, sameRole] = await Promise.all([
    prisma.interview.findMany({
      where: {
        companyId: interview.companyId,
        id: { not: interview.id },
      },
      take: 4,
      include: { company: true, roleLevel: true },
    }),
    prisma.interview.findMany({
      where: {
        roleLevelId: interview.roleLevelId,
        id: { not: interview.id },
      },
      take: 4,
      include: { company: true, roleLevel: true },
    }),
  ]);

  return [...sameCompany, ...sameRole].filter(
    (item, index, self) => self.findIndex((t) => t.id === item.id) === index,
  );
}
