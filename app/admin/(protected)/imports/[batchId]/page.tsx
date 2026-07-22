import Link from "next/link";
import { notFound } from "next/navigation";
import { ImportStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CompanyCard } from "@/components/imports/CompanyCard";
import { BatchPoller } from "@/components/imports/BatchPoller";

export const dynamic = "force-dynamic";
export const metadata = { title: "Import batch | Admin" };

const STATUS_ORDER: ImportStatus[] = [
  "QUEUED",
  "EXTRACTING",
  "READY_FOR_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "FAILED",
];

export default async function BatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  await requireAdminOrPanelist();
  const { batchId } = await params;

  const batch = await prisma.importBatch.findUnique({
    where: { id: batchId },
    include: {
      rows: { orderBy: { rowIndex: "asc" } },
    },
  });

  if (!batch) notFound();

  const counts: Record<ImportStatus, number> = {
    QUEUED: 0,
    EXTRACTING: 0,
    READY_FOR_REVIEW: 0,
    APPROVED: 0,
    PUBLISHED: 0,
    FAILED: 0,
  };
  for (const r of batch.rows) counts[r.status]++;

  return (
    <div className="space-y-6">
      <BatchPoller batchId={batch.id} initialCounts={counts} />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">
            {batch.filename}
          </h1>
          <p className="text-sm text-muted-foreground">
            {batch.totalRows} rows · uploaded{" "}
            {new Date(batch.createdAt).toLocaleString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/imports" />}
        >
          ← All imports
        </Button>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_ORDER.map((s) => {
          if (counts[s] === 0) return null;
          const variantMap: Record<ImportStatus, string> = {
            QUEUED: "outline",
            EXTRACTING: "outline",
            READY_FOR_REVIEW: "default",
            APPROVED: "default",
            PUBLISHED: "success",
            FAILED: "destructive",
          };
          return (
            <Badge
              key={s}
              variant={variantMap[s] as "outline" | "default" | "success" | "destructive"}
            >
              {counts[s]} {labelFor(s)}
            </Badge>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {batch.rows.map((r) => (
          <CompanyCard
            key={r.id}
            rowId={r.id}
            batchId={batch.id}
            rowIndex={r.rowIndex}
            companyName={r.companyName}
            status={r.status}
            errorMessage={r.errorMessage}
            publishedInterviewId={r.publishedInterviewId}
            costUsd={r.extractionCostUsd}
          />
        ))}
      </div>
    </div>
  );
}

function labelFor(s: ImportStatus): string {
  switch (s) {
    case "QUEUED":
      return "queued";
    case "EXTRACTING":
      return "extracting";
    case "READY_FOR_REVIEW":
      return "ready for review";
    case "APPROVED":
      return "approved";
    case "PUBLISHED":
      return "published";
    case "FAILED":
      return "failed";
  }
}
