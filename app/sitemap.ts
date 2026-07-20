import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

// Avoid querying the DB during `next build` (Vercel → Supabase pooler often
// returns P1001 from the build region). Generate on request instead.
export const dynamic = "force-dynamic";

function siteBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function staticEntries(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteBaseUrl();

  try {
    const [companies, interviews, subTopics] = await Promise.all([
      prisma.company.findMany({ select: { slug: true } }),
      prisma.interview.findMany({ select: { id: true, publishedAt: true } }),
      prisma.subTopic.findMany({ select: { slug: true } }),
    ]);

    const companyUrls = companies.map((c) => ({
      url: `${baseUrl}/companies/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    const interviewUrls = interviews.map((i) => ({
      url: `${baseUrl}/experiences/${i.id}`,
      lastModified: new Date(i.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const subTopicUrls = subTopics.map((st) => ({
      url: `${baseUrl}/sub-topics/${st.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [
      ...staticEntries(baseUrl),
      ...companyUrls,
      ...interviewUrls,
      ...subTopicUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticEntries(baseUrl);
  }
}
