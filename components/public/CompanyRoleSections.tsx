import { BarChart3, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getRoleAssessmentUrl } from "@/lib/constants/company-role-assessments";

interface CompanyRoleSectionsProps {
  companySlug: string;
  roles: string[];
}

export function CompanyRoleSections({
  companySlug,
  roles,
}: CompanyRoleSectionsProps) {
  if (roles.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Open roles
        </h2>
        <p className="text-xs text-muted-foreground">
          Roles currently hiring at this company. Start an assessment where
          available.
        </p>
      </div>

      <ul className="divide-y divide-border rounded-md border border-border">
        {roles.map((role) => {
          const assessmentUrl = getRoleAssessmentUrl(companySlug, role);

          return (
            <li
              key={role}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm font-medium text-foreground">{role}</p>
              {assessmentUrl ? (
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="gap-2"
                    render={
                      <a
                        href={assessmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    Take Assessment
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    render={<Link href="/assessment-result" />}
                  >
                    Get Result
                    <BarChart3 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
