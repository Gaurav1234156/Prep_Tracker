import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ForbiddenError, UnauthorizedError, requireAdminOrPanelist } from "@/lib/auth/guards";
import { ASSETS_BUCKET } from "@/lib/storage";
import type { WizardValues } from "@/components/forms/wizard/types";

import { EditInterviewClient } from "./edit-interview-client";

export const metadata = {
  title: "Edit interview | Admin",
};

export const dynamic = "force-dynamic";

function pathFromPublicUrl(url: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const prefix = `${base}/storage/v1/object/public/${ASSETS_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export default async function EditInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await requireAdminOrPanelist();
  } catch (err) {
    if (err instanceof ForbiddenError) redirect("/");
    if (err instanceof UnauthorizedError) redirect("/login");
    throw err;
  }

  const { id } = await params;

  const [interview, companies, topicAreas, subTopics, roleLevels] = await Promise.all([
    prisma.interview.findUnique({
      where: { id },
      include: {
        assets: true,
        rounds: {
          orderBy: { roundNumber: "asc" },
          include: {
            assets: true,
            topicCoverages: {
              orderBy: { orderIndex: "asc" },
              include: {
                entries: {
                  orderBy: { orderIndex: "asc" },
                  include: {
                    subTopic: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
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

  if (!interview) notFound();

  const initialValues: WizardValues = {
    company: { mode: "existing", companyId: interview.companyId },
    interview: {
      role: interview.role,
      roleLevelId: interview.roleLevelId,
      roleLevelName: "",
      year: interview.year,
      totalSelected: interview.totalSelected ?? null,
      biggestTip: interview.biggestTip ?? null,
    },
    rounds: interview.rounds.map((r) => ({
      roundNumber: r.roundNumber,
      roundName: r.roundName,
      roundType: r.roundType,
      durationMinutes: r.durationMinutes ?? null,
      mode: r.mode,
      numInterviewers: r.numInterviewers ?? null,
      interviewStyle: r.interviewStyle ?? null,
      outcome: r.outcome,
      keyLearnings: r.keyLearnings ?? null,
      topicCoverages: r.topicCoverages.map((tc) => ({
        topicAreaId: tc.topicAreaId,
        subTopicCount: tc.subTopicCount,
        orderIndex: tc.orderIndex,
        entries: tc.entries.map((e) => ({
          subTopicId: e.subTopicId,
          subTopicName: e.subTopic?.name || "",
          orderIndex: e.orderIndex,
          exactQuestionText: e.exactQuestionText ?? "",
          referenceUrl: e.referenceUrl ?? "",
        })),
      })),
    })),
    assets: [
      ...interview.assets.map((a) => ({
        scope: "interview" as const,
        roundIndex: null,
        kind: a.kind as "prep_pdf" | "infographic_pdf" | "external_link",
        path: pathFromPublicUrl(a.url),
        url: a.url,
        label: a.label ?? null,
      })),
      ...interview.rounds.flatMap((r, idx) =>
        r.assets.map((a) => ({
          scope: "round" as const,
          roundIndex: idx,
          kind: a.kind as "prep_pdf" | "infographic_pdf" | "external_link",
          path: pathFromPublicUrl(a.url),
          url: a.url,
          label: a.label ?? null,
        })),
      ),
    ],
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Edit interview</h1>
        <p className="text-muted-foreground text-sm">
          Changes replace the existing rounds, topic coverages, and assets in a
          single transaction.
        </p>
      </header>
      <EditInterviewClient
        id={id}
        companies={companies}
        topicAreas={topicAreas}
        subTopics={subTopics}
        roleLevels={roleLevels}
        initialValues={initialValues}
      />
    </div>
  );
}
