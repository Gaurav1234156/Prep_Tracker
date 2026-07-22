import Link from "next/link";
import { redirect } from "next/navigation";
import { EyeIcon, PencilIcon, PlusIcon, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

import { DeleteInterviewButton } from "./delete-button";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminInterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const pageNum = Math.max(1, Number(params.page ?? 1) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const [total, rows] = await Promise.all([
    prisma.interview.count(),
    prisma.interview.findMany({
      orderBy: { publishedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        company: { select: { name: true, slug: true, logoUrl: true } },
        roleLevel: { select: { name: true } },
        _count: { select: { rounds: true } },
        rounds: {
          select: {
            topicCoverages: {
              select: {
                _count: {
                  select: { entries: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (total === 0) {
    return (
      <div className="space-y-6">
        <PageHeader empty />
        <Card>
          <CardHeader>
            <CardTitle>No interviews yet.</CardTitle>
            <CardDescription>Add the first one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/admin/interviews/new" />}>
              <PlusIcon className="size-4" />
              Add interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="rounded-lg border border-border bg-background overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-muted-foreground border-b border-border">
            <tr className="text-left text-xs uppercase tracking-wider font-extrabold">
              <th className="px-4 py-3 font-extrabold">Company</th>
              <th className="px-4 py-3 font-extrabold">Role</th>
              <th className="px-4 py-3 font-extrabold">Role Level</th>
              <th className="px-4 py-3 font-extrabold">Year</th>
              <th className="px-4 py-3 font-extrabold">Rounds</th>
              <th className="px-4 py-3 font-extrabold">Sub-Topics</th>
              <th className="px-4 py-3 font-extrabold">Created</th>
              <th className="px-4 py-3 font-extrabold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const subTopicTotal = row.rounds.reduce(
                (acc, r) =>
                  acc +
                  r.topicCoverages.reduce(
                    (tcAcc, tc) => tcAcc + tc._count.entries,
                    0,
                  ),
                0,
              );
              return (
                <tr key={row.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-foreground">{row.company.name}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-bold text-foreground">{row.role}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-muted-foreground text-xs font-semibold">
                      {row.roleLevel.name}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{row.year}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-foreground">
                    {row._count.rounds}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-foreground">{subTopicTotal}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs font-semibold">
                    {row.publishedAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        render={
                          <Link href={`/admin/interviews/${row.id}`} />
                        }
                      >
                        <EyeIcon className="size-3.5" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        render={
                          <Link href={`/admin/interviews/${row.id}/edit`} />
                        }
                      >
                        <PencilIcon className="size-3.5" />
                        Edit
                      </Button>
                      <DeleteInterviewButton id={row.id} label="Delete" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {pageNum} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum <= 1}
              render={
                <Link
                  href={`/admin/interviews?page=${Math.max(1, pageNum - 1)}`}
                  aria-disabled={pageNum <= 1}
                />
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum >= totalPages}
              render={
                <Link
                  href={`/admin/interviews?page=${Math.min(totalPages, pageNum + 1)}`}
                  aria-disabled={pageNum >= totalPages}
                />
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PageHeader({ empty }: { empty?: boolean }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">Interviews</h1>
        <p className="text-muted-foreground text-sm">
          Browse and manage every interview captured in the system.
        </p>
      </div>
      {empty ? null : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href="/admin/imports/new" />}
          >
            <Upload className="size-4" />
            Upload CSV
          </Button>
          <Button render={<Link href="/admin/interviews/new" />}>
            <PlusIcon className="size-4" />
            New interview
          </Button>
        </div>
      )}
    </header>
  );
}
