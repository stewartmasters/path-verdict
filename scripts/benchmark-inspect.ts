#!/usr/bin/env tsx
/**
 * benchmark-inspect.ts
 *
 * Dev tool to inspect the benchmark engine output for any role+location combination.
 * Useful for validating that pipeline data is being used correctly.
 *
 * Usage:
 *   npx tsx scripts/benchmark-inspect.ts --role software-engineer --location london --years 5
 *   npx tsx scripts/benchmark-inspect.ts --role product-manager --location berlin --years 8
 *   npx tsx scripts/benchmark-inspect.ts --list-roles
 *   npx tsx scripts/benchmark-inspect.ts --list-locations
 */

import * as fs from "fs";
import * as path from "path";
import type { NormalizedRecord } from "../lib/normalization/types";
import { computeBenchmark } from "../lib/benchmarking/computeBenchmark";
import { ROLE_DEFINITIONS } from "../lib/mapping/roles";
import { LOCATION_TO_COUNTRY } from "../lib/benchmarking/sourceSelection";

const RECORDS_FILE = path.join(__dirname, "..", "data", "normalized", "records.json");

function loadRecords(): NormalizedRecord[] {
  if (!fs.existsSync(RECORDS_FILE)) {
    console.error("❌ data/normalized/records.json not found. Run: npx tsx scripts/normalize.ts");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(RECORDS_FILE, "utf-8"));
  return data.records as NormalizedRecord[];
}

function printResult(role: string, location: string, years: number): void {
  const records = loadRecords();
  const result = computeBenchmark(records, {
    roleNormalized: role,
    locationSlug: location,
    experienceYears: years,
  });

  const curr = result.currency === "GBP" ? "£" : "€";
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ${role} · ${location} · ${years} years`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Range:     ${curr}${result.low.toLocaleString()} – ${curr}${result.median.toLocaleString()} – ${curr}${result.high.toLocaleString()}`);
  console.log(`  Currency:  ${result.currency}`);
  console.log(`  Confidence: ${result.confidence.toUpperCase()} — ${result.confidence_reason}`);
  console.log(`  Sources:   ${result.source_count} (${result.sources_used.join(", ") || "none"})`);
  console.log(`  Records:   ${result.record_count}`);
  console.log(`  Freshness: ${(result.freshness_score * 100).toFixed(0)}%`);
  console.log(`  Fallback:  ${result.fallback_path.join(" → ")}`);
  console.log(`  Seniority: ${result.seniority_source}`);
  if (result.notes) console.log(`  Note:      ${result.notes}`);
  console.log();
}

function listRoles(): void {
  console.log("\nAvailable roles:");
  for (const r of ROLE_DEFINITIONS) {
    console.log(`  ${r.slug.padEnd(35)} ${r.family}`);
  }
}

function listLocations(): void {
  console.log("\nAvailable locations:");
  for (const [slug, country] of Object.entries(LOCATION_TO_COUNTRY)) {
    console.log(`  ${slug.padEnd(20)} ${country}`);
  }
}

// Parse CLI args
const args = process.argv.slice(2);
const get = (flag: string) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
};

if (args.includes("--list-roles")) { listRoles(); process.exit(0); }
if (args.includes("--list-locations")) { listLocations(); process.exit(0); }

const role = get("--role");
const location = get("--location");
const years = parseInt(get("--years") ?? "5", 10);

if (!role || !location) {
  console.log("Usage:");
  console.log("  npx tsx scripts/benchmark-inspect.ts --role <role> --location <location> [--years <n>]");
  console.log("  npx tsx scripts/benchmark-inspect.ts --list-roles");
  console.log("  npx tsx scripts/benchmark-inspect.ts --list-locations");
  process.exit(0);
}

printResult(role, location, years);
