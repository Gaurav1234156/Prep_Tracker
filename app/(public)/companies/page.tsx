import { getCompaniesList, getFilterMetadata } from "@/lib/queries/companies-list";
import { FEATURE_FLAG_KEYS, getFeatureFlag } from "@/lib/feature-flags";
import { CompaniesFilterBar } from "@/components/public/CompaniesFilterBar";
import { CompanyCard } from "@/components/public/CompanyCard";
import { EmptyState } from "@/components/public/EmptyState";
import { Building2, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { UserRole } from "@prisma/client";

export const revalidate = 3600; // ISR cache for 1 hour

export const metadata: Metadata = {
  title: "Browse Companies — Interview Experiences",
  description: "Explore visually structured technical interview experiences, timelines, and specific round structures from top companies.",
};

interface CompaniesPageProps {
  searchParams: Promise<{
    q?: string;
    roleLevel?: string;
    cursor?: string;
    branch?: string;
    cgpaMin?: string;
    cgpaMax?: string;
    ctcMin?: string;
    ctcMax?: string;
  }>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const [filterMetadata, profileFilterFlag] = await Promise.all([
    getFilterMetadata(),
    getFeatureFlag(FEATURE_FLAG_KEYS.SHOW_CANDIDATE_PROFILE_FILTER),
  ]);
  const showProfileFilter = profileFilterFlag?.enabled ?? false;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Browse companies
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse interview paths and timeline metrics from candidate experiences at top-tier firms.
        </p>
      </div>

      <CompaniesFilterBar
        roleLevels={filterMetadata.roleLevels}
        showProfileFilter={showProfileFilter}
      />

      {/* Grid or Empty state wrapped in Suspense */}
      <Suspense key={Math.random()} fallback={
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200/50 border border-border rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <CompaniesListContainer
          searchParams={searchParams}
          showProfileFilter={showProfileFilter}
        />
      </Suspense>

    </div>
  );
}

async function CompaniesListContainer({
  searchParams,
  showProfileFilter,
}: CompaniesPageProps & { showProfileFilter: boolean }) {
  const params = await searchParams;
  const q = params.q || "";
  const roleLevelParam = params.roleLevel || "";
  const cursor = params.cursor || "";
  const branchParam = showProfileFilter ? params.branch || "" : "";
  const cgpaMin =
    showProfileFilter && params.cgpaMin ? Number(params.cgpaMin) : undefined;
  const cgpaMax =
    showProfileFilter && params.cgpaMax ? Number(params.cgpaMax) : undefined;
  const ctcMin = params.ctcMin ? Number(params.ctcMin) : undefined;
  const ctcMax = params.ctcMax ? Number(params.ctcMax) : undefined;

  const selectedLevels = roleLevelParam.split(",").filter(Boolean);
  const selectedBranches = branchParam.split(",").filter(Boolean);

  const limit = 9;

  const currentUser = await getCurrentDbUser();
  const canManage =
    currentUser?.role === UserRole.ADMIN ||
    currentUser?.role === UserRole.PANELIST;

  const { companies, nextCursor } = await getCompaniesList({
    q,
    roleLevels: selectedLevels,
    branches: selectedBranches,
    cgpaMin: Number.isFinite(cgpaMin) ? cgpaMin : undefined,
    cgpaMax: Number.isFinite(cgpaMax) ? cgpaMax : undefined,
    ctcMin: Number.isFinite(ctcMin) ? ctcMin : undefined,
    ctcMax: Number.isFinite(ctcMax) ? ctcMax : undefined,
    cursor: cursor || undefined,
    limit,
  });

  // Construct page links for next/prev paging
  const buildPageUrl = (newCursor: string | null) => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set("q", q);
    if (roleLevelParam) urlParams.set("roleLevel", roleLevelParam);
    if (showProfileFilter && branchParam) urlParams.set("branch", branchParam);
    if (showProfileFilter && cgpaMin != null) {
      urlParams.set("cgpaMin", String(cgpaMin));
    }
    if (showProfileFilter && cgpaMax != null) {
      urlParams.set("cgpaMax", String(cgpaMax));
    }
    if (ctcMin != null) urlParams.set("ctcMin", String(ctcMin));
    if (ctcMax != null) urlParams.set("ctcMax", String(ctcMax));
    if (newCursor) urlParams.set("cursor", newCursor);
    return `/companies?${urlParams.toString()}`;
  };

  if (companies.length === 0) {
    return (
      <EmptyState
        title="No Companies Match Filters"
        description="Try broadening your name search or clearing checked role levels."
        icon={Building2}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CompanyCard company={company} canManage={canManage} />
          </div>
        ))}
      </div>

      {/* Simple Server-side Pagination Controls */}
      {(nextCursor || cursor) && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-border">
          {cursor && (
            <Link href={buildPageUrl(null)}>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold border border-border bg-card hover:bg-secondary text-foreground rounded-[6px] transition-all shadow-sm cursor-pointer select-none">
                <ChevronLeft className="w-4 h-4" />
                Reset to Page 1
              </span>
            </Link>
          )}
          
          {nextCursor && (
            <Link href={buildPageUrl(nextCursor)}>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold border border-border bg-card hover:bg-secondary text-foreground rounded-[6px] transition-all shadow-sm cursor-pointer select-none">
                Next Page
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
