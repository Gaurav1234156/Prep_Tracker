import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

export {
  FEATURE_FLAG_KEYS,
  WIRED_FLAGS,
  isFlagWired,
  type FeatureFlagKey,
} from "@/lib/feature-flags.constants";

// Feature flags rarely change; cache so the flag read drops out of the hot path.
// Invalidated immediately by toggleFeatureFlag() via revalidateTag("feature-flags").
export const getFeatureFlag = (key: string) =>
  unstable_cache(
    async () => prisma.featureFlag.findUnique({ where: { key } }),
    ["feature-flag", key],
    { revalidate: 300, tags: ["feature-flags"] },
  )();

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flag = await getFeatureFlag(key);
  return flag?.enabled ?? false;
}
