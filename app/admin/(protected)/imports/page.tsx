import Link from "next/link";
import { ImportStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bulk imports | Admin" };

export default async function ImportsListPage() {
  await requireAdminOrPanelist();

  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      uploadedBy: { select: { email: true, name: true } },
      rows: { select: { status: true } },
    },
  });

  function countByStatus(rows: { status: ImportStatus }[], s: ImportStatus) {
    return rows.filter((r) => r.status === s).length;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bulk imports
          </h1>
          <p className="text-sm text-muted-foreground">
            Each batch maps to one uploaded CSV. Rows progress through{" "}
            Queued → Extracting → Ready for review → Published.
          </p>
        </div>
        <Button render={<Link href="/admin/imports/new" />}>New import</Button>
      </header>

      {batches.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          No imports yet. Upload a CSV to get started.
        </Card>
      ) : (
        <div className="space-y-3">
          {batches.map((b) => {
            const counts = {
              queued: countByStatus(b.rows, "QUEUED"),
              extracting: countByStatus(b.rows, "EXTRACTING"),
              ready: countByStatus(b.rows, "READY_FOR_REVIEW"),
              published: countByStatus(b.rows, "PUBLISHED"),
              failed: countByStatus(b.rows, "FAILED"),
            };

            return (
              <Link key={b.id} href={`/admin/imports/${b.id}`} className="block">
                <Card className="hover:border-primary/50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{b.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.totalRows} rows · uploaded{" "}
                        {new Date(b.createdAt).toLocaleString()} by{" "}
                        {b.uploadedBy.name ?? b.uploadedBy.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {counts.queued > 0 && (
                        <Badge variant="outline">{counts.queued} queued</Badge>
                      )}
                      {counts.extracting > 0 && (
                        <Badge variant="outline">
                          {counts.extracting} extracting
                        </Badge>
                      )}
                      {counts.ready > 0 && (
                        <Badge variant="default">
                          {counts.ready} ready for review
                        </Badge>
                      )}
                      {counts.published > 0 && (
                        <Badge variant="success">
                          {counts.published} published
                        </Badge>
                      )}
                      {counts.failed > 0 && (
                        <Badge variant="destructive">
                          {counts.failed} failed
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
