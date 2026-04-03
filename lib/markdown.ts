/**
 * Markdown blog post reader — server-side only (Node.js fs).
 * Reads generated articles from content/blog/*.md
 * Returns BlogPost objects compatible with data/blog-posts-path.ts
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import type { BlogPost } from "@/data/blog-posts-path";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function getFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
}

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD at build time

export function getAllMarkdownPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const file of getFiles()) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    if (data.published === false) continue;
    if (!data.slug || !data.title || !data.date) continue;
    if (String(data.date) > today) continue; // hide future-dated posts
    posts.push({
      slug:           data.slug,
      title:          data.title,
      description:    data.description ?? "",
      date:           data.date,
      readTime:       data.readTime ?? estimateReadTime(content),
      content:        marked.parse(content) as string,
      primaryKeyword: data.keyword,
      cluster:        data.cluster,
    });
  }
  return posts;
}

export function getMarkdownPost(slug: string): BlogPost | null {
  for (const file of getFiles()) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    if (data.slug !== slug || data.published === false) continue;
    if (String(data.date) > today) continue;
    return {
      slug:           data.slug,
      title:          data.title,
      description:    data.description ?? "",
      date:           data.date,
      readTime:       data.readTime ?? estimateReadTime(content),
      content:        marked.parse(content) as string,
      primaryKeyword: data.keyword,
      cluster:        data.cluster,
    };
  }
  return null;
}

export function getAllMarkdownSlugs(): string[] {
  const slugs: string[] = [];
  for (const file of getFiles()) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw);
    if (data.slug && data.published !== false && String(data.date) <= today) slugs.push(data.slug);
  }
  return slugs;
}
