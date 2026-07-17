import { NextResponse } from "next/server";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { jobsToHiringIntelCsv } from "@/lib/exports/hiring-intel-csv";

export async function GET() {
  const user = await getCurrentDbUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PANELIST")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    select: {
      externalJobId: true,
      role: true,
      techStack: true,
      optionalSkills: true,
      ctcMin: true,
      ctcMax: true,
      openings: true,
      location: true,
      jobType: true,
      product: true,
      hubspotUrl: true,
      sourceCategory: true,
      enteredBy: true,
      enteredAt: true,
      updatedAt: true,
      interviewProcess: true,
      company: { select: { name: true } },
    },
    orderBy: [
      { company: { name: "asc" } },
      { role: "asc" },
      { updatedAt: "desc" },
    ],
  });

  const csv = jobsToHiringIntelCsv(
    jobs.map((job) => ({
      companyName: job.company.name,
      externalJobId: job.externalJobId,
      role: job.role,
      techStack: job.techStack,
      optionalSkills: job.optionalSkills,
      ctcMin: job.ctcMin,
      ctcMax: job.ctcMax,
      openings: job.openings,
      location: job.location,
      jobType: job.jobType,
      product: job.product,
      hubspotUrl: job.hubspotUrl,
      sourceCategory: job.sourceCategory,
      enteredBy: job.enteredBy,
      enteredAt: job.enteredAt,
      updatedAt: job.updatedAt,
      interviewProcess: job.interviewProcess,
    })),
  );

  const filename = `hiring-intel-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
