import type { Config } from "@netlify/functions";
import { getNextQueuedPost } from "../../data/blog-queue";

// Netlify scheduled function — runs every 7 days
// To disable: set BLOG_SCHEDULER_ENABLED=false in Netlify env vars
export default async function handler() {
  const enabled = process.env.BLOG_SCHEDULER_ENABLED !== "false";
  if (!enabled) {
    console.log("[blog-scheduler] Disabled via env var. Skipping.");
    return;
  }

  const next = getNextQueuedPost();
  if (!next) {
    console.log("[blog-scheduler] No queued posts found. Queue is empty.");
    return;
  }

  // Log the next post that should be written/published
  // In a full automated setup, this would trigger a content generation pipeline
  // For now: generate a structured brief that a writer or AI can act on
  const brief = {
    slug: next.slug,
    title: next.title,
    primaryKeyword: next.primaryKeyword,
    cluster: next.cluster,
    wordCountTarget: next.wordCountTarget,
    priority: next.priority,
    scheduledFor: new Date().toISOString(),
    notes: next.notes ?? null,
    instructions: [
      `Write a ${next.wordCountTarget}-word article targeting: "${next.primaryKeyword}"`,
      `Tone: direct, practical, non-corporate. No filler.`,
      `Cluster: ${next.cluster} — link to related pages in this cluster.`,
      `Include: a tool CTA linking to amiunderpaid.com`,
      `End with: a salary check prompt`,
    ],
  };

  console.log("[blog-scheduler] Next post brief:", JSON.stringify(brief, null, 2));

  // TODO: To fully automate, connect this to your content generation pipeline:
  // - Call Claude API to generate the post content
  // - Write the post to data/blog-posts.ts via GitHub API
  // - Trigger a Netlify rebuild
  // This is intentionally left as a structured brief generator for MVP.
}

export const config: Config = {
  schedule: "@weekly",
};
