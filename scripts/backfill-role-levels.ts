#!/usr/bin/env tsx
/**
 * Backfill Interview.roleLevelId from job.role / interview.role using inferRoleLevel.
 *
 * Preview: npx tsx scripts/backfill-role-levels.ts
 * Apply:   npx tsx scripts/backfill-role-levels.ts --apply
 */
import { PrismaClient } from "@prisma/client";

import { ROLE_LEVEL_NAMES } from "../lib/constants/role-levels";
import { inferRoleLevel } from "../lib/imports/intelligence-mapping";

const prisma = new PrismaClient();
const BATCH_SIZE = 100;
const SAMPLE_LIMIT = 15;

type ChangeRow = {
  id: string;
  sourceRole: string;
  fromName: string;
  toName: string;
};

function countByRoleLevel(
  interviews: { roleLevelId: string }[],
  idToName: Map<string, string>,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const name of ROLE_LEVEL_NAMES) {
    counts.set(name, 0);
  }
  for (const interview of interviews) {
    const name = idToName.get(interview.roleLevelId) ?? "Unknown";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const roleLevels = await prisma.roleLevel.findMany({
    select: { id: true, name: true },
  });
  const nameToId = new Map(roleLevels.map((rl) => [rl.name, rl.id]));
  const idToName = new Map(roleLevels.map((rl) => [rl.id, rl.name]));

  const missing = ROLE_LEVEL_NAMES.filter((name) => !nameToId.has(name));
  if (missing.length > 0) {
    throw new Error(
      `Missing RoleLevel rows in database: ${missing.join(", ")}. Run prisma db seed first.`,
    );
  }

  const interviews = await prisma.interview.findMany({
    select: {
      id: true,
      role: true,
      roleLevelId: true,
      job: { select: { role: true } },
    },
  });

  const beforeCounts = countByRoleLevel(interviews, idToName);
  const changes: ChangeRow[] = [];
  const afterCounts = new Map(beforeCounts);

  for (const interview of interviews) {
    const sourceRole = interview.job?.role?.trim() || interview.role.trim();
    const targetName = inferRoleLevel(sourceRole || "Other");
    const targetId = nameToId.get(targetName);
    if (!targetId) {
      throw new Error(`No RoleLevel id for inferred name: ${targetName}`);
    }

    if (targetId === interview.roleLevelId) continue;

    const fromName = idToName.get(interview.roleLevelId) ?? "Unknown";
    changes.push({
      id: interview.id,
      sourceRole: sourceRole || "(empty)",
      fromName,
      toName: targetName,
    });

    afterCounts.set(fromName, (afterCounts.get(fromName) ?? 0) - 1);
    afterCounts.set(targetName, (afterCounts.get(targetName) ?? 0) + 1);
  }

  console.log(`Interviews scanned: ${interviews.length}`);
  console.log(`Rows to update: ${changes.length}`);
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}\n`);

  console.log("Role level counts (before -> after):");
  for (const name of ROLE_LEVEL_NAMES) {
    const before = beforeCounts.get(name) ?? 0;
    const after = afterCounts.get(name) ?? 0;
    const delta = after - before;
    const deltaStr = delta === 0 ? "" : ` (${delta > 0 ? "+" : ""}${delta})`;
    if (before > 0 || after > 0 || delta !== 0) {
      console.log(`  ${name}: ${before} -> ${after}${deltaStr}`);
    }
  }

  if (changes.length > 0) {
    console.log(`\nSample changes (up to ${SAMPLE_LIMIT}):`);
    for (const row of changes.slice(0, SAMPLE_LIMIT)) {
      console.log(
        `  ${row.id}: "${row.fromName}" -> "${row.toName}" (from role: "${row.sourceRole}")`,
      );
    }
    if (changes.length > SAMPLE_LIMIT) {
      console.log(`  ... and ${changes.length - SAMPLE_LIMIT} more`);
    }
  }

  if (!apply) {
    if (changes.length > 0) {
      console.log("\nRe-run with --apply to persist changes.");
    } else {
      console.log("\nNothing to update.");
    }
    return;
  }

  if (changes.length === 0) {
    console.log("\nNothing to update.");
    return;
  }

  let updated = 0;
  for (let i = 0; i < changes.length; i += BATCH_SIZE) {
    const batch = changes.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((row) =>
        prisma.interview.update({
          where: { id: row.id },
          data: { roleLevelId: nameToId.get(row.toName)! },
        }),
      ),
    );
    updated += batch.length;
    console.log(`Updated ${updated}/${changes.length}...`);
  }

  console.log(`\nDone. Updated ${updated} interview(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
