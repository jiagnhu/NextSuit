import type { MetadataRoute } from "next";

import { contentApi } from "@/lib/content-api";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    }
  ];

  try {
    const articles = await contentApi.listAllArticles();

    return [
      ...baseEntries,
      ...articles.map((article) => ({
        url: `${siteUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8
      }))
    ];
  } catch {
    return baseEntries;
  }
}
