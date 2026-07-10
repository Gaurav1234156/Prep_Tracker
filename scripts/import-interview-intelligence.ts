#!/usr/bin/env tsx
/**
 * Import interview intelligence from the Master Sheet xlsx into the database.
 * Usage: npx tsx scripts/import-interview-intelligence.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
  PrismaClient,
  RoundOutcome,
  UserRole,
  type Difficulty,
  type InterviewMode,
  type RoundType,
} from "@prisma/client";
import * as XLSX from "xlsx";

import {
  inferRoleLevel,
  mapDifficulty,
  mapInterviewMode,
  mapRoundCategory,
  mapSubTopicName,
  mapTopicAreaName,
  parseExcelDate,
  parseFloatOrNull,
  parseIntOrNull,
  parseYear,
} from "../lib/imports/intelligence-mapping";
import { slugify } from "../lib/slug";
import {
  getOrCreateCompanyId,
  getOrCreateRoleLevelId,
  getOrCreateSubTopicId,
} from "../lib/interview/get-or-create";

const prisma = new PrismaClient();

const XLSX_PATH = path.join(
  process.cwd(),
  "Interview Intelligence Master_ 2026.xlsx",
);

const SHEETS_TO_IMPORT = [
  "Master Sheet",
  "Assessments",
  "Assignments",
  "Interview Recordings",
] as const;

type IntelRow = {
  sourceCategory: string;
  jobType: string;
  product: string;
  dateOfEntry: string;
  enteredBy: string;
  interviewRoundDate: string;
  jobId: string;
  companyName: string;
  role: string;
  techStack: string;
  optionalSkills: string;
  ctcMin: string;
  ctcMax: string;
  openings: string;
  interviewMode: string;
  interviewProcess: string;
  roundCategory: string;
  assessmentPattern: string;
  assessmentDuration: string;
  pocRemarks: string;
  recordingUrl: string;
  transcriptUrl: string;
  questionUuid: string;
  question: string;
  questionType: string;
  skillsAssessed: string;
  topic: string;
  subTopic: string;
  difficulty: string;
  remarks: string;
  hubspotUrl: string;
  location: string;
  sheetName: string;
};

function normHeader(h: string): string {
  return h.replace(/\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function rowToRecord(
  headers: string[],
  values: unknown[],
  sheetName: string,
): IntelRow | null {
  const map = new Map<string, string>();
  headers.forEach((h, i) => {
    map.set(normHeader(h), String(values[i] ?? "").trim());
  });

  const get = (...keys: string[]) => {
    for (const k of keys) {
      const v = map.get(normHeader(k));
      if (v) return v;
    }
    return "";
  };

  const jobId = get("Job ID");
  const companyName = get("Company Name");
  if (!jobId || !companyName) return null;

  return {
    sourceCategory: get("Source Category"),
    jobType: get("Job Type"),
    product: get("Product"),
    dateOfEntry: get("Date of entry"),
    enteredBy: get("Entered by Person", "Entered by"),
    interviewRoundDate: get("Interview Round Date"),
    jobId,
    companyName,
    role: get("Role", "Role Name"),
    techStack: get("Tech Stack", "Mandatory Technologies Required"),
    optionalSkills: get(
      "Optional Skills",
      "Optional Technologies Required",
    ),
    ctcMin: get("Minimum CTC in LPA", "Min CTC"),
    ctcMax: get("Maximum CTC in LPA", "Max CTC"),
    openings: get("No of Openings", "No. of Openings"),
    interviewMode: get("Company Interview Mode"),
    interviewProcess: get("Interview Process"),
    roundCategory: get("Round Category"),
    assessmentPattern: get(
      "Assessment/Written Test Pattern  Section, Marks, Duration, No. of questions, Types of questions",
      "Assessment/Written Test Pattern Section, Marks, Duration, No. of questions, Types of questions",
    ),
    assessmentDuration: get(
      "Assessment/Written Test Total Duration (min)",
    ),
    pocRemarks: get("Company POC Remarks"),
    recordingUrl: get("Interview Recording Link"),
    transcriptUrl: get("Interview Transcript Link"),
    questionUuid: get("Question UUID", "Question  UUID"),
    question: get("Question"),
    questionType: get("Question Type"),
    skillsAssessed: get("Skills Assessed Remarks", "Skills Assessed"),
    topic: get("topic"),
    subTopic: get("sub_topic"),
    difficulty: get("difficulty_level", "difficulty"),
    remarks: get("Remarks"),
    hubspotUrl: get("Hubspot Link"),
    location: get("Location"),
    sheetName,
  };
}

function loadSheetRows(
  workbook: XLSX.WorkBook,
  sheetName: string,
): IntelRow[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`Sheet "${sheetName}" not found, skipping.`);
    return [];
  }
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  if (raw.length < 2) return [];
  const headers = (raw[0] as string[]).map(String);
  const rows: IntelRow[] = [];
  for (let i = 1; i < raw.length; i++) {
    const rec = rowToRecord(headers, raw[i] as unknown[], sheetName);
    if (rec) rows.push(rec);
  }
  return rows;
}

async function getImportUserId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  });
  if (admin) return admin.id;

  const anyUser = await prisma.user.findFirst({ select: { id: true } });
  if (anyUser) return anyUser.id;

  const created = await prisma.user.create({
    data: {
      email: "system-import@prepintel.local",
      name: "System Import",
      role: UserRole.ADMIN,
    },
    select: { id: true },
  });
  return created.id;
}

type JobMeta = {
  externalJobId: string;
  companyName: string;
  role: string;
  techStack: string;
  optionalSkills: string;
  ctcMin: number | null;
  ctcMax: number | null;
  openings: number | null;
  location: string;
  jobType: string;
  product: string;
  hubspotUrl: string;
  sourceCategory: string;
  enteredBy: string;
  enteredAt: Date | null;
  interviewProcess: string;
  interviewMode: InterviewMode;
  year: number;
  sheetName: string;
};

async function importJob(
  meta: JobMeta,
  rows: IntelRow[],
  userId: string,
  topicAreaMap: Map<string, string>,
): Promise<string> {
  return prisma.$transaction(
    async (tx) => {
      const companyId = await getOrCreateCompanyId(tx, {
        name: meta.companyName,
        slug: slugify(meta.companyName),
      });

      const roleLevelId = await getOrCreateRoleLevelId(
        tx,
        inferRoleLevel(meta.role || "Other"),
      );

      const job = await tx.job.upsert({
        where: { externalJobId: meta.externalJobId },
        create: {
          externalJobId: meta.externalJobId,
          companyId,
          role: meta.role || "Unknown Role",
          techStack: meta.techStack || null,
          optionalSkills: meta.optionalSkills || null,
          ctcMin: meta.ctcMin,
          ctcMax: meta.ctcMax,
          openings: meta.openings,
          location: meta.location || null,
          jobType: meta.jobType || null,
          product: meta.product || null,
          hubspotUrl: meta.hubspotUrl || null,
          sourceCategory: meta.sourceCategory || null,
          enteredBy: meta.enteredBy || null,
          enteredAt: meta.enteredAt,
          interviewProcess: meta.interviewProcess || null,
        },
        update: {
          role: meta.role || "Unknown Role",
          techStack: meta.techStack || null,
          optionalSkills: meta.optionalSkills || null,
          ctcMin: meta.ctcMin,
          ctcMax: meta.ctcMax,
          openings: meta.openings,
          location: meta.location || null,
          jobType: meta.jobType || null,
          product: meta.product || null,
          hubspotUrl: meta.hubspotUrl || null,
          sourceCategory: meta.sourceCategory || null,
          enteredBy: meta.enteredBy || null,
          enteredAt: meta.enteredAt,
          interviewProcess: meta.interviewProcess || null,
        },
      });

      const interview = await tx.interview.upsert({
        where: { jobId: job.id },
        create: {
          companyId,
          jobId: job.id,
          role: meta.role || "Unknown Role",
          roleLevelId,
          year: meta.year,
          sourceCategory: meta.sourceCategory || null,
          externalSource: meta.sheetName,
          interviewProcess: meta.interviewProcess || null,
          createdById: userId,
        },
        update: {
          role: meta.role || "Unknown Role",
          roleLevelId,
          year: meta.year,
          sourceCategory: meta.sourceCategory || null,
          externalSource: meta.sheetName,
          interviewProcess: meta.interviewProcess || null,
        },
        select: { id: true },
      });

      const roundOrder = new Map<string, number>();
      const roundIdByName = new Map<string, string>();
      const coverageIdByKey = new Map<string, string>();
      const subTopicCache = new Map<string, string>();

      for (const row of rows) {
        const roundName = row.roundCategory.trim() || "General Round";
        let roundId = roundIdByName.get(roundName);
        if (!roundId) {
          const roundNumber = roundOrder.size + 1;
          roundOrder.set(roundName, roundNumber);
          const roundType: RoundType = mapRoundCategory(roundName);
          const existingRound = await tx.round.findFirst({
            where: { interviewId: interview.id, roundName },
            select: { id: true },
          });
          if (existingRound) {
            roundId = existingRound.id;
            await tx.round.update({
              where: { id: roundId },
              data: {
                assessmentPattern: row.assessmentPattern || undefined,
                durationMinutes: parseIntOrNull(row.assessmentDuration) ?? undefined,
                pocRemarks: row.pocRemarks || undefined,
                recordingUrl: row.recordingUrl || undefined,
                transcriptUrl: row.transcriptUrl || undefined,
              },
            });
          } else {
            const created = await tx.round.create({
              data: {
                interviewId: interview.id,
                roundNumber,
                roundName,
                roundType,
                mode: mapInterviewMode(row.interviewMode) || meta.interviewMode,
                outcome: RoundOutcome.PENDING,
                durationMinutes: parseIntOrNull(row.assessmentDuration),
                assessmentPattern: row.assessmentPattern || null,
                pocRemarks: row.pocRemarks || null,
                recordingUrl: row.recordingUrl || null,
                transcriptUrl: row.transcriptUrl || null,
              },
              select: { id: true },
            });
            roundId = created.id;
          }
          roundIdByName.set(roundName, roundId);
        }

        if (!row.questionUuid && !row.question && !row.skillsAssessed) continue;

        const topicAreaName = mapTopicAreaName(row.skillsAssessed, row.topic);
        const topicAreaId = topicAreaMap.get(topicAreaName.toLowerCase());
        if (!topicAreaId) continue;

        const coverageKey = `${roundId}:${topicAreaId}`;
        let coverageId = coverageIdByKey.get(coverageKey);
        if (!coverageId) {
          const existing = await tx.topicCoverage.findFirst({
            where: { roundId, topicAreaId },
            select: { id: true },
          });
          if (existing) {
            coverageId = existing.id;
          } else {
            const created = await tx.topicCoverage.create({
              data: {
                roundId,
                topicAreaId,
                subTopicCount: 0,
                orderIndex: coverageIdByKey.size,
              },
              select: { id: true },
            });
            coverageId = created.id;
          }
          coverageIdByKey.set(coverageKey, coverageId);
        }

        const subTopicName = mapSubTopicName(
          row.subTopic,
          row.skillsAssessed,
          row.questionType,
        );
        const subTopicCacheKey = `${topicAreaId}:${subTopicName.toLowerCase()}`;
        let subTopicId = subTopicCache.get(subTopicCacheKey);
        if (!subTopicId) {
          subTopicId = await getOrCreateSubTopicId(tx, subTopicName, topicAreaId);
          subTopicCache.set(subTopicCacheKey, subTopicId);
        }

        const difficulty: Difficulty | null = mapDifficulty(row.difficulty);
        const referenceUrl = row.question.startsWith("http") ? row.question : null;
        const questionText = row.question.startsWith("http") ? null : row.question || null;

        if (row.questionUuid) {
          await tx.subTopicEntry.upsert({
            where: { externalQuestionId: row.questionUuid },
            create: {
              topicCoverageId: coverageId,
              subTopicId,
              orderIndex: 0,
              exactQuestionText: questionText,
              referenceUrl,
              externalQuestionId: row.questionUuid,
              questionType: row.questionType || null,
              difficulty,
              skillsAssessed: row.skillsAssessed || null,
            },
            update: {
              exactQuestionText: questionText,
              referenceUrl,
              questionType: row.questionType || null,
              difficulty,
              skillsAssessed: row.skillsAssessed || null,
            },
          });
        } else {
          const orderIndex = await tx.subTopicEntry.count({
            where: { topicCoverageId: coverageId },
          });
          await tx.subTopicEntry.create({
            data: {
              topicCoverageId: coverageId,
              subTopicId,
              orderIndex,
              exactQuestionText: questionText,
              referenceUrl,
              questionType: row.questionType || null,
              difficulty,
              skillsAssessed: row.skillsAssessed || null,
            },
          });
        }
      }

      for (const coverageId of coverageIdByKey.values()) {
        const count = await tx.subTopicEntry.count({ where: { topicCoverageId: coverageId } });
        await tx.topicCoverage.update({
          where: { id: coverageId },
          data: { subTopicCount: count },
        });
      }

      return companyId;
    },
    { timeout: 120_000 },
  );
}

async function refreshCompanyCtc(companyId: string): Promise<void> {
  const jobs = await prisma.job.findMany({
    where: { companyId },
    select: { ctcMin: true, ctcMax: true },
  });
  if (jobs.length === 0) return;

  let ctcMin: number | null = null;
  let ctcMax: number | null = null;
  for (const j of jobs) {
    if (j.ctcMin != null) {
      ctcMin = ctcMin == null ? j.ctcMin : Math.min(ctcMin, j.ctcMin);
    }
    if (j.ctcMax != null) {
      ctcMax = ctcMax == null ? j.ctcMax : Math.max(ctcMax, j.ctcMax);
    }
  }
  const ctc =
    ctcMin != null && ctcMax != null ? (ctcMin + ctcMax) / 2 : ctcMin ?? ctcMax;

  await prisma.company.update({
    where: { id: companyId },
    data: { ctcMin, ctcMax, ctc },
  });
}

async function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    throw new Error(`Excel file not found at ${XLSX_PATH}`);
  }

  console.log("Loading workbook...");
  const workbook = XLSX.readFile(XLSX_PATH, { cellDates: true });

  const companyDetails = loadSheetRows(workbook, "Company Details");
  const detailsByJobId = new Map(
    companyDetails.map((r) => [r.jobId, r]),
  );

  const allRows: IntelRow[] = [];
  for (const sheet of SHEETS_TO_IMPORT) {
    const rows = loadSheetRows(workbook, sheet);
    console.log(`  ${sheet}: ${rows.length} rows`);
    allRows.push(...rows);
  }

  const byJob = new Map<string, IntelRow[]>();
  for (const row of allRows) {
    const list = byJob.get(row.jobId) ?? [];
    list.push(row);
    byJob.set(row.jobId, list);
  }

  console.log(`Importing ${byJob.size} jobs from ${allRows.length} rows...`);

  const userId = await getImportUserId();
  const topicAreas = await prisma.topicArea.findMany({
    select: { id: true, name: true },
  });
  const topicAreaMap = new Map(
    topicAreas.map((a) => [a.name.toLowerCase(), a.id]),
  );

  const touchedCompanies = new Set<string>();
  let done = 0;

  for (const [jobId, rows] of byJob) {
    const first = rows[0];
    const details = detailsByJobId.get(jobId);

    const meta: JobMeta = {
      externalJobId: jobId,
      companyName: first.companyName,
      role: first.role || details?.role || "",
      techStack: first.techStack || details?.techStack || "",
      optionalSkills: first.optionalSkills || details?.optionalSkills || "",
      ctcMin:
        parseFloatOrNull(first.ctcMin) ??
        parseFloatOrNull(details?.ctcMin ?? ""),
      ctcMax:
        parseFloatOrNull(first.ctcMax) ??
        parseFloatOrNull(details?.ctcMax ?? ""),
      openings:
        parseIntOrNull(first.openings) ??
        parseIntOrNull(details?.openings ?? ""),
      location: first.location || details?.location || "",
      jobType: first.jobType || details?.jobType || "",
      product: first.product || details?.product || "",
      hubspotUrl: details?.hubspotUrl || "",
      sourceCategory: first.sourceCategory,
      enteredBy: first.enteredBy,
      enteredAt: parseExcelDate(first.dateOfEntry),
      interviewProcess: first.interviewProcess,
      interviewMode: mapInterviewMode(first.interviewMode),
      year: parseYear(first.interviewRoundDate || first.dateOfEntry),
      sheetName: first.sheetName,
    };

    const companyId = await importJob(meta, rows, userId, topicAreaMap);
    touchedCompanies.add(companyId);
    done += 1;
    if (done % 10 === 0 || done === byJob.size) {
      console.log(`  Progress: ${done}/${byJob.size} jobs`);
    }
  }

  console.log("Refreshing company CTC aggregates...");
  for (const companyId of touchedCompanies) {
    await refreshCompanyCtc(companyId);
  }

  console.log(
    `Done. Jobs: ${byJob.size}, rows: ${allRows.length}, companies: ${touchedCompanies.size}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
