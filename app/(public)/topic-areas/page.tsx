import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, ChevronRight } from "lucide-react";

import { getTopicAreasIndex } from "@/lib/queries/topic-area-detail";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Browse Topic Areas — Interview Questions by Topic",
  description:
    "Pick a topic area to see every interview question candidates were asked, labeled by company and role, with filters.",
};

export default async function TopicAreasIndexPage() {
  const areas = await getTopicAreasIndex();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm">
          <BookOpen className="w-3 h-3" />
          Taxonomy
        </span>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Browse by topic
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a topic to see the actual questions candidates were asked —
          labeled by company and role, fully filterable.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/topic-areas/${area.slug}`}
            className="group flex flex-col justify-between h-full bg-background border border-border rounded-lg p-5 hover:border-border-strong hover:shadow-sm transition-all duration-150"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-[6px] border border-primary/20 bg-primary/10 text-primary w-fit shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-foreground text-sm leading-tight mt-1 group-hover:text-primary transition-colors">
                {area.name}
              </h2>
            </div>
            <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>{area.subTopicCount} sub-topics</span>
              <span className="text-primary inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                Explore <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
