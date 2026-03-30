/**
 * Unified blog post layer.
 * Merges TypeScript posts (data/blog-posts.ts) with markdown posts (content/blog/*.md).
 * Sorted by date descending (newest first).
 *
 * Server-side only — imports fs via lib/markdown.ts.
 */

import { BLOG_POSTS, getBlogPost as getTsBlogPost, type BlogPost } from "@/data/blog-posts";
import { getAllMarkdownPosts, getMarkdownPost } from "@/lib/markdown";

let _cache: BlogPost[] | null = null;

function isPublished(post: BlogPost): boolean {
  const postDate = new Date(post.date);
  postDate.setHours(23, 59, 59, 999);
  return postDate <= new Date();
}

/**
 * Returns all published blog posts from both sources, sorted by date descending.
 * Posts with a future date are excluded. Cached after first call within a single build/request.
 */
export function getAllBlogPosts(): BlogPost[] {
  if (_cache) return _cache;

  const markdownPosts = getAllMarkdownPosts();
  const markdownSlugs = new Set(markdownPosts.map((p) => p.slug));

  // TypeScript posts take precedence — if a slug exists in both, use the TS version
  const tsPosts = BLOG_POSTS.filter((p) => !markdownSlugs.has(p.slug));

  const merged = [...tsPosts, ...markdownPosts]
    .filter(isPublished)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  _cache = merged;
  return merged;
}

/**
 * Returns a single post by slug, checking both sources.
 * Returns null if the post has a future date (not yet published).
 * TypeScript source takes priority over markdown.
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const post = getTsBlogPost(slug) ?? getMarkdownPost(slug) ?? null;
  if (!post || !isPublished(post)) return null;
  return post;
}

/**
 * Returns all slugs from both sources (for generateStaticParams).
 */
export function getAllBlogSlugs(): { slug: string }[] {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}
