import { DAILY_COMPANY_LIMIT } from "@/lib/intelligence/access";

export const DAILY_LIMIT_REACHED_TITLE =
  "You've already viewed 2 companies today";

export const DAILY_LIMIT_RESET_DESCRIPTION =
  "Your daily limit resets at 12 midnight IST.";

export const DAILY_LIMIT_REACHED_DESCRIPTION_COMPANY = `${DAILY_LIMIT_RESET_DESCRIPTION} Come back after that to explore more companies.`;

export const DAILY_LIMIT_REACHED_DESCRIPTION_EXPERIENCE = `${DAILY_LIMIT_RESET_DESCRIPTION} Visit this company's page after that or explore companies you've already unlocked today.`;

export function formatDailyCompanyLimitUsage(remaining: number): string {
  const used = DAILY_COMPANY_LIMIT - remaining;
  return `Daily Limit: ${used} out of ${DAILY_COMPANY_LIMIT} companies seen`;
}
