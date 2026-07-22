import Link from "next/link";
import { SubmissionStatus } from "@prisma/client";
import { Inbox, ChevronRight } from "lucide-react";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<SubmissionStatus, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/30",
  PUBLISHED: "bg-success/10 text-success border-success/30",
  REJECTED: "bg-muted text-muted-foreground border-border",
};

const TABS: { key: string; label: string; status?: SubmissionStatus }[] = [
  { key: "pending", label: "Pending", status: "PENDING" },
  { key: "published", label: "Published", status: "PUBLISHED" },
  { key: "rejected", label: "Rejected", status: "REJECTED" },
  { key: "all", label: "All" },
];

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = TABS.find((t) => t.key === status) ?? TABS[0];

  const [submissions, counts] = await Promise.all([
    prisma.experienceSubmission.findMany({
      where: active.status ? { status: active.status } : {},
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: { submittedBy: { select: { email: true, name: true } } },
    }),
    prisma.experienceSubmission.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countFor = (s?: SubmissionStatus) =>
    s
      ? counts.find((c) => c.status === s)?._count._all ?? 0
      : counts.reduce((n, c) => n + c._count._all, 0);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Experience submissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Candidate-submitted experiences. Review and publish to add them to the
          live catalog.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/submissions?status=${t.key}`}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active.key === t.key
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:bg-background-subtle"
            }`}
          >
            {t.label}
            <span className="text-xs opacity-80">({countFor(t.status)})</span>
          </Link>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Inbox className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No {active.status ? active.label.toLowerCase() : ""} submissions.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/submissions/${s.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 hover:border-border-strong hover:shadow-xs transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {s.companyName}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_PILL[s.status]}`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {s.role} · {s.year} · by{" "}
                    {s.submittedBy.name || s.submittedBy.email}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
