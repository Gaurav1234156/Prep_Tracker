import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/companies", "/experiences", "/sub-topics", "/search"],
        disallow: ["/admin", "/api", "/login", "/signup", "/sso"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
