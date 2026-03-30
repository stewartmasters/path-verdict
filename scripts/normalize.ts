#!/usr/bin/env ts-node
/**
 * normalize.ts
 *
 * Reads all raw source JSON files from data/raw/ and produces
 * a single normalized records file at data/normalized/records.json.
 *
 * Run: npx ts-node scripts/normalize.ts
 *
 * This script runs at build-time (or manually) — it is NOT a Next.js API route.
 * Output file is committed so the benchmarking engine reads it at runtime.
 */

import * as fs from "fs";
import * as path from "path";
import type { NormalizedRecord } from "../lib/normalization/types";
import { normalizeRole, normalizeRoleBySoc, normalizeRoleByIsco, type RoleNormalizationResult } from "../lib/mapping/roles";
import { normalizeSeniority } from "../lib/mapping/seniority";

const DATA_DIR = path.join(__dirname, "..", "data");
const RAW_DIR  = path.join(DATA_DIR, "raw");
const OUT_FILE = path.join(DATA_DIR, "normalized", "records.json");

// Source confidence weights (matches registry)
const SOURCE_CONFIDENCE: Record<string, number> = {
  "ons-uk":       0.90,
  "eurostat-ses": 0.80,
  "destatis-vse": 0.85,
  "ine-ees":      0.82,
  "bfs-lse":      0.85, // Swiss Federal Statistical Office — Lohnstrukturerhebung
  "scb-ses":      0.82, // Statistics Sweden — Structure of Earnings Survey
  "istat-ses":    0.80, // Istat Italy — Structure of Earnings Survey
  "ine-pt-ieg":   0.80, // INE Portugal — Inquérito à Estrutura de Ganhos
  "gus-bsw":      0.78, // GUS Poland — Badanie Struktury Wynagrodzeń
  "levels-fyi":   0.65,
  "glassdoor":    0.55,
};

// Country name lookup
const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom",
  DE: "Germany",
  ES: "Spain",
  FR: "France",
  NL: "Netherlands",
  IE: "Ireland",
  CH: "Switzerland",
  SE: "Sweden",
  IT: "Italy",
  PT: "Portugal",
  PL: "Poland",
  EU: "Europe",
};

// City name lookup
const CITY_NAMES: Record<string, string> = {
  london:    "London",
  berlin:    "Berlin",
  madrid:    "Madrid",
  barcelona: "Barcelona",
  paris:     "Paris",
  amsterdam: "Amsterdam",
  dublin:    "Dublin",
  zurich:    "Zurich",
  stockholm: "Stockholm",
  milan:     "Milan",
  lisbon:    "Lisbon",
  warsaw:    "Warsaw",
};

/**
 * Compute freshness score from a publication date string.
 * Decays 0.15 per year from the source publication date.
 */
function freshnessScore(publishedAt: string | null): number {
  if (!publishedAt) return 0.6; // Conservative default
  const year = parseInt(publishedAt.slice(0, 4), 10);
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);
  return Math.max(0.1, 1 - age * 0.15);
}

/**
 * Compute normalization confidence from role mapping.
 * High if role slug was found exactly; lower if alias-matched.
 */
function normalizationConfidence(roleResult: RoleNormalizationResult): number {
  if (!roleResult.role) return 0.3;
  return roleResult.confidence;
}

interface RawRecord {
  source_record_id: string;
  source_occupation_code?: string;
  role_raw: string;
  role_normalized?: string;   // Optional explicit override — bypasses text/code lookup entirely
  country_code: string;
  city_slug: string | null;
  region_scope: "city" | "country" | "europe";
  seniority_raw: string | null;
  seniority_normalized?: string;
  salary_min: number | null;
  salary_median: number | null;
  salary_max: number | null;
  currency: string;
  salary_period: "annual" | "monthly";
  salary_type: "gross_base" | "total_comp" | "unknown";
  sample_size_approx?: "small" | "medium" | "large" | null;
  notes?: string;
}

interface RawSourceFile {
  _meta: {
    source_id: string;
    source: string;
    published_at: string;
    data_version: string;
    ingestion_mode: string;
  };
  records: RawRecord[];
}

// Map approximate sample size to a rough number
function sampleSizeNumber(approx: string | null | undefined): number | null {
  if (!approx) return null;
  if (approx === "small")  return 50;
  if (approx === "medium") return 500;
  if (approx === "large")  return 5000;
  return null;
}

function processFile(filePath: string): NormalizedRecord[] {
  const raw: RawSourceFile = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const meta = raw._meta;
  const sourceId = meta.source_id;
  const sourceConf = SOURCE_CONFIDENCE[sourceId] ?? 0.5;
  const freshness = freshnessScore(meta.published_at);
  const ingested_at = "2026-01-01"; // matches what we seeded

  // Determine source type
  const sourceTypeMap: Record<string, NormalizedRecord["source_type"]> = {
    "ons-uk":       "official_stats",
    "eurostat-ses": "official_stats",
    "destatis-vse": "official_stats",
    "ine-ees":      "official_stats",
    "bfs-lse":      "official_stats",
    "scb-ses":      "official_stats",
    "istat-ses":    "official_stats",
    "ine-pt-ieg":   "official_stats",
    "gus-bsw":      "official_stats",
    "levels-fyi":   "compensation_platform",
    "glassdoor":    "compensation_platform",
  };
  const sourceType: NormalizedRecord["source_type"] = sourceTypeMap[sourceId] ?? "imported_reference";

  return raw.records.map((r, i): NormalizedRecord => {
    // Try role normalization in priority order:
    // 0. Explicit role_normalized field in raw record (highest authority — bypasses all lookup)
    // 1. ISCO/SOC code lookup (authoritative — use first when available to avoid fuzzy text mismatches)
    // 2. Text match on role_raw (exact alias match only — no partial matching for gov survey labels)
    let roleResult: RoleNormalizationResult = { role: null, confidence: 0, method: "none" };

    if (r.role_normalized) {
      const { getRoleDefinition } = require("../lib/mapping/roles") as typeof import("../lib/mapping/roles");
      const def = getRoleDefinition(r.role_normalized);
      if (def) roleResult = { role: def, confidence: 1.0, method: "alias" };
    }

    if (!roleResult.role && r.source_occupation_code) {
      const raw = r.source_occupation_code;
      // Extract numeric portion: handles ISCO-2512, SOC-2136, KldB-4311, CNO-241, CNO-252, KldB-1412
      const code = raw.replace(/^[A-Za-z\s\-]+/, "").trim();

      // Try 4-digit codes as ISCO or SOC
      if (/^\d{4}$/.test(code)) {
        const iscoResult = normalizeRoleByIsco(code);
        if (iscoResult.role) {
          roleResult = iscoResult;
        } else {
          const socResult = normalizeRoleBySoc(code);
          if (socResult.role) roleResult = socResult;
        }
      }

      // Try 3-digit CNO codes (Spain) — map to ISCO equivalents
      if (!roleResult.role && /^\d{3}$/.test(code)) {
        const CNO_TO_ISCO: Record<string, string> = {
          "252": "2512", // software developers
          "241": "2511", // systems analysts → business-analyst
          "242": "2431", // marketing/business professionals → marketing-manager
          "243": "2431", // advertising → marketing-manager
          "343": "2166", // decorators/designers → designer
        };
        const iscoEquiv = CNO_TO_ISCO[code];
        if (iscoEquiv) {
          const iscoResult = normalizeRoleByIsco(iscoEquiv);
          if (iscoResult.role) roleResult = iscoResult;
        }
      }

      // KldB codes (Germany): map to ISCO equivalents
      // KldB prefix is already stripped — remaining is like "4311", "4312", "4313", "7311", "7312", "5412", "1412"
      if (!roleResult.role && /^\d{4}$/.test(code)) {
        const KLDB_TO_ISCO: Record<string, string> = {
          "4311": "2512", // software developers
          "4312": "2529", // data processing → data-analyst
          "4313": "1221", // IT coordinators → product-manager
          "7311": "2411", // business consulting → finance-analyst/business-analyst
          "7312": "1212", // HR → hr-manager
          "5412": "2166", // design → designer
          "1412": "2431", // commercial management → marketing-manager
        };
        const iscoEquiv = KLDB_TO_ISCO[code];
        if (iscoEquiv) {
          const iscoResult = normalizeRoleByIsco(iscoEquiv);
          if (iscoResult.role) roleResult = iscoResult;
        }
      }
    }

    // Fall back to text match (exact only — no partial matching for gov survey labels to avoid false matches)
    if (!roleResult.role) {
      const textResult = normalizeRole(r.role_raw);
      // Only use if high-confidence exact match (method === "alias" with confidence >= 0.9)
      // Partial matches (confidence 0.85) can misfire on government occupation labels
      if (textResult.role && textResult.confidence >= 0.9) {
        roleResult = textResult;
      }
    }
    const roleSlug = roleResult.role?.slug ?? "software-engineer"; // fallback, should be caught in validation
    const roleFamily = roleResult.role?.family ?? "engineering";
    const normConf = normalizationConfidence(roleResult);

    // Prefer explicit seniority_normalized if present in the raw record
    const seniorityNorm = r.seniority_normalized
      ? (r.seniority_normalized as NormalizedRecord["seniority_normalized"])
      : normalizeSeniority(r.seniority_raw);

    const id = `${sourceId}_${r.country_code}_${roleSlug}_${seniorityNorm}_${meta.data_version}`.replace(
      /[^a-z0-9_-]/gi, "-"
    ) + `_${i}`;

    return {
      id,
      source_id: sourceId,
      source_record_id: r.source_record_id,
      source_type: sourceType,

      country_code: r.country_code,
      country_name: COUNTRY_NAMES[r.country_code] ?? r.country_code,
      city_slug: r.city_slug,
      city_name: r.city_slug ? (CITY_NAMES[r.city_slug] ?? r.city_slug) : null,
      region_scope: r.region_scope,

      role_raw: r.role_raw,
      role_normalized: roleSlug,
      role_family: roleFamily,
      source_occupation_code: r.source_occupation_code ?? null,

      seniority_raw: r.seniority_raw,
      seniority_normalized: seniorityNorm,

      salary_min: r.salary_min,
      salary_median: r.salary_median,
      salary_max: r.salary_max,
      currency: r.currency,
      salary_period: r.salary_period,
      salary_type: r.salary_type,

      sample_size: sampleSizeNumber(r.sample_size_approx),
      collected_at: ingested_at,
      source_published_at: meta.published_at,
      data_version: meta.data_version,

      freshness_score: freshness,
      source_confidence: sourceConf,
      normalization_confidence: normConf,
      record_confidence: Math.round(sourceConf * freshness * normConf * 100) / 100,

      notes: r.notes ?? null,
    };
  });
}

function run(): void {
  const allRecords: NormalizedRecord[] = [];
  const errors: string[] = [];

  // Walk data/raw/**/*.json
  const sources = fs.readdirSync(RAW_DIR);
  for (const sourceDir of sources) {
    const sourcePath = path.join(RAW_DIR, sourceDir);
    if (!fs.statSync(sourcePath).isDirectory()) continue;
    const files = fs.readdirSync(sourcePath).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(sourcePath, file);
      try {
        const records = processFile(filePath);
        console.log(`  ✓ ${sourceDir}/${file} — ${records.length} records`);
        allRecords.push(...records);
      } catch (err) {
        const msg = `  ✗ ${sourceDir}/${file} — ${(err as Error).message}`;
        console.error(msg);
        errors.push(msg);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} files failed to process. Aborting.`);
    process.exit(1);
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const output = {
    _meta: {
      generated_at: new Date().toISOString(),
      total_records: allRecords.length,
      pipeline_version: "pipeline-v1",
    },
    records: allRecords,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n✅ ${allRecords.length} records written to data/normalized/records.json`);
}

run();
