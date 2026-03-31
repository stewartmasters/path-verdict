import { KEYWORD_QUEUE, type QueuedKeyword } from "@/data/blog-queue-path";
import fs from "fs";
import path from "path";

export type { QueuedKeyword };

export function loadKeywords(): QueuedKeyword[] {
  return KEYWORD_QUEUE;
}

export function getNextKeyword(): QueuedKeyword | null {
  return KEYWORD_QUEUE
    .filter((k) => !k.used)
    .sort((a, b) => b.priority - a.priority)[0] ?? null;
}

export function markKeywordUsed(id: string): void {
  // Update the blog-queue-path.ts file to set used: true for this id
  const filePath = path.join(process.cwd(), "data", "blog-queue-path.ts");
  let src = fs.readFileSync(filePath, "utf-8");
  // Replace `id: "ID",` block's used field
  src = src.replace(
    new RegExp(`(id:\\s*"${id}"[\\s\\S]*?used:\\s*)false`, "m"),
    "$1true"
  );
  fs.writeFileSync(filePath, src, "utf-8");
}

export function getUsedSlugs(): string[] {
  return KEYWORD_QUEUE.filter((k) => k.used).map((k) => k.slug);
}
