import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ForbiddenError, UnauthorizedError, requireAdminOrPanelist } from "@/lib/auth/guards";
import { SubTopicsClient } from "./sub-topics-client";

export const metadata = {
  title: "Sub-Topics | Admin",
};

export const dynamic = "force-dynamic";

export default async function SubTopicsPage() {
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

  const [subTopics, topicAreas] = await Promise.all([
    prisma.subTopic.findMany({
      orderBy: [
        { topicArea: { sortOrder: "asc" } },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        topicAreaId: true,
        topicArea: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
    }),
    prisma.topicArea.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <SubTopicsClient initialSubTopics={subTopics} topicAreas={topicAreas} />
    </div>
  );
}
