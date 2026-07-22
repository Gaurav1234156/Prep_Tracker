import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ExternalLinkIcon,
  FileTextIcon,
  PencilIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { DeleteInterviewButton } from "../delete-button";

export const dynamic = "force-dynamic";


const ROUND_OUTCOME_TONE: Record<string, string> = {
  CLEARED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-slate-100 text-slate-700",
  NO_SHOW: "bg-slate-100 text-slate-700",
};

export default async function AdminInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      company: true,
      roleLevel: true,
      createdBy: { select: { email: true, name: true } },
      assets: { orderBy: { uploadedAt: "asc" } },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          assets: { orderBy: { uploadedAt: "asc" } },
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
        },
      },
    },
  });

  if (!interview) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {interview.company.name} · {interview.role}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">
              {interview.roleLevel.name}
            </Badge>
            <Badge variant="outline">
              {interview.year}
            </Badge>
            {interview.totalSelected != null ? (
              <Badge variant="outline">
                Total selected: {interview.totalSelected}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Submitted by{" "}
            {interview.createdBy?.email ?? "(unknown)"} ·{" "}
            {interview.publishedAt.toISOString().slice(0, 10)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<Link href={`/admin/interviews/${interview.id}/edit`} />}
          >
            <PencilIcon className="size-4" />
            Edit
          </Button>
          <DeleteInterviewButton
            id={interview.id}
            label="Delete"
            variant="outline"
            redirectAfter="/admin/interviews"
          />
          <Button
            variant="outline"
            render={<Link href={`/experiences/${interview.id}`} target="_blank" />}
          >
            View as student ↗
          </Button>
        </div>
      </header>

      {interview.biggestTip ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Biggest tip</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={interview.biggestTip} />
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Rounds ({interview.rounds.length})
        </h2>
        {interview.rounds.map((r) => (
          <details
            key={r.id}
            className="rounded-md border"
            open
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 p-3 text-sm">
              <span className="text-muted-foreground font-mono">
                #{r.roundNumber}
              </span>
              <span className="font-medium">{r.roundName}</span>
              <Badge variant="secondary">{r.roundType.replace(/_/g, " ")}</Badge>
              <Badge variant="secondary">{r.mode.replace(/_/g, " ")}</Badge>
              {r.durationMinutes ? (
                <Badge variant="outline">{r.durationMinutes} min</Badge>
              ) : null}
              {r.numInterviewers != null ? (
                <Badge variant="outline">
                  {r.numInterviewers} interviewer
                  {r.numInterviewers === 1 ? "" : "s"}
                </Badge>
              ) : null}
              <Badge
                className={cn(
                  "ml-auto font-normal",
                  ROUND_OUTCOME_TONE[r.outcome] ?? "",
                )}
              >
                {r.outcome}
              </Badge>
            </summary>
            <div className="border-t p-3 space-y-3 text-sm">
              {r.interviewStyle ? (
                <p>
                  <span className="text-muted-foreground text-xs uppercase mr-2">
                    Style
                  </span>
                  {r.interviewStyle}
                </p>
              ) : null}

              {r.topicCoverages.length === 0 ? (
                <p className="text-muted-foreground italic">
                  No topic coverages recorded.
                </p>
              ) : (
                <div className="space-y-3">
                  <span className="text-muted-foreground text-xs uppercase font-medium">
                    Topic Coverages
                  </span>
                  <div className="grid gap-3">
                    {r.topicCoverages.map((cov) => (
                      <div key={cov.id} className="rounded-md border p-3 bg-slate-50 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">{cov.topicArea.name}</span>
                          <Badge variant="outline">
                            {cov.subTopicCount} sub-topic{cov.subTopicCount === 1 ? "" : "s"}
                          </Badge>
                        </div>
                        {cov.entries.length > 0 && (
                          <div className="space-y-2 pt-1">
                            {cov.entries.map((entry) => (
                              <div key={entry.id} className="pl-3 border-l-2 border-slate-200 py-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-slate-700">{entry.subTopic.name}</span>
                                  {entry.referenceUrl && (
                                    <a
                                      href={entry.referenceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
                                    >
                                      <ExternalLinkIcon className="size-3" /> Reference
                                    </a>
                                  )}
                                </div>
                                {entry.exactQuestionText && (
                                  <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1 font-mono whitespace-pre-wrap">
                                    {entry.exactQuestionText}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.keyLearnings ? (
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-muted-foreground mb-1 text-xs uppercase">
                    Key learnings
                  </p>
                  <MarkdownRenderer content={r.keyLearnings} />
                </div>
              ) : null}

              {r.assets.length > 0 ? (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs uppercase">
                    Round assets
                  </p>
                  <AssetList assets={r.assets} />
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </section>

      {interview.assets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview assets</CardTitle>
            <CardDescription>
              Prep PDFs and external links scoped to the whole interview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssetList assets={interview.assets} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}


function AssetList({
  assets,
}: {
  assets: { id: string; kind: string; url: string; label: string | null }[];
}) {
  return (
    <ul className="space-y-1 text-sm">
      {assets.map((a) => (
        <li key={a.id} className="flex items-center gap-2">
          {a.kind === "external_link" ? (
            <ExternalLinkIcon className="size-3" />
          ) : (
            <FileTextIcon className="size-3" />
          )}
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {a.label || a.url}
          </a>
          <span className="text-muted-foreground text-xs">[{a.kind}]</span>
        </li>
      ))}
    </ul>
  );
}
