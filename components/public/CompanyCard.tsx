import Link from "next/link";
import { Calendar, Layout } from "lucide-react";

import { CompanyLogo } from "@/components/common/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { CompanyDeleteButton } from "@/components/public/CompanyDeleteButton";
import { CompanyCtcEditButton } from "@/components/public/CompanyCtcEditButton";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    websiteUrl?: string | null;
    interviewCount: number;
    roleLevelsCovered: { id: string; name: string; slug: string }[];
    mostRecentYear?: number | null;
    ctc?: number | null;
  };
  /** When true, renders an admin-only delete control over the card. */
  canManage?: boolean;
}

export function CompanyCard({ company, canManage = false }: CompanyCardProps) {
  return (
    <div className="group relative h-full">
      {canManage ? (
        <>
          <CompanyCtcEditButton
            companyId={company.id}
            companyName={company.name}
            currentCtc={company.ctc ?? null}
          />
          <CompanyDeleteButton
            companyId={company.id}
            companyName={company.name}
            interviewCount={company.interviewCount}
          />
        </>
      ) : null}
      <Link
        href={`/companies/${company.slug}`}
        className="flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-background-elevated p-6 transition-all duration-150 hover:border-border-strong hover:shadow-sm"
      >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <CompanyLogo
            name={company.name}
            website={company.websiteUrl}
            size="md"
          />
          <div className="min-w-0">
            <h4 className="text-lg font-semibold text-foreground leading-tight group-hover:text-brand transition-colors">
              {company.name}
            </h4>
            <div className="flex flex-col gap-1 mt-1">
              {company.mostRecentYear ? (
                <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                  <Calendar className="h-3 w-3 shrink-0 text-brand" />
                  Active: {company.mostRecentYear}
                </span>
              ) : null}
              {company.ctc != null ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                  <span className="text-brand font-bold">CTC:</span> {company.ctc} LPA
                </span>
              ) : (
                canManage && (
                  <span className="inline-flex items-center gap-1 text-xs text-foreground-muted italic">
                    No CTC set
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {company.description ? (
          <p className="text-sm text-foreground-muted leading-relaxed line-clamp-2">
            {company.description}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-4">
        {company.roleLevelsCovered.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {company.roleLevelsCovered.slice(0, 3).map((level) => (
              <Badge key={level.id} variant="secondary">
                {level.name}
              </Badge>
            ))}
            {company.roleLevelsCovered.length > 3 ? (
              <Badge variant="outline">
                +{company.roleLevelsCovered.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-foreground-muted">
            <Layout className="h-3.5 w-3.5 text-brand" />
            {company.interviewCount}{" "}
            {company.interviewCount === 1 ? "experience" : "experiences"}
          </span>
          <span className="font-medium text-brand transition-transform group-hover:translate-x-0.5">
            View →
          </span>
        </div>
      </div>
      </Link>
    </div>
  );
}
