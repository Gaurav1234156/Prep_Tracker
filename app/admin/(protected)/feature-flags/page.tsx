import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";

import { FeatureFlagsClient } from "./feature-flags-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feature flags | Admin" };

export default async function FeatureFlagsPage() {
  await requireAdminOrPanelist();

  const flags = await prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Feature flags</h1>
        <p className="text-sm text-muted-foreground">
          Toggle features on or off at runtime without redeploying.
        </p>
      </header>

      <FeatureFlagsClient
        initialFlags={flags.map((f) => ({
          key: f.key,
          enabled: f.enabled,
          description: f.description,
          updatedAt: f.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
