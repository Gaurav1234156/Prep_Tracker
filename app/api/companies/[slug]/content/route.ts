import { NextRequest, NextResponse } from "next/server";

import {
  checkCompanyAccess,
  DAILY_COMPANY_LIMIT,
} from "@/lib/intelligence/access";
import { getCurrentDbUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { fetchCompanyTabData } from "@/lib/queries/company-content";
import { fetchCompanyIntelligence } from "@/lib/queries/company-intelligence";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
    }

    const { slug } = await params;

    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const access = await checkCompanyAccess(user.id, company.id, user.role);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: "daily_limit_reached",
          limit: DAILY_COMPANY_LIMIT,
          remaining: 0,
        },
        { status: 403 },
      );
    }

    const [intelligence, tabData] = await Promise.all([
      fetchCompanyIntelligence(company.id),
      fetchCompanyTabData(company.id),
    ]);

    return NextResponse.json({
      remaining: access.remaining,
      intelligence,
      interviews: tabData.interviews,
      roleLevels: tabData.roleLevels,
    });
  } catch (error) {
    console.error("[company-content] GET failed:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
