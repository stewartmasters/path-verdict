/**
 * Confidence scoring engine.
 * Produces a ConfidenceLevel and machine-readable reason string
 * from the characteristics of the records used in a benchmark.
 */

import type { NormalizedRecord, ConfidenceLevel } from "@/lib/normalization/types";
import type { SelectedRecords } from "@/lib/benchmarking/sourceSelection";

export interface ConfidenceScore {
  level: ConfidenceLevel;
  score: number;         // 0–1 composite
  reason: string;        // Short machine-readable summary for UI/API
  factors: {
    source_diversity: number;     // 0–1
    record_count: number;         // 0–1
    freshness: number;            // 0–1
    location_specificity: number; // 0–1
    seniority_match: number;      // 0–1
    fallback_depth: number;       // 0–1 (1 = no fallback needed)
  };
}

/**
 * Compute a freshness score for a set of records.
 * Decays ~0.15 per year from today. A 2024 record in 2026 = ~0.70.
 */
function averageFreshness(records: NormalizedRecord[]): number {
  if (records.length === 0) return 0;
  const currentYear = new Date().getFullYear();
  const scores = records.map((r) => {
    const year = r.source_published_at
      ? parseInt(r.source_published_at.slice(0, 4), 10)
      : parseInt(r.collected_at.slice(0, 4), 10);
    const age = Math.max(0, currentYear - year);
    return Math.max(0, 1 - age * 0.15);
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Count distinct source_ids in a set of records.
 */
function distinctSourceCount(records: NormalizedRecord[]): number {
  return new Set(records.map((r) => r.source_id)).size;
}

/**
 * Score source diversity: 0 sources = 0, 1 = 0.5, 2 = 0.8, 3+ = 1.0
 */
function sourceDiversityScore(distinctSources: number): number {
  if (distinctSources === 0) return 0;
  if (distinctSources === 1) return 0.5;
  if (distinctSources === 2) return 0.8;
  return 1.0;
}

/**
 * Score record count: 0 = 0, 1 = 0.4, 2–3 = 0.7, 4–5 = 0.9, 6+ = 1.0
 */
function recordCountScore(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 0.4;
  if (count <= 3) return 0.7;
  if (count <= 5) return 0.9;
  return 1.0;
}

/**
 * Score location specificity based on the fallback path used.
 * City-level data available = 1.0, country = 0.8, europe fallback only = 0.4
 */
function locationSpecificityScore(selected: SelectedRecords): number {
  const hasCityData = selected.city_records.length > 0;
  const hasCountryData = selected.country_records.length > 0;
  const hasFallbackOnly =
    !hasCityData && !hasCountryData && selected.fallback_records.length > 0;

  if (hasCityData) return 1.0;
  if (hasCountryData) return 0.8;
  if (hasFallbackOnly) return 0.4;
  return 0;
}

/**
 * Score seniority match quality.
 * "record_matched" = records exist for the requested seniority level = 1.0
 * "model_adjusted" = we had to interpolate from other seniority levels = 0.6
 */
function seniorityMatchScore(
  records: NormalizedRecord[],
  targetSeniority: string
): { score: number; matched: boolean } {
  const direct = records.filter((r) => r.seniority_normalized === targetSeniority);
  if (direct.length > 0) return { score: 1.0, matched: true };
  if (records.length > 0) return { score: 0.6, matched: false };
  return { score: 0, matched: false };
}

/**
 * Score fallback depth.
 * No fallback = 1.0, partial fallback = 0.7, full europe fallback = 0.4
 */
function fallbackDepthScore(fallbackPath: string[]): number {
  if (fallbackPath.includes("no-data")) return 0;
  if (fallbackPath.includes("europe-fallback") && !fallbackPath.includes("city") && !fallbackPath.includes("country")) {
    return 0.4;
  }
  if (fallbackPath.includes("europe-fallback")) return 0.7;
  return 1.0;
}

/**
 * Map a composite score to a confidence level.
 */
function scoreToLevel(score: number): ConfidenceLevel {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

/**
 * Build a concise machine-readable reason string for UI display.
 */
function buildReason(
  level: ConfidenceLevel,
  distinctSources: number,
  totalRecords: number,
  freshness: number,
  fallbackPath: string[],
  seniorityMatched: boolean,
  querySeniority: string
): string {
  const parts: string[] = [];

  if (level === "high") {
    parts.push(`${distinctSources} source${distinctSources !== 1 ? "s" : ""}`);
    parts.push(`${totalRecords} record${totalRecords !== 1 ? "s" : ""}`);
    if (!seniorityMatched) parts.push(`seniority interpolated from adjacent levels`);
    return parts.join(", ");
  }

  if (totalRecords === 0) return "no-data";

  if (fallbackPath.includes("no-data")) {
    return "no matching records found";
  }

  if (fallbackPath.includes("europe-fallback") && !fallbackPath.includes("city") && !fallbackPath.includes("country")) {
    parts.push("pan-European fallback only — no country-specific data");
  } else if (!fallbackPath.includes("city") && fallbackPath.includes("country")) {
    parts.push("country-level data only — no city-specific records");
  }

  if (distinctSources === 1) parts.push("single source");
  if (!seniorityMatched) parts.push(`${querySeniority} seniority interpolated`);
  if (freshness < 0.6) parts.push("data is over 3 years old");

  return parts.length > 0 ? parts.join("; ") : `${distinctSources} sources, ${totalRecords} records`;
}

/**
 * Main confidence scoring function.
 * Takes the selected records, the all-up record pool used, and query parameters.
 */
export function computeConfidence(
  selected: SelectedRecords,
  allUsedRecords: NormalizedRecord[],
  querySeniority: string
): ConfidenceScore {
  const totalRecords = allUsedRecords.length;
  const distinctSources = distinctSourceCount(allUsedRecords);

  const freshness = averageFreshness(allUsedRecords);
  const { score: seniorityScore, matched: seniorityMatched } = seniorityMatchScore(
    allUsedRecords,
    querySeniority
  );

  const factors = {
    source_diversity: sourceDiversityScore(distinctSources),
    record_count: recordCountScore(totalRecords),
    freshness,
    location_specificity: locationSpecificityScore(selected),
    seniority_match: seniorityScore,
    fallback_depth: fallbackDepthScore(selected.fallback_path),
  };

  // Weighted composite: freshness and source diversity matter most
  const composite =
    factors.source_diversity * 0.25 +
    factors.record_count * 0.20 +
    factors.freshness * 0.20 +
    factors.location_specificity * 0.20 +
    factors.seniority_match * 0.10 +
    factors.fallback_depth * 0.05;

  const level = scoreToLevel(composite);

  const reason = buildReason(
    level,
    distinctSources,
    totalRecords,
    freshness,
    selected.fallback_path,
    seniorityMatched,
    querySeniority
  );

  return { level, score: composite, reason, factors };
}
