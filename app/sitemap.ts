import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { BLOG_POSTS } from "@/data/blog-posts-path";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                       lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/blog`,             lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/methodology`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`,          lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  const financialPositionRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url:             `${BASE_URL}/financial-position/${c.slug}`,
    lastModified:    now,
    changeFrequency: "monthly" as const,
    priority:        0.85,
  }));

  const affordabilityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url:             `${BASE_URL}/affordability/${c.slug}`,
    lastModified:    now,
    changeFrequency: "monthly" as const,
    priority:        0.80,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url:             `${BASE_URL}/blog/${p.slug}`,
    lastModified:    new Date(p.date),
    changeFrequency: "monthly" as const,
    priority:        0.75,
  }));

  return [...staticRoutes, ...financialPositionRoutes, ...affordabilityRoutes, ...blogRoutes];
}
