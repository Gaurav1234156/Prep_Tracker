import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("ids");
  if (!raw) return NextResponse.json([]);

  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (ids.length === 0) return NextResponse.json([]);

  const interviews = await prisma.interview.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      role: true,
      year: true,
      company: { select: { name: true, slug: true, logoUrl: true } },
      roleLevel: { select: { name: true } },
    },
  });

  const map = new Map(interviews.map((i) => [i.id, i]));
  const ordered = ids.map((id) => map.get(id)).filter(Boolean);
  return NextResponse.json(ordered);
}
