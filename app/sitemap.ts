import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { getCountry, incomeSlugFromBand } from "@/lib/countries";
import { BLOG_POSTS } from "@/data/blog-posts-path";
import { getAllMarkdownPosts } from "@/lib/markdown";

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

  // Income bracket × city pages (50 cities × 7 bands = 350 pages)
  const incomeRoutes: MetadataRoute.Sitemap = CITIES.flatMap((c) => {
    const country = getCountry(c.countrySlug);
    if (!country) return [];
    return country.incomeBands.map((band) => ({
      url:             `${BASE_URL}/financial-position/${c.slug}/${incomeSlugFromBand(band)}`,
      lastModified:    now,
      changeFrequency: "monthly" as const,
      priority:        0.80,
    }));
  });

  // Static blog posts
  const staticBlogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url:             `${BASE_URL}/blog/${p.slug}`,
    lastModified:    new Date(p.date),
    changeFrequency: "monthly" as const,
    priority:        0.75,
  }));

  // Markdown-generated blog posts (deduplicated against static)
  const staticSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
  const markdownBlogRoutes: MetadataRoute.Sitemap = getAllMarkdownPosts()
    .filter((p) => !staticSlugs.has(p.slug))
    .map((p) => ({
      url:             `${BASE_URL}/blog/${p.slug}`,
      lastModified:    new Date(p.date),
      changeFrequency: "monthly" as const,
      priority:        0.75,
    }));

  return [
    ...staticRoutes,
    ...financialPositionRoutes,
    ...incomeRoutes,
    ...affordabilityRoutes,
    ...staticBlogRoutes,
    ...markdownBlogRoutes,
  ];
}
