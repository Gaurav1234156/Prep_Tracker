import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/public/EmptyState";
import { Building2, Compass, ExternalLink, Layout } from "lucide-react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { CompanyLogo } from "@/components/common/CompanyLogo";

const CompanyTabs = dynamic(
  () => import("@/components/public/CompanyTabs").then((mod) => mod.CompanyTabs),
  { loading: () => <div className="h-96 bg-card border border-border rounded-md animate-pulse flex items-center justify-center text-xs text-muted-foreground/50 font-bold">Loading company experiences and analytics...</div> }
);

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

  // Retrieve complete company structure including interviews, rounds, and subtopic entries
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      interviews: {
        orderBy: {
          year: "desc",
        },
        include: {
          roleLevel: true,
          company: {
            select: {
              name: true,
              logoUrl: true,
              slug: true,
            },
          },
          rounds: {
            orderBy: {
              roundNumber: "asc",
            },
            include: {
              topicCoverages: {
                include: {
                  entries: {
                    include: {
                      subTopic: {
                        include: {
                          topicArea: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  // Derive core statistics
  const totalInterviews = company.interviews.length;
  
  const levelsMap = new Map<string, { id: string; name: string }>();
  let maxYear = 0;
  company.interviews.forEach((i) => {
    if (i.roleLevel) {
      levelsMap.set(i.roleLevel.id, { id: i.roleLevel.id, name: i.roleLevel.name });
    }
    if (i.year > maxYear) {
      maxYear = i.year;
    }
  });

  const uniqueLevels = Array.from(levelsMap.values());

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
              {company.ctc != null ? (
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

      {/* Dynamic Interactive tabs panel */}
      {totalInterviews === 0 ? (
        <EmptyState
          title="No Experiences Logged"
          description={`We don't have any candidate experiences on file for ${company.name} yet. Check back soon or visit other hiring firms.`}
          icon={Building2}
        />
      ) : (
        <CompanyTabs
          interviews={company.interviews}
          roleLevels={uniqueLevels}
        />
      )}
      </div>
    </div>
  );
}
