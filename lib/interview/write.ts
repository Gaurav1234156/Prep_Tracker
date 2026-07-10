import { Prisma } from "@prisma/client";

import {
  InterviewFullCreate,
  WizardAsset,
} from "@/lib/validations/interview-full";
import {
  getOrCreateCompanyId,
  getOrCreateRoleLevelId,
  getOrCreateSubTopicId,
} from "@/lib/interview/get-or-create";

export class InterviewWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InterviewWriteError";
  }
}

export async function resolveCompanyId(
  tx: Prisma.TransactionClient,
  company: InterviewFullCreate["company"],
): Promise<string> {
  if (company.mode === "existing") {
    const row = await tx.company.findUnique({
      where: { id: company.companyId },
      select: { id: true },
    });
    if (!row) {
      throw new InterviewWriteError(
        `Unknown company id: ${company.companyId}`,
      );
    }
    return row.id;
  }

  return getOrCreateCompanyId(tx, company.data);
}

function assetsForRound(
  assets: ReadonlyArray<WizardAsset>,
  roundIndex: number,
): Prisma.AssetCreateWithoutRoundInput[] {
  return assets
    .filter((a) => a.scope === "round" && a.roundIndex === roundIndex)
    .map((a) => ({
      kind: a.kind,
      url: a.url,
      label: a.label ?? null,
    }));
}

function interviewLevelAssets(
  assets: ReadonlyArray<WizardAsset>,
): Prisma.AssetCreateWithoutInterviewInput[] {
  return assets
    .filter((a) => a.scope === "interview")
    .map((a) => ({
      kind: a.kind,
      url: a.url,
      label: a.label ?? null,
    }));
}

function interviewCoreData(
  payload: InterviewFullCreate,
  companyId: string,
  roleLevelId: string,
  userId: string,
) {
  return {
    company: { connect: { id: companyId } },
    roleLevel: { connect: { id: roleLevelId } },
    createdBy: { connect: { id: userId } },
    role: payload.interview.role,
    year: payload.interview.year,
    totalSelected: payload.interview.totalSelected ?? null,
    biggestTip: payload.interview.biggestTip ?? null,
  } satisfies Omit<
    Prisma.InterviewCreateInput,
    "rounds" | "assets" | "bookmarks"
  >;
}

export async function createInterviewTree(
  tx: Prisma.TransactionClient,
  userId: string,
  payload: InterviewFullCreate,
): Promise<{ id: string }> {
  const companyId = await resolveCompanyId(tx, payload.company);

  let roleLevelId = payload.interview.roleLevelId;
  if (roleLevelId === "__new__" && payload.interview.roleLevelName) {
    roleLevelId = await getOrCreateRoleLevelId(
      tx,
      payload.interview.roleLevelName,
    );
  }

  const interview = await tx.interview.create({
    data: {
      ...interviewCoreData(payload, companyId, roleLevelId, userId),
      assets: { create: interviewLevelAssets(payload.assets) },
    },
    select: { id: true },
  });

  for (let rIndex = 0; rIndex < payload.rounds.length; rIndex++) {
    const round = payload.rounds[rIndex];
    const createdRound = await tx.round.create({
      data: {
        roundNumber: rIndex + 1,
        roundName: round.roundName,
        roundType: round.roundType,
        durationMinutes: round.durationMinutes ?? null,
        mode: round.mode,
        numInterviewers: round.numInterviewers ?? null,
        interviewStyle: round.interviewStyle ?? null,
        outcome: round.outcome,
        keyLearnings: round.keyLearnings ?? null,
        assessmentPattern: round.assessmentPattern ?? null,
        pocRemarks: round.pocRemarks ?? null,
        recordingUrl: round.recordingUrl || null,
        transcriptUrl: round.transcriptUrl || null,
        interviewId: interview.id,
        assets: { create: assetsForRound(payload.assets, rIndex) },
      },
    });

    for (let tcIndex = 0; tcIndex < round.topicCoverages.length; tcIndex++) {
      const coverage = round.topicCoverages[tcIndex];
      const createdCoverage = await tx.topicCoverage.create({
        data: {
          roundId: createdRound.id,
          topicAreaId: coverage.topicAreaId,
          subTopicCount: coverage.subTopicCount,
          orderIndex: tcIndex,
        },
      });

      for (let entryIndex = 0; entryIndex < coverage.entries.length; entryIndex++) {
        const entry = coverage.entries[entryIndex];
        let subTopicId = entry.subTopicId;
        if (subTopicId === "__new__" && entry.subTopicName) {
          subTopicId = await getOrCreateSubTopicId(
            tx,
            entry.subTopicName,
            coverage.topicAreaId,
          );
        }

        await tx.subTopicEntry.create({
          data: {
            topicCoverageId: createdCoverage.id,
            subTopicId,
            orderIndex: entryIndex,
            exactQuestionText: entry.exactQuestionText || null,
            referenceUrl: entry.referenceUrl || null,
            externalQuestionId: entry.externalQuestionId || null,
            questionType: entry.questionType || null,
            difficulty: entry.difficulty ?? null,
            skillsAssessed: entry.skillsAssessed || null,
          },
        });
      }
    }
  }

  return interview;
}

export async function replaceInterviewTree(
  tx: Prisma.TransactionClient,
  id: string,
  userId: string,
  payload: InterviewFullCreate,
): Promise<void> {
  const companyId = await resolveCompanyId(tx, payload.company);

  let roleLevelId = payload.interview.roleLevelId;
  if (roleLevelId === "__new__" && payload.interview.roleLevelName) {
    roleLevelId = await getOrCreateRoleLevelId(
      tx,
      payload.interview.roleLevelName,
    );
  }

  // Cascades on delete handles nested Round children.
  await tx.round.deleteMany({ where: { interviewId: id } });
  await tx.asset.deleteMany({ where: { interviewId: id } });

  await tx.interview.update({
    where: { id },
    data: {
      ...interviewCoreData(payload, companyId, roleLevelId, userId),
      assets: { create: interviewLevelAssets(payload.assets) },
    },
  });

  for (let rIndex = 0; rIndex < payload.rounds.length; rIndex++) {
    const round = payload.rounds[rIndex];
    const createdRound = await tx.round.create({
      data: {
        roundNumber: rIndex + 1,
        roundName: round.roundName,
        roundType: round.roundType,
        durationMinutes: round.durationMinutes ?? null,
        mode: round.mode,
        numInterviewers: round.numInterviewers ?? null,
        interviewStyle: round.interviewStyle ?? null,
        outcome: round.outcome,
        keyLearnings: round.keyLearnings ?? null,
        assessmentPattern: round.assessmentPattern ?? null,
        pocRemarks: round.pocRemarks ?? null,
        recordingUrl: round.recordingUrl || null,
        transcriptUrl: round.transcriptUrl || null,
        interviewId: id,
        assets: { create: assetsForRound(payload.assets, rIndex) },
      },
    });

    for (let tcIndex = 0; tcIndex < round.topicCoverages.length; tcIndex++) {
      const coverage = round.topicCoverages[tcIndex];
      const createdCoverage = await tx.topicCoverage.create({
        data: {
          roundId: createdRound.id,
          topicAreaId: coverage.topicAreaId,
          subTopicCount: coverage.subTopicCount,
          orderIndex: tcIndex,
        },
      });

      for (let entryIndex = 0; entryIndex < coverage.entries.length; entryIndex++) {
        const entry = coverage.entries[entryIndex];
        let subTopicId = entry.subTopicId;
        if (subTopicId === "__new__" && entry.subTopicName) {
          subTopicId = await getOrCreateSubTopicId(
            tx,
            entry.subTopicName,
            coverage.topicAreaId,
          );
        }

        await tx.subTopicEntry.create({
          data: {
            topicCoverageId: createdCoverage.id,
            subTopicId,
            orderIndex: entryIndex,
            exactQuestionText: entry.exactQuestionText || null,
            referenceUrl: entry.referenceUrl || null,
            externalQuestionId: entry.externalQuestionId || null,
            questionType: entry.questionType || null,
            difficulty: entry.difficulty ?? null,
            skillsAssessed: entry.skillsAssessed || null,
          },
        });
      }
    }
  }
}
