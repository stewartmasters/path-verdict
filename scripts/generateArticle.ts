#!/usr/bin/env node
/**
 * Article generation script.
 * Called by GitHub Actions twice per week to auto-publish a blog post.
 *
 * Usage:
 *   npx tsx scripts/generateArticle.ts
 *   npx tsx scripts/generateArticle.ts --keyword "salary negotiation tips"  (override)
 *   npx tsx scripts/generateArticle.ts --dry-run  (generate but do not write or mark used)
 *
 * Requires: ANTHROPIC_API_KEY env var
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { getNextKeyword, markKeywordUsed, getUsedSlugs, type KeywordItem } from "../lib/keywordQueue";
import { getInternalLinks, formatLinksForPrompt } from "../lib/internalLinks";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const keywordOverride = (() => {
  const idx = args.indexOf("--keyword");
  return idx !== -1 ? args[idx + 1] : null;
})();

// ---------------------------------------------------------------------------
// Salary data helpers (inline — avoids importing from Next.js modules)
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
  "software-engineer": "Software Engineer",
  "frontend-developer": "Frontend Developer",
  "backend-developer": "Backend Developer",
  "product-manager": "Product Manager",
  "data-analyst": "Data Analyst",
  "data-scientist": "Data Scientist",
  "devops-engineer": "DevOps Engineer",
  "designer": "Designer",
  "marketing-manager": "Marketing Manager",
  "sales-manager": "Sales Manager",
  "hr-manager": "HR Manager",
  "finance-analyst": "Finance Analyst",
  "business-analyst": "Business Analyst",
  "growth-manager": "Growth Manager",
  "customer-success-manager": "Customer Success Manager",
  "operations-manager": "Operations Manager",
};

const LOCATION_LABELS: Record<string, string> = {
  london: "London", berlin: "Berlin", amsterdam: "Amsterdam",
  paris: "Paris", madrid: "Madrid", dublin: "Dublin",
  barcelona: "Barcelona", uk: "UK", germany: "Germany",
  france: "France", spain: "Spain", europe: "Europe",
};

// Approximate mid-level (5yr) salary medians for prompt context
const SALARY_CONTEXT: Record<string, Record<string, string>> = {
  "software-engineer": {
    london: "£108,500", berlin: "€78,500", amsterdam: "€91,500",
    paris: "€88,000", dublin: "€96,000", madrid: "€61,500",
    barcelona: "€66,000", europe: "€75,000",
  },
  "product-manager": {
    london: "£115,500", berlin: "€84,000", amsterdam: "€97,500",
    paris: "€94,000", dublin: "€102,500", madrid: "€65,500",
    barcelona: "€70,500", europe: "€80,000",
  },
  "frontend-developer": {
    london: "€98,500", berlin: "€71,500", amsterdam: "€83,000",
    paris: "€80,000", dublin: "€87,000", madrid: "€56,000",
    barcelona: "€60,000", europe: "€68,000",
  },
  "backend-developer": {
    london: "£104,500", berlin: "€75,500", amsterdam: "€88,000",
    paris: "€85,000", dublin: "€92,000", madrid: "€58,000",
    barcelona: "€63,500", europe: "€72,000",
  },
  "data-analyst": {
    london: "£83,000", berlin: "€60,500", amsterdam: "€70,500",
    paris: "€68,000", dublin: "€74,000", madrid: "€46,000",
    barcelona: "€50,000", europe: "€58,000",
  },
  "data-scientist": {
    london: "£107,000", berlin: "€77,500", amsterdam: "€90,500",
    paris: "€87,500", dublin: "€95,000", madrid: "€59,500",
    barcelona: "€64,500", europe: "€74,000",
  },
};

function getSalaryContext(role: string | null, location: string | null): string {
  if (!role || !location) return "";
  const roleData = SALARY_CONTEXT[role];
  if (!roleData) return "";
  const median = roleData[location];
  if (!median) return "";
  const roleLabel = ROLE_LABELS[role] ?? role;
  const locationLabel = LOCATION_LABELS[location] ?? location;
  return `\nMarket data for ${roleLabel} in ${locationLabel} (mid-level, 5 years exp): median ${median}. Low end ~${median.replace(/\d+/, (n) => String(Math.round(parseInt(n) * 0.78 / 500) * 500))}, high end ~${median.replace(/\d+/, (n) => String(Math.round(parseInt(n) * 1.28 / 500) * 500))}.`;
}

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

function keywordToSlug(keyword: string): string {
  return keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function slugExists(slug: string): boolean {
  const mdPath = path.join(process.cwd(), "content", "blog", `${slug}.md`);
  if (fs.existsSync(mdPath)) return true;
  const usedSlugs = getUsedSlugs();
  return usedSlugs.includes(slug);
}

// ---------------------------------------------------------------------------
// Article generation prompt
// ---------------------------------------------------------------------------

function buildPrompt(kw: KeywordItem): string {
  const links = getInternalLinks(kw.cluster, kw.role, kw.location);
  const linkList = formatLinksForPrompt(links);
  const salaryCtx = getSalaryContext(kw.role, kw.location);
  const roleLabel = kw.role ? ROLE_LABELS[kw.role] ?? kw.role : null;
  const locationLabel = kw.location ? LOCATION_LABELS[kw.location] ?? kw.location : null;
  const today = new Date().toISOString().split("T")[0];
  const targetWords = kw.wordCountTarget;

  return `You are a senior writer for SalaryVerdict.com — a salary benchmarking tool for European professionals.

Write a complete blog post optimised for the keyword: "${kw.keyword}"

${salaryCtx}

SITE CONTEXT:
- SalaryVerdict.com helps Europeans find out if they're underpaid
- Users enter their role, location, and salary to get their market percentile
- The tool covers 21 roles across 12 European locations
- Data is based on public benchmarks (Eurostat, ONS, Glassdoor, Indeed, Levels.fyi)

ARTICLE REQUIREMENTS:
- Word count: ${targetWords}–${Math.round(targetWords * 1.2)} words
- Primary keyword in H1 (use naturally, not robotically)
- 3–5 H2 sections covering the topic thoroughly
- Include specific, concrete numbers and examples (not vague estimates)
- Include a FAQ section with 3–4 questions readers actually search for
- Include a CTA section at the end pointing to the salary tool
- Tone: direct, practical, slightly sharp. Not corporate. Not generic.
- DO NOT write: "In today's fast-paced world", "navigating the complexities of", "it's important to note", or any similar filler
- DO NOT pad with generic advice. Every paragraph must earn its place.
${roleLabel ? `- The article is specifically about ${roleLabel} salaries${locationLabel ? ` in ${locationLabel}` : " in Europe"}` : ""}
${locationLabel && !roleLabel ? `- The article is specifically about salaries in ${locationLabel}` : ""}

INTERNAL LINKS TO USE (include at least 3–4 naturally in the body):
${linkList}

FORMATTING — output clean markdown with this exact frontmatter structure:

---
title: "[natural, compelling title using or close to the keyword]"
description: "[1–2 sentence meta description, 140–160 chars, includes keyword]"
date: "${today}"
slug: "${kw.slug}"
keyword: "${kw.keyword}"
cluster: "${kw.cluster}"
readTime: "[X min read]"
published: true
---

[article body in markdown — no extra headers above the first H2, the H1 is rendered from the title field]

CRITICAL: Output ONLY the frontmatter + markdown body. No preamble. No "Here is your article:" prefix. Start with --- immediately.`;
}

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

async function generateWithClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude API");

  const text = block.text.trim();

  // Validate we got something that looks like a markdown file with frontmatter
  if (!text.startsWith("---")) {
    throw new Error(`Generated content does not start with frontmatter. Got: ${text.slice(0, 100)}`);
  }

  return text;
}

// ---------------------------------------------------------------------------
// Content validation
// ---------------------------------------------------------------------------

function validateContent(content: string, kw: KeywordItem): void {
  if (!content.startsWith("---")) throw new Error("Missing frontmatter");
  if (!content.includes("published: true")) throw new Error("Missing published: true in frontmatter");
  if (!content.includes(`slug: "${kw.slug}"`)) throw new Error(`Missing or incorrect slug in frontmatter`);

  const body = content.split("---").slice(2).join("---");
  const wordCount = body.trim().split(/\s+/).length;
  const minWords = Math.round(kw.wordCountTarget * 0.7);

  if (wordCount < minWords) {
    throw new Error(`Content too short: ${wordCount} words (minimum ${minWords})`);
  }

  if (!body.includes("##")) throw new Error("No H2 sections found in body");
  if (!body.includes("salaryverdict.com") && !body.includes("](/)") && !body.match(/\]\(\/[a-z]/)) {
    throw new Error("No internal links found in body");
  }
}

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

function writeArticle(slug: string, content: string): string {
  const outputDir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${slug}.md`);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== SalaryVerdict Article Generator ===\n");

  // Select keyword
  let kw: KeywordItem | null = null;

  if (keywordOverride) {
    // Manual override: find by keyword text or create a temporary entry
    const { loadKeywords } = await import("../lib/keywordQueue");
    const all = loadKeywords();
    kw = all.find((k) => k.keyword === keywordOverride || k.slug === keywordToSlug(keywordOverride)) ?? null;
    if (!kw) {
      console.error(`ERROR: Keyword "${keywordOverride}" not found in queue`);
      process.exit(1);
    }
  } else {
    kw = getNextKeyword();
  }

  if (!kw) {
    console.log("INFO: No unused keywords remaining in queue. Nothing to publish.");
    process.exit(0);
  }

  console.log(`Keyword:  "${kw.keyword}"`);
  console.log(`Slug:     ${kw.slug}`);
  console.log(`Cluster:  ${kw.cluster}`);
  console.log(`Priority: ${kw.priority}`);
  console.log(`Target:   ~${kw.wordCountTarget} words`);
  if (isDryRun) console.log("Mode:     DRY RUN (will not write files or mark keyword used)\n");
  else console.log();

  // Duplicate check
  if (slugExists(kw.slug)) {
    console.log(`INFO: Slug "${kw.slug}" already exists. Skipping.`);
    if (!kw.used) {
      console.log("Marking keyword as used to prevent future re-selection.");
      if (!isDryRun) markKeywordUsed(kw.id);
    }
    process.exit(0);
  }

  // Build prompt
  const prompt = buildPrompt(kw);
  console.log("Calling Claude API...");

  let content: string;
  try {
    content = await generateWithClaude(prompt);
  } catch (err) {
    console.error("ERROR: Claude API call failed:", err);
    process.exit(1);
  }

  console.log(`Generated ${content.trim().split(/\s+/).length} words`);

  // Validate
  try {
    validateContent(content, kw);
    console.log("Validation: PASSED");
  } catch (err) {
    console.error("ERROR: Content validation failed:", err);
    console.error("Article will NOT be written.");
    process.exit(1);
  }

  if (isDryRun) {
    console.log("\n--- DRY RUN OUTPUT (not written to disk) ---");
    console.log(content.slice(0, 800) + "\n...");
    console.log("--- END DRY RUN ---");
    process.exit(0);
  }

  // Write file
  const filePath = writeArticle(kw.slug, content);
  console.log(`Written:  ${filePath}`);

  // Mark used
  markKeywordUsed(kw.id);
  console.log(`Marked keyword "${kw.id}" as used`);

  console.log("\n✓ Done");
  process.exit(0);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
