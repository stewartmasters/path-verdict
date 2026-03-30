import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { generateSeoPages } from "@/lib/seo-pages";
import { generateEsPages } from "@/lib/es/seo-pages-es";
import { getAllBlogPosts } from "@/lib/blogPosts";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://salaryverdict.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const seoPages = generateSeoPages();
  const esPages = generateEsPages();
  const blogPosts = getAllBlogPosts();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/es`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    // /check is noindex — intentionally excluded from sitemap
  ];

  const salaryRoutes: MetadataRoute.Sitemap = seoPages.map((p) => ({
    url: `${BASE_URL}/salary/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p.type === "role-location" ? 0.9 : 0.7,
  }));

  const esRoutes: MetadataRoute.Sitemap = esPages.map((p) => ({
    url: `${BASE_URL}/es/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p.type === "role-city" ? 0.9 : p.type === "salary-question" ? 0.85 : 0.75,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...salaryRoutes, ...esRoutes, ...blogRoutes];
}
