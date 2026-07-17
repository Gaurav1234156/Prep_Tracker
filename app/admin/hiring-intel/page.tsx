import Link from "next/link";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Export Hiring Intel | Admin" };

export default async function HiringIntelExportPage() {
  await requireAdminOrPanelist();

  const [jobCount, companyCount] = await Promise.all([
    prisma.job.count(),
    prisma.company.count({ where: { jobs: { some: {} } } }),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight font-display">
          Export Hiring Intel
        </h1>
        <p className="text-sm text-muted-foreground">
          Download all company job and role hiring data as a CSV file. One row
          per job, grouped by company.
        </p>
      </header>

      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">Ready to export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {jobCount} job{jobCount === 1 ? "" : "s"} across{" "}
            {companyCount} compan{companyCount === 1 ? "y" : "ies"} with hiring
            intel.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {jobCount > 0 ? (
              <Button
                render={<a href="/api/admin/hiring-intel/export" />}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            ) : (
              <Button disabled className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            )}
            <Button variant="outline" render={<Link href="/admin" />}>
              Back to admin
            </Button>
          </div>
          {jobCount === 0 && (
            <p className="text-xs text-muted-foreground">
              No job records found. Import hiring intel first, then export.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
