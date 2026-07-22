import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ForbiddenError, UnauthorizedError, requireAdminOrPanelist } from "@/lib/auth/guards";

import { NewInterviewClient } from "./new-interview-client";

export const metadata = {
  title: "New interview | Admin",
};

export const dynamic = "force-dynamic";

export default async function NewInterviewPage() {
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

  const [companies, topicAreas, subTopics, roleLevels] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.topicArea.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, sortOrder: true },
    }),
    prisma.subTopic.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, topicAreaId: true },
    }),
    prisma.roleLevel.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">New interview</h1>
        <p className="text-muted-foreground text-sm">
          Capture a full interview process. Drafts autosave to your browser.
        </p>
      </header>
      <NewInterviewClient
        companies={companies}
        topicAreas={topicAreas}
        subTopics={subTopics}
        roleLevels={roleLevels}
      />
    </div>
  );
}
