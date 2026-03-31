/**
 * PathVerdict article generator
 * Usage:
 *   npx tsx scripts/generateArticle.ts
 *   npx tsx scripts/generateArticle.ts --dry-run
 *   npx tsx scripts/generateArticle.ts --keyword "average savings rate uk"
 *
 * Requires env: ANTHROPIC_API_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

// Resolve imports relative to project root (not the scripts/ dir)
const ROOT = path.join(__dirname, "..");

// ── Inline keyword queue helpers (avoid @/ alias in scripts context) ──────────
interface QueuedKeyword {
  id:              string;
  keyword:         string;
  slug:            string;
  cluster:         string;
  wordCountTarget: number;
  priority:        number;
  used:            boolean;
  citySlug?:       string;
  notes?:          string;
}

function loadKeywordQueue(): QueuedKeyword[] {
  // Dynamic require to get the latest state of the file
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  delete require.cache[require.resolve(path.join(ROOT, "data", "blog-queue-path.ts"))];
  // tsx registers .ts — use require directly
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require(path.join(ROOT, "data", "blog-queue-path.ts")) as {
    KEYWORD_QUEUE: QueuedKeyword[];
  };
  return mod.KEYWORD_QUEUE;
}

function getNextKeyword(queue: QueuedKeyword[]): QueuedKeyword | null {
  return queue
    .filter((k) => !k.used)
    .sort((a, b) => b.priority - a.priority)[0] ?? null;
}

function markKeywordUsed(id: string): void {
  const filePath = path.join(ROOT, "data", "blog-queue-path.ts");
  let src = fs.readFileSync(filePath, "utf-8");
  src = src.replace(
    new RegExp(`(id:\\s*"${id}"[\\s\\S]*?used:\\s*)false`, "m"),
    "$1true"
  );
  fs.writeFileSync(filePath, src, "utf-8");
}

function getUsedSlugs(): string[] {
  const queue = loadKeywordQueue();
  return queue.filter((k) => k.used).map((k) => k.slug);
}

// ── Internal links helper ────────────────────────────────────────────────────

interface InternalLink {
  url:   string;
  label: string;
}

const CLUSTER_LINKS: Record<string, InternalLink[]> = {
  "savings-benchmarks": [
    { url: "/",                                     label: "PathVerdict — check your savings rate" },
    { url: "/methodology",                          label: "How we calculate savings benchmarks" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate?" },
    { url: "/blog/am-i-saving-enough",             label: "Am I saving enough?" },
    { url: "/financial-position/london",           label: "Savings rate in London" },
    { url: "/financial-position/new-york",         label: "Savings rate in New York" },
  ],
  "city-savings": [
    { url: "/",                                     label: "PathVerdict savings rate tool" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate?" },
    { url: "/financial-position/london",           label: "Financial position in London" },
    { url: "/financial-position/new-york",         label: "Financial position in New York" },
    { url: "/financial-position/sydney",           label: "Financial position in Sydney" },
    { url: "/affordability/london",                label: "Cost of living in London" },
  ],
  "income-savings": [
    { url: "/",                                     label: "PathVerdict — benchmark your savings" },
    { url: "/blog/why-high-earners-struggle-to-save", label: "Why six-figure earners still can't save" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate by income?" },
    { url: "/methodology",                          label: "How savings benchmarks are calculated" },
    { url: "/financial-position/new-york",         label: "New York savings benchmarks" },
    { url: "/financial-position/london",           label: "London savings benchmarks" },
  ],
  "age-financial-position": [
    { url: "/",                                     label: "PathVerdict financial position check" },
    { url: "/blog/savings-rate-by-age",            label: "How much should you save by age?" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What is a good savings rate?" },
    { url: "/blog/savings-rate-vs-wealth-building", label: "Saving vs building wealth" },
    { url: "/methodology",                          label: "How we calculate your financial position" },
  ],
  "financial-health": [
    { url: "/",                                     label: "PathVerdict — free financial health check" },
    { url: "/blog/am-i-saving-enough",             label: "Am I saving enough?" },
    { url: "/blog/savings-rate-vs-wealth-building", label: "The difference between saving and building wealth" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate?" },
    { url: "/methodology",                          label: "PathVerdict methodology" },
    { url: "/financial-position/london",           label: "Financial position benchmarks" },
  ],
};

const DEFAULT_LINKS: InternalLink[] = [
  { url: "/",              label: "PathVerdict — savings rate and financial position tool" },
  { url: "/methodology",   label: "How PathVerdict calculates savings benchmarks" },
  { url: "/blog/what-is-a-good-savings-rate", label: "What is a good savings rate?" },
  { url: "/financial-position/london",        label: "Financial position in London" },
  { url: "/financial-position/new-york",      label: "Financial position in New York" },
];

function getInternalLinks(cluster?: string, citySlug?: string): InternalLink[] {
  const base = CLUSTER_LINKS[cluster ?? ""] ?? DEFAULT_LINKS;
  if (citySlug) {
    return [
      { url: `/financial-position/${citySlug}`, label: `Financial position in ${citySlug.replace(/-/g, " ")}` },
      { url: `/affordability/${citySlug}`,      label: `Cost of living in ${citySlug.replace(/-/g, " ")}` },
      ...base.slice(0, 4),
    ];
  }
  return base;
}

function formatLinksForPrompt(links: InternalLink[]): string {
  return links.map((l) => `- [${l.label}](https://pathverdict.com${l.url})`).join("\n");
}

// ── Content directory ────────────────────────────────────────────────────────

const CONTENT_DIR = path.join(ROOT, "content", "blog");

function ensureContentDir(): void {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

function slugExists(slug: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, `${slug}.md`));
}

// ── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(kw: QueuedKeyword): string {
  const links = getInternalLinks(kw.cluster, kw.citySlug);
  const linksSection = formatLinksForPrompt(links);
  const today = new Date().toISOString().split("T")[0];

  return `You are writing a blog post for PathVerdict.com — a free savings rate and financial position tool.

## About PathVerdict
- PathVerdict lets users enter their income, rent, and monthly expenses
- It calculates their savings rate and benchmarks it against national household survey data
- Covers 11 countries and 50 cities
- Data sources: BLS Consumer Expenditure Survey (US), ONS Living Costs & Food Survey (UK), Destatis EVS (Germany), INSEE Budget de Famille (France), ABS Household Expenditure Survey (Australia), StatsCan Survey of Household Spending (Canada), CBS Household Budget Survey (Netherlands), SCB HEK (Sweden), Stats NZ Household Economic Survey, CSO HBS (Ireland), Swiss FSO HABE
- Users get one of five verdicts: Critical, Falling Behind, Under-Saving, On Track, Ahead
- Free, no signup required, results in under 30 seconds

## Article brief
- **Primary keyword**: ${kw.keyword}
- **Target slug**: ${kw.slug}
- **Word count target**: ${kw.wordCountTarget} words (body content, excluding frontmatter)
- **Cluster**: ${kw.cluster}
${kw.citySlug ? `- **City focus**: ${kw.citySlug.replace(/-/g, " ")}` : ""}
${kw.notes ? `- **Notes**: ${kw.notes}` : ""}

## Tone and style
- Direct, practical, data-driven — not preachy or motivational
- State facts from data; don't moralize about spending habits
- Specific numbers where available (e.g. "the bottom quintile saves 2–4% on average"; "median London rent is £1,950/month")
- No unnecessary padding. Every paragraph should add information or analysis
- Avoid hedge language unless genuinely uncertain ("studies suggest", "many people", "it is often said")

## Required structure
1. **YAML frontmatter** at the top (see format below)
2. **H1**: Must contain the primary keyword verbatim or near-verbatim
3. **Introductory paragraph**: Hook the reader with a specific data point or counterintuitive fact
4. **3–5 H2 sections**: Each covering a distinct angle on the topic
5. **FAQ section** (H2: "Frequently asked questions"): 3–4 Q&A pairs using H3 for questions
6. **Closing paragraph**: End with a natural call to action pointing to pathverdict.com

## Internal links
Include at least 3 of the following as natural in-text links (markdown format):
${linksSection}

## YAML frontmatter format
\`\`\`yaml
---
slug: "${kw.slug}"
title: "Your H1 title here"
description: "155-character meta description. Include the primary keyword."
date: "${today}"
keyword: "${kw.keyword}"
cluster: "${kw.cluster}"
published: true
---
\`\`\`

## Important
- Do NOT include any preamble, commentary, or explanation outside the article itself
- Output only the raw markdown starting with the frontmatter block
- The keyword must appear in the H1, at least one H2, and naturally in the body
- All internal links must use pathverdict.com (not salaryverdict.com or any other domain)
- End the article with a CTA paragraph that mentions checking your financial position at pathverdict.com
- Do not fabricate specific statistics; use ranges and patterns from the data sources listed above where possible`;
}

// ── Validation ───────────────────────────────────────────────────────────────

interface ValidationResult {
  ok:      boolean;
  errors:  string[];
  warnings: string[];
}

function validateArticle(content: string, kw: QueuedKeyword): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Frontmatter present
  if (!content.startsWith("---")) {
    errors.push("Missing YAML frontmatter (article must start with ---)");
  }

  // Slug in frontmatter
  if (!content.includes(`slug: "${kw.slug}"`)) {
    errors.push(`Frontmatter slug does not match expected "${kw.slug}"`);
  }

  // Published field
  if (!content.includes("published: true")) {
    warnings.push("published: true not found in frontmatter");
  }

  // Word count (rough estimate: body after frontmatter close)
  const frontmatterEnd = content.indexOf("---", 3);
  const body = frontmatterEnd > 0 ? content.slice(frontmatterEnd + 3) : content;
  const wordCount = body.trim().split(/\s+/).length;
  const minWords = Math.floor(kw.wordCountTarget * 0.7);
  if (wordCount < minWords) {
    errors.push(`Word count too low: ${wordCount} words (minimum ${minWords} = 70% of ${kw.wordCountTarget} target)`);
  }

  // H2 sections present
  const h2Matches = body.match(/^## .+/gm) ?? [];
  if (h2Matches.length < 3) {
    errors.push(`Insufficient H2 sections: found ${h2Matches.length} (minimum 3 required)`);
  }

  // Internal links present (pathverdict.com)
  if (!body.includes("pathverdict.com")) {
    errors.push("No pathverdict.com links found in article body");
  }

  // No salaryverdict.com links
  if (body.includes("salaryverdict.com")) {
    errors.push("Article contains salaryverdict.com links — must use pathverdict.com");
  }

  // Keyword in body
  const keywordLower = kw.keyword.toLowerCase();
  if (!body.toLowerCase().includes(keywordLower)) {
    warnings.push(`Primary keyword "${kw.keyword}" not found in body`);
  }

  // FAQ section
  if (!body.toLowerCase().includes("frequently asked")) {
    warnings.push("No FAQ section found (expected '## Frequently asked questions')");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const keywordOverrideIdx = args.indexOf("--keyword");
  const keywordOverride = keywordOverrideIdx >= 0 ? args[keywordOverrideIdx + 1] : null;

  console.log("[generateArticle] PathVerdict article generator");
  console.log(`[generateArticle] Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);

  // Resolve keyword
  const queue = loadKeywordQueue();
  let kw: QueuedKeyword | null = null;

  if (keywordOverride) {
    kw = queue.find(
      (k) => k.keyword.toLowerCase() === keywordOverride.toLowerCase() ||
             k.id === keywordOverride
    ) ?? null;
    if (!kw) {
      console.error(`[generateArticle] Keyword override not found in queue: "${keywordOverride}"`);
      process.exit(1);
    }
    console.log(`[generateArticle] Using override keyword: "${kw.keyword}" (id: ${kw.id})`);
  } else {
    kw = getNextKeyword(queue);
    if (!kw) {
      console.log("[generateArticle] No unused keywords in queue. Nothing to generate.");
      process.exit(0);
    }
    console.log(`[generateArticle] Next keyword: "${kw.keyword}" (id: ${kw.id}, priority: ${kw.priority})`);
  }

  // Check if slug already exists
  ensureContentDir();
  const usedSlugs = getUsedSlugs();
  if (slugExists(kw.slug)) {
    console.log(`[generateArticle] Slug already exists: ${kw.slug}.md — skipping.`);
    process.exit(0);
  }
  if (usedSlugs.includes(kw.slug)) {
    console.log(`[generateArticle] Slug already marked used in queue: ${kw.slug} — skipping.`);
    process.exit(0);
  }

  // Build prompt
  const prompt = buildPrompt(kw);
  console.log(`[generateArticle] Prompt built (${prompt.split(/\s+/).length} words)`);

  if (dryRun) {
    console.log("\n[generateArticle] DRY RUN — prompt preview:\n");
    console.log(prompt.slice(0, 800) + (prompt.length > 800 ? "\n... (truncated)" : ""));
    console.log("\n[generateArticle] Dry run complete. No files written.");
    process.exit(0);
  }

  // Call Claude
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[generateArticle] ANTHROPIC_API_KEY not set.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log("[generateArticle] Calling Claude claude-sonnet-4-6...");
  const startTime = Date.now();

  let articleContent: string;
  try {
    const message = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role:    "user",
          content: prompt,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error(`Unexpected response block type: ${block.type}`);
    }
    articleContent = block.text.trim();
  } catch (err) {
    console.error("[generateArticle] Claude API call failed:", err);
    process.exit(1);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[generateArticle] Claude responded in ${elapsed}s`);

  // Validate
  const validation = validateArticle(articleContent, kw);
  if (validation.warnings.length > 0) {
    for (const w of validation.warnings) {
      console.warn(`[generateArticle] WARNING: ${w}`);
    }
  }
  if (!validation.ok) {
    for (const e of validation.errors) {
      console.error(`[generateArticle] ERROR: ${e}`);
    }
    console.error("[generateArticle] Validation failed — article not saved.");
    process.exit(1);
  }

  // Write to file
  const outputPath = path.join(CONTENT_DIR, `${kw.slug}.md`);
  fs.writeFileSync(outputPath, articleContent, "utf-8");
  console.log(`[generateArticle] Article saved: ${outputPath}`);

  // Mark keyword as used
  markKeywordUsed(kw.id);
  console.log(`[generateArticle] Keyword marked as used: ${kw.id}`);

  const bodyWords = articleContent.trim().split(/\s+/).length;
  console.log(`[generateArticle] Done. Article: ${bodyWords} words, slug: ${kw.slug}`);
}

main().catch((err) => {
  console.error("[generateArticle] Unhandled error:", err);
  process.exit(1);
});
