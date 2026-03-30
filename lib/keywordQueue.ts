/**
 * Keyword queue management.
 * Reads/writes data/keywords.json — the authoritative source of what has and hasn't been published.
 *
 * Used by scripts/generateArticle.ts (server/script context only).
 * Safe to import in Next.js pages for read-only access (getNextKeyword, getExistingSlugs).
 */

import fs from "fs";
import path from "path";

export interface KeywordItem {
  id: string;
  keyword: string;
  slug: string;
  cluster: string;
  type: string;
  priority: number;
  used: boolean;
  role: string | null;
  location: string | null;
  wordCountTarget: number;
}

const KEYWORDS_FILE = path.join(process.cwd(), "data", "keywords.json");

export function loadKeywords(): KeywordItem[] {
  const raw = fs.readFileSync(KEYWORDS_FILE, "utf-8");
  return JSON.parse(raw) as KeywordItem[];
}

export function saveKeywords(keywords: KeywordItem[]): void {
  fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(keywords, null, 2) + "\n", "utf-8");
}

/**
 * Returns the highest-priority keyword that has not been used yet.
 * Returns null if the queue is exhausted.
 */
export function getNextKeyword(): KeywordItem | null {
  const keywords = loadKeywords();
  const unused = keywords
    .filter((k) => !k.used)
    .sort((a, b) => b.priority - a.priority);
  return unused[0] ?? null;
}

/**
 * Marks a keyword as used by id and persists to disk.
 */
export function markKeywordUsed(id: string): void {
  const keywords = loadKeywords();
  const idx = keywords.findIndex((k) => k.id === id);
  if (idx === -1) throw new Error(`Keyword id "${id}" not found in queue`);
  keywords[idx].used = true;
  saveKeywords(keywords);
}

/**
 * Returns all slug values that are already used (published).
 * Used for duplicate checks before generating.
 */
export function getUsedSlugs(): string[] {
  return loadKeywords()
    .filter((k) => k.used)
    .map((k) => k.slug);
}

/**
 * Returns stats about the queue.
 */
export function getQueueStats(): { total: number; used: number; remaining: number } {
  const keywords = loadKeywords();
  const used = keywords.filter((k) => k.used).length;
  return { total: keywords.length, used, remaining: keywords.length - used };
}
