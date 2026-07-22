import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { llmOutputSchema } from "@/lib/ai/extraction";
import { transformExtractionToWizardValues } from "@/lib/imports/transform";

import { ReviewClient } from "./review-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review extraction | Admin" };

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ batchId: string; rowId: string }>;
}) {
  await requireAdminOrPanelist();
  const { batchId, rowId } = await params;

  const [row, companies, topicAreas, subTopics, roleLevels] = await Promise.all([
    prisma.importRow.findUnique({ where: { id: rowId } }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.topicArea.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, sortOrder: true },
    }),
    prisma.subTopic.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, topicAreaId: true },
    }),
    prisma.roleLevel.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!row || row.batchId !== batchId) notFound();

  if (row.status !== "READY_FOR_REVIEW" && row.status !== "PUBLISHED") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Not ready</h1>
        <p className="text-sm text-muted-foreground">
          This row is currently <code className="font-mono">{row.status}</code>.
          Wait for extraction to finish or retry it from the batch page.
        </p>
      </div>
    );
  }

  if (!row.extractedJson) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          No extraction available
        </h1>
        <p className="text-sm text-muted-foreground">
          The extraction payload is missing. Retry this row from the batch page.
        </p>
      </div>
    );
  }

  // Validate the stored LLM output. If somehow corrupt, render an error rather
  // than crashing the wizard with malformed initial values.
  const llmParsed = llmOutputSchema.safeParse(row.extractedJson);
  if (!llmParsed.success) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Stored extraction is invalid
        </h1>
        <p className="text-sm text-muted-foreground">
          Retry this row to re-run the extraction.
        </p>
        <pre className="text-xs bg-secondary p-3 rounded-md overflow-auto">
          {llmParsed.error.message}
        </pre>
      </div>
    );
  }

  const raw = row.rawCsvJson as Record<string, string>;
  const companyMatch = companies.find(
    (c) => c.name.toLowerCase() === (raw.company_name ?? "").trim().toLowerCase(),
  );
  const roleLevelMatch = roleLevels.find(
    (rl) =>
      rl.name.toLowerCase() === (raw.role_level ?? "").trim().toLowerCase(),
  );

  const { values, unresolvedTopicAreas, newSubTopicNames } =
    transformExtractionToWizardValues(raw, llmParsed.data, topicAreas, subTopics, {
      companyId: companyMatch?.id,
      roleLevelId: roleLevelMatch?.id,
    });

  return (
    <ReviewClient
      rowId={row.id}
      batchId={batchId}
      companyName={row.companyName}
      initialValues={values}
      companies={companies}
      topicAreas={topicAreas}
      subTopics={subTopics}
      roleLevels={roleLevels}
      unresolvedTopicAreas={unresolvedTopicAreas}
      newSubTopicNames={newSubTopicNames}
      tokens={row.extractionTokens}
      costUsd={row.extractionCostUsd}
      alreadyPublishedId={row.publishedInterviewId}
    />
  );
}
