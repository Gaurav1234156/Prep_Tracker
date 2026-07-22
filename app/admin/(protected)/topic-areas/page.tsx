import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ForbiddenError, UnauthorizedError, requireAdminOrPanelist } from "@/lib/auth/guards";
import { TopicAreasClient } from "./topic-areas-client";

export const metadata = {
  title: "Topic Areas | Admin",
};

export const dynamic = "force-dynamic";

export default async function TopicAreasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await requireAdminOrPanelist();
  } catch (err) {
    if (err instanceof ForbiddenError) redirect("/");
    if (err instanceof UnauthorizedError) redirect("/login");
    throw err;
  }

  const topicAreas = await prisma.topicArea.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
      _count: {
        select: {
          subTopics: true,
          topicCoverages: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <TopicAreasClient initialTopicAreas={topicAreas} />
    </div>
  );
}
