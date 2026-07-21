import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/companies`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      ...companyUrls,
      ...interviewUrls,
      ...subTopicUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        priority: 1.0,
      },
    ];
  }
}
