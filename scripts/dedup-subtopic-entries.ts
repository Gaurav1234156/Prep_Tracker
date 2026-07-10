#!/usr/bin/env tsx
/**
 * Remove duplicate SubTopicEntry rows (UUID-less entries only).
 * Keeps the row with the lowest orderIndex (then id).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function countDuplicateGroups(): Promise<number> {
  const rows = (await prisma.$queryRaw`
    SELECT COUNT(*)::int as groups FROM (
      SELECT 1
      FROM "SubTopicEntry"
      WHERE "externalQuestionId" IS NULL
      GROUP BY "topicCoverageId", "subTopicId",
        COALESCE("exactQuestionText", ''), COALESCE("referenceUrl", '')
      HAVING COUNT(*) > 1
    ) t
  `) as { groups: number }[];
  return rows[0]?.groups ?? 0;
}

async function main() {
  const before = await countDuplicateGroups();
  console.log("Duplicate groups before:", before);
  if (before === 0) {
    console.log("Nothing to do.");
    return;
  }

  const dupIds = (await prisma.$queryRaw`
    SELECT id FROM (
      SELECT id,
        ROW_NUMBER() OVER (
          PARTITION BY "topicCoverageId", "subTopicId",
            COALESCE("exactQuestionText", ''), COALESCE("referenceUrl", '')
          ORDER BY "orderIndex" ASC, id ASC
        ) AS rn
      FROM "SubTopicEntry"
      WHERE "externalQuestionId" IS NULL
    ) t WHERE rn > 1
  `) as { id: string }[];

  const ids = dupIds.map((r) => r.id);
  const affected = await prisma.subTopicEntry.findMany({
    where: { id: { in: ids } },
    select: { topicCoverageId: true },
  });
  const coverageIds = [...new Set(affected.map((r) => r.topicCoverageId))];

  const deleted = await prisma.subTopicEntry.deleteMany({
    where: { id: { in: ids } },
  });
  console.log("Deleted duplicate entries:", deleted.count);

  for (const coverageId of coverageIds) {
    const count = await prisma.subTopicEntry.count({
      where: { topicCoverageId: coverageId },
    });
    await prisma.topicCoverage.update({
      where: { id: coverageId },
      data: { subTopicCount: count },
    });
  }
  console.log("Refreshed subTopicCount for", coverageIds.length, "coverages");

  const after = await countDuplicateGroups();
  console.log("Duplicate groups after:", after);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
