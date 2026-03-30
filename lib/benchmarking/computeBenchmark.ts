/**
 * Main benchmark computation engine.
 *
 * Takes normalized records + a query (role, location, seniority, experience)
 * and produces a BenchmarkResult with full provenance.
 *
 * Replaces the old multiplier-based approach.
 * All salary figures passed through this engine must be in a single comparable currency.
 * GBP records stay as GBP; EUR records stay as EUR. Currency is returned with the result.
 * Cross-currency queries are not supported — the location determines the currency.
 */

import type { NormalizedRecord, BenchmarkResult } from "@/lib/normalization/types";
import {
  selectRecordsForQuery,
  geographicWeight,
} from "@/lib/benchmarking/sourceSelection";
import { computeConfidence } from "@/lib/benchmarking/confidence";
import {
  experienceMultiplier,
  seniorityFromYears,
  seniorityMidpointYears,
} from "@/lib/mapping/seniority";

// Currency for each location slug
const LOCATION_CURRENCY: Record<string, string> = {
  london:    "GBP",
  uk:        "GBP",
  berlin:    "EUR",
  germany:   "EUR",
  madrid:    "EUR",
  barcelona: "EUR",
  spain:     "EUR",
  paris:     "EUR",
  france:    "EUR",
  amsterdam: "EUR",
  dublin:    "EUR",
  ireland:   "EUR",
  europe:    "EUR",
};

interface BenchmarkQuery {
  roleNormalized: string;       // e.g. "software-engineer"
  locationSlug: string;         // e.g. "london"
  experienceYears: number;
}

/**
 * Compute a weighted median from an array of (value, weight) pairs.
 * Sorts by value, accumulates weight, returns the value at 50% cumulative weight.
 */
function weightedMedian(points: { value: number; weight: number }[]): number {
  if (points.length === 0) return 0;
  const sorted = [...points].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((s, p) => s + p.weight, 0);
  let cumulative = 0;
  for (const p of sorted) {
    cumulative += p.weight;
    if (cumulative >= totalWeight / 2) return p.value;
  }
  return sorted[sorted.length - 1].value;
}

/**
 * Extract the effective salary from a record.
 * Prefers salary_median, falls back to midpoint of min/max, then min or max alone.
 */
function effectiveSalary(r: NormalizedRecord): number | null {
  if (r.salary_median != null) return r.salary_median;
  if (r.salary_min != null && r.salary_max != null) {
    return (r.salary_min + r.salary_max) / 2;
  }
  return r.salary_min ?? r.salary_max ?? null;
}

/**
 * Apply a seniority adjustment to convert a record's base salary
 * to an estimate for the queried experience level.
 *
 * If the record is at "mid" level and query is "senior", multiplier is applied.
 * This is approximate — direct seniority matches are always preferred.
 */
function adjustForExperience(
  baseSalary: number,
  recordSeniority: string,
  targetYears: number
): number {
  const recordMidYears = seniorityMidpointYears(
    recordSeniority as Parameters<typeof seniorityMidpointYears>[0]
  );
  const baseMultiplier = experienceMultiplier(recordMidYears);
  const targetMultiplier = experienceMultiplier(targetYears);
  // Scale relative to the record's own level
  return baseSalary * (targetMultiplier / baseMultiplier);
}

/**
 * Given a set of weighted salary points, compute low/median/high estimates.
 * low = P25-equivalent (weighted 25th percentile of the salary distribution)
 * high = P75-equivalent
 */
function computeRange(
  points: { value: number; weight: number }[]
): { low: number; median: number; high: number } {
  if (points.length === 0) return { low: 0, median: 0, high: 0 };

  const sorted = [...points].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((s, p) => s + p.weight, 0);

  let cumulative = 0;
  let low = sorted[0].value;
  let median = sorted[0].value;
  let high = sorted[sorted.length - 1].value;
  let foundLow = false;
  let foundMedian = false;

  for (const p of sorted) {
    cumulative += p.weight;
    if (!foundLow && cumulative >= totalWeight * 0.25) {
      low = p.value;
      foundLow = true;
    }
    if (!foundMedian && cumulative >= totalWeight * 0.5) {
      median = p.value;
      foundMedian = true;
    }
    if (cumulative >= totalWeight * 0.75) {
      high = p.value;
      break;
    }
  }

  return {
    low: Math.round(low / 1000) * 1000,
    median: Math.round(median / 1000) * 1000,
    high: Math.round(high / 1000) * 1000,
  };
}

/**
 * Main benchmark computation.
 *
 * Uses a 3-tier geographic fallback:
 *   Tier 1: city-level records (weight 1.0)
 *   Tier 2: country-level records (weight 0.7)
 *   Tier 3: europe-wide records (weight 0.3, only if nothing else found)
 *
 * Each record is further weighted by:
 *   - source_confidence (from source registry)
 *   - freshness_score (time decay)
 *   - geographic specificity (geographicWeight)
 *   - normalization_confidence (how well role maps)
 *
 * Records not matching the target seniority are adjusted using the experience curve.
 */
export function computeBenchmark(
  allRecords: NormalizedRecord[],
  query: BenchmarkQuery
): BenchmarkResult {
  const { roleNormalized, locationSlug, experienceYears } = query;
  const targetSeniority = seniorityFromYears(experienceYears);
  const currency = LOCATION_CURRENCY[locationSlug] ?? "EUR";

  const selected = selectRecordsForQuery(allRecords, roleNormalized, locationSlug);

  // Combine tiers: city + country always included; fallback only when needed
  const tierRecords: NormalizedRecord[] = [
    ...selected.city_records,
    ...selected.country_records,
    ...selected.fallback_records,
  ];

  // Filter to matching currency — avoid mixing GBP/EUR
  const currencyFiltered = tierRecords.filter((r) => r.currency === currency);

  // If currency filter removes everything, relax — use all (shouldn't happen with good data)
  const candidateRecords = currencyFiltered.length > 0 ? currencyFiltered : tierRecords;

  // Build weighted salary points for the benchmark
  const points: { value: number; weight: number; record: NormalizedRecord }[] = [];

  for (const r of candidateRecords) {
    const base = effectiveSalary(r);
    if (base == null) continue;

    // Adjust salary to the queried experience level
    const adjusted = r.seniority_normalized === targetSeniority
      ? base
      : adjustForExperience(base, r.seniority_normalized, experienceYears);

    // Also extract adjusted min/max for range computation
    const geoW = geographicWeight(r, selected.query_city);
    const weight = r.source_confidence * r.freshness_score * geoW * r.normalization_confidence;

    if (weight > 0 && adjusted > 0) {
      points.push({ value: adjusted, weight, record: r });
    }

    // Add min and max as additional (lower-weight) points to widen the range properly
    if (r.salary_min != null && r.salary_min !== base) {
      const adjMin = r.seniority_normalized === targetSeniority
        ? r.salary_min
        : adjustForExperience(r.salary_min, r.seniority_normalized, experienceYears);
      points.push({ value: adjMin, weight: weight * 0.5, record: r });
    }
    if (r.salary_max != null && r.salary_max !== base) {
      const adjMax = r.seniority_normalized === targetSeniority
        ? r.salary_max
        : adjustForExperience(r.salary_max, r.seniority_normalized, experienceYears);
      points.push({ value: adjMax, weight: weight * 0.5, record: r });
    }
  }

  const uniqueRecords = candidateRecords;
  const sourcesUsed = [...new Set(uniqueRecords.map((r) => r.source_id))];
  const senioritySource: BenchmarkResult["seniority_source"] =
    uniqueRecords.some((r) => r.seniority_normalized === targetSeniority)
      ? "record_matched"
      : "model_adjusted";

  // Average freshness across used records
  const freshnessScore =
    uniqueRecords.length > 0
      ? uniqueRecords.reduce((s, r) => s + r.freshness_score, 0) / uniqueRecords.length
      : 0;

  const confidence = computeConfidence(selected, uniqueRecords, targetSeniority);
  const range = computeRange(points.map((p) => ({ value: p.value, weight: p.weight })));

  // Fallback: if no data at all, return zeros with a clear signal
  if (points.length === 0) {
    return {
      low: 0,
      median: 0,
      high: 0,
      currency,
      confidence: "low",
      confidence_reason: "no-data",
      source_count: 0,
      record_count: 0,
      freshness_score: 0,
      fallback_used: false,
      fallback_path: ["no-data"],
      sources_used: [],
      data_version: "pipeline-v1",
      seniority_source: "model_adjusted",
      experience_years: experienceYears,
      notes: `No records found for role "${roleNormalized}" in location "${locationSlug}".`,
    };
  }

  const fallbackUsed = selected.fallback_path.includes("europe-fallback");

  return {
    low: range.low,
    median: range.median,
    high: range.high,
    currency,
    confidence: confidence.level,
    confidence_reason: confidence.reason,
    source_count: sourcesUsed.length,
    record_count: uniqueRecords.length,
    freshness_score: Math.round(freshnessScore * 100) / 100,
    fallback_used: fallbackUsed,
    fallback_path: selected.fallback_path,
    sources_used: sourcesUsed,
    data_version: "pipeline-v1",
    seniority_source: senioritySource,
    experience_years: experienceYears,
    notes: fallbackUsed
      ? "Pan-European fallback data used — country-specific data not available for this combination."
      : null,
  };
}
