import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/public/EmptyState";
import { Building2, Compass, ExternalLink, Layout } from "lucide-react";
import type { Metadata } from "next";

import { CompanyLogo } from "@/components/common/CompanyLogo";
import { CompanyContentGate } from "@/components/public/CompanyContentGate";
import { CompanyRoleSections } from "@/components/public/CompanyRoleSections";
import { getConfiguredRolesForCompany } from "@/lib/constants/company-role-assessments";

export const revalidate = 3600; // ISR cache for 1 hour

// Dynamic metadata generation for top-tier SEO indexability
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!company) {
    return { title: "Company Not Found | PrepIntel" };
  }

  return {
    title: `${company.name} Interview Questions & Experiences — PrepIntel`,
    description: company.description?.slice(0, 160) ?? `Browse real candidate interview experiences, specific rounds structure, and topic trends for ${company.name}.`,
  };
}

interface CompanyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      _count: { select: { jobs: true, interviews: true } },
      jobs: { select: { role: true } },
      interviews: {
        select: {
          year: true,
          roleLevel: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const hasIntelligence = company._count.jobs > 0;
  const totalInterviews = company._count.interviews;
  const hasContent = hasIntelligence || totalInterviews > 0;

  const levelsMap = new Map<string, { id: string; name: string }>();
  company.interviews.forEach((interview) => {
    if (interview.roleLevel) {
      levelsMap.set(interview.roleLevel.id, {
        id: interview.roleLevel.id,
        name: interview.roleLevel.name,
      });
    }
  });

  const uniqueLevels = Array.from(levelsMap.values());

  const roleSet = new Set<string>();
  for (const job of company.jobs) {
    if (job.role) roleSet.add(job.role);
  }
  for (const role of getConfiguredRolesForCompany(slug)) {
    roleSet.add(role);
  }
  const openRoles = Array.from(roleSet).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <header className="relative isolate overflow-hidden text-slate-200">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(225 25% 10%) 0%, hsl(232 22% 16%) 38%, hsl(228 20% 12%) 70%, hsl(220 18% 7%) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 50% at 0% 0%, hsl(234 70% 35% / 0.22), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 50% at 100% 100%, hsl(255 40% 30% / 0.20), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 40% at 0% 100%, hsl(220 30% 4% / 0.55), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-white/10"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5 min-w-0 sm:gap-6">
              <div className="relative shrink-0">
                <div
                  aria-hidden
                  className="absolute -inset-2 rounded-2xl bg-white/15 blur-xl"
                />
                <CompanyLogo
                  name={company.name}
                  website={company.websiteUrl}
                  logoUrl={company.logoUrl}
                  size="lg"
                  className="relative bg-white p-2 ring-1 ring-white/30 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.6)]"
                />
              </div>
              <div className="space-y-2 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Company
                </p>
                <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
                  {company.name}
                </h1>
                {company.websiteUrl ? (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-slate-100"
                  >
                    Official website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/60 px-3 py-1.5 text-slate-200 ring-1 ring-slate-500/30">
                <Layout className="h-4 w-4" />
                {totalInterviews}{" "}
                {totalInterviews === 1 ? "experience" : "experiences"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/60 px-3 py-1.5 text-slate-300 ring-1 ring-slate-500/25">
                <Compass className="h-4 w-4" />
                {uniqueLevels.length}{" "}
                {uniqueLevels.length === 1 ? "level" : "levels"}
              </span>
              {company.ctcMin != null || company.ctcMax != null ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-3 py-1.5 text-emerald-200 ring-1 ring-emerald-500/30 font-semibold">
                  💰 CTC:{" "}
                  {company.ctcMin != null &&
                  company.ctcMax != null &&
                  company.ctcMin !== company.ctcMax
                    ? `${company.ctcMin}–${company.ctcMax}`
                    : (company.ctcMin ?? company.ctcMax)}{" "}
                  LPA
                </span>
              ) : company.ctc != null ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-3 py-1.5 text-emerald-200 ring-1 ring-emerald-500/30 font-semibold">
                  💰 CTC: {company.ctc} LPA
                </span>
              ) : null}
            </div>
          </div>
          {company.description ? (
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
              {company.description}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <CompanyRoleSections companySlug={slug} roles={openRoles} />

        {hasContent ? (
          <CompanyContentGate
            companySlug={slug}
            companyName={company.name}
            hasContent={hasContent}
          />
        ) : openRoles.length === 0 ? (
          <EmptyState
            title="No Experiences Logged"
            description={`We don't have any candidate experiences on file for ${company.name} yet. Check back soon or visit other hiring firms.`}
            icon={Building2}
          />
        ) : null}
      </div>
    </div>
  );
}
