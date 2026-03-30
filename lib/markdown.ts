/**
 * Markdown file reader for blog posts in /content/blog/*.md
 * Server-side only — uses Node fs. Do not import in client components.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import type { BlogPost } from "@/data/blog-posts";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export interface MarkdownFrontmatter {
  title: string;
  description: string;
  date: string;
  slug: string;
  keyword?: string;
  cluster?: string;
  readTime?: string;
  published?: boolean;
}

function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function markdownToHtml(markdown: string): string {
  // Configure marked for clean output
  marked.setOptions({ gfm: true, breaks: false });
  return marked.parse(markdown) as string;
}

function getMarkdownFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && f !== ".gitkeep");
}

/**
 * Returns all published markdown posts as BlogPost objects (same shape as TypeScript posts).
 */
export function getAllMarkdownPosts(): BlogPost[] {
  const files = getMarkdownFiles();
  const posts: BlogPost[] = [];

  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as MarkdownFrontmatter;

    if (fm.published === false) continue;
    if (!fm.title || !fm.date || !fm.slug) continue;

    posts.push({
      slug: fm.slug,
      title: fm.title,
      description: fm.description ?? "",
      date: fm.date,
      readTime: fm.readTime ?? estimateReadTime(content),
      content: markdownToHtml(content),
      primaryKeyword: fm.keyword,
      cluster: fm.cluster,
    });
  }

  return posts;
}

/**
 * Returns a single markdown post by slug, or null if not found.
 */
export function getMarkdownPost(slug: string): BlogPost | null {
  const files = getMarkdownFiles();
  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as MarkdownFrontmatter;

    if (fm.slug !== slug) continue;
    if (fm.published === false) continue;

    return {
      slug: fm.slug,
      title: fm.title,
      description: fm.description ?? "",
      date: fm.date,
      readTime: fm.readTime ?? estimateReadTime(content),
      content: markdownToHtml(content),
      primaryKeyword: fm.keyword,
      cluster: fm.cluster,
    };
  }
  return null;
}

/**
 * Returns all markdown post slugs (for generateStaticParams).
 */
export function getAllMarkdownSlugs(): string[] {
  const files = getMarkdownFiles();
  const slugs: string[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw);
    const fm = data as MarkdownFrontmatter;
    if (fm.slug && fm.published !== false) slugs.push(fm.slug);
  }
  return slugs;
}
