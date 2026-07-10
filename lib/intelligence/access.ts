import { Prisma, UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";

export const DAILY_COMPANY_LIMIT = 2;
/** @deprecated Use DAILY_COMPANY_LIMIT */
export const DAILY_INTELLIGENCE_LIMIT = DAILY_COMPANY_LIMIT;

const IST_TIMEZONE = "Asia/Kolkata";

export type CompanyAccessResult = {
  allowed: boolean;
  remaining: number | null;
  reason?: "daily_limit_reached";
};

/** @deprecated Use CompanyAccessResult */
export type IntelligenceAccessResult = CompanyAccessResult;

export function getTodayDateIST(): Date {
  const istDateStr = new Date().toLocaleDateString("en-CA", {
    timeZone: IST_TIMEZONE,
  });
  return new Date(`${istDateStr}T00:00:00.000Z`);
}

function isPrivilegedRole(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.PANELIST;
}

async function getTodaysCompanyViews(userId: string, viewDate: Date) {
  return prisma.intelligenceView.findMany({
    where: { userId, viewDate },
    select: { companyId: true },
  });
}

/** Read-only access check — does not record a new company unlock. */
export async function peekCompanyAccess(
  userId: string,
  companyId: string,
  role: UserRole,
): Promise<CompanyAccessResult> {
  if (isPrivilegedRole(role)) {
    return { allowed: true, remaining: null };
  }

  const viewDate = getTodayDateIST();
  const todaysViews = await getTodaysCompanyViews(userId, viewDate);
  const alreadyViewed = todaysViews.some((view) => view.companyId === companyId);

  if (alreadyViewed) {
    return {
      allowed: true,
      remaining: Math.max(0, DAILY_COMPANY_LIMIT - todaysViews.length),
    };
  }

  if (todaysViews.length >= DAILY_COMPANY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      reason: "daily_limit_reached",
    };
  }

  return {
    allowed: true,
    remaining: DAILY_COMPANY_LIMIT - todaysViews.length,
  };
}

/** Records a company unlock for today when access is newly granted. */
export async function checkCompanyAccess(
  userId: string,
  companyId: string,
  role: UserRole,
): Promise<CompanyAccessResult> {
  if (isPrivilegedRole(role)) {
    return { allowed: true, remaining: null };
  }

  const viewDate = getTodayDateIST();

  return prisma.$transaction(async (tx) => {
    const todaysViews = await tx.intelligenceView.findMany({
      where: { userId, viewDate },
      select: { companyId: true },
    });

    const alreadyViewed = todaysViews.some((view) => view.companyId === companyId);
    if (alreadyViewed) {
      return {
        allowed: true,
        remaining: Math.max(0, DAILY_COMPANY_LIMIT - todaysViews.length),
      };
    }

    if (todaysViews.length >= DAILY_COMPANY_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        reason: "daily_limit_reached",
      };
    }

    try {
      await tx.intelligenceView.upsert({
        where: {
          userId_companyId_viewDate: { userId, companyId, viewDate },
        },
        create: { userId, companyId, viewDate },
        update: {},
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          allowed: true,
          remaining: Math.max(0, DAILY_COMPANY_LIMIT - todaysViews.length),
        };
      }
      throw error;
    }

    return {
      allowed: true,
      remaining: DAILY_COMPANY_LIMIT - todaysViews.length - 1,
    };
  });
}

/** @deprecated Use checkCompanyAccess */
export const checkIntelligenceAccess = checkCompanyAccess;
