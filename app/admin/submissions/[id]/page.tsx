import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { prisma } from "@/lib/db";
import { experienceSubmissionSchema } from "@/lib/validations/experience-submission";
import { SubmissionReviewActions } from "@/components/admin/SubmissionReviewActions";

export const dynamic = "force-dynamic";

const label = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await prisma.experienceSubmission.findUnique({
    where: { id },
    include: { submittedBy: { select: { email: true, name: true } } },
  });
  if (!submission) notFound();

  const parsed = experienceSubmissionSchema.safeParse(submission.payload);
  const data = parsed.success ? parsed.data : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> All submissions
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {submission.companyName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {submission.role} · {submission.year} · submitted by{" "}
            {submission.submittedBy.name || submission.submittedBy.email}
          </p>
        </div>
        <span className="rounded-full border border-border bg-background-subtle px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          {submission.status}
        </span>
      </header>

      {submission.status === "PUBLISHED" && submission.publishedInterviewId && (
        <Link
          href={`/experiences/${submission.publishedInterviewId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          View published experience <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      )}
      {submission.status === "REJECTED" && submission.reviewNotes && (
        <div className="rounded-lg border border-border bg-background-subtle p-4 text-sm">
          <p className="font-semibold text-foreground">Rejection feedback</p>
          <p className="mt-1 text-muted-foreground">{submission.reviewNotes}</p>
        </div>
      )}

      {!data ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          This submission&apos;s payload could not be parsed and may be
          malformed. Publishing is disabled.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Candidate profile */}
          {(data.candidateBranch ||
            data.candidateCgpa != null ||
            data.candidateGradYear != null ||
            data.candidateBackground) && (
            <Card title="Candidate profile">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {data.candidateBranch && <Stat k="Branch" v={label(data.candidateBranch)} />}
                {data.candidateCgpa != null && <Stat k="CGPA" v={String(data.candidateCgpa)} />}
                {data.candidateGradYear != null && <Stat k="Grad year" v={String(data.candidateGradYear)} />}
              </dl>
              {data.candidateBackground && (
                <p className="mt-3 text-sm text-muted-foreground">{data.candidateBackground}</p>
              )}
            </Card>
          )}

          {/* Rounds */}
          {data.rounds.map((r, i) => (
            <Card key={i} title={`Round ${i + 1}: ${r.roundName}`}>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <Tag>{label(r.roundType)}</Tag>
                <Tag>{label(r.mode)}</Tag>
                <Tag>{label(r.outcome)}</Tag>
                {r.durationMinutes != null && <Tag>{r.durationMinutes} min</Tag>}
              </div>
              {r.keyLearnings && (
                <p className="mt-3 text-sm text-muted-foreground">{r.keyLearnings}</p>
              )}
              <ul className="mt-4 space-y-3">
                {r.questions.map((q, qi) => (
                  <li key={qi} className="rounded-md border border-border bg-background p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
                      {q.subTopicName}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                      {q.questionText}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          {data.biggestTip && (
            <Card title="Biggest tip">
              <p className="text-sm text-muted-foreground">{data.biggestTip}</p>
            </Card>
          )}

          {submission.status === "PENDING" && (
            <SubmissionReviewActions id={submission.id} />
          )}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-xs">
      <h2 className="mb-3 text-sm font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-foreground">{v}</dd>
    </div>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-border bg-background-subtle px-2 py-0.5">
      {children}
    </span>
  );
}
