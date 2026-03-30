/**
 * Normalized salary record schema.
 * Every source record, regardless of origin, is mapped to this shape.
 * This is the single canonical representation of a salary data point.
 */

export type SourceType =
  | "official_stats"    // Government statistical agency (ONS, Destatis, INSEE, INE, Eurostat)
  | "job_platform"      // Job posting aggregator (Indeed)
  | "compensation_platform" // Self-reported compensation (Glassdoor, Levels.fyi)
  | "market_report"     // Industry analyst report
  | "imported_reference"; // Manually seeded reference data

export type RegionScope = "city" | "country" | "europe";

export type SeniorityNormalized =
  | "junior"    // 0–2 years
  | "mid"       // 3–6 years
  | "senior"    // 7–12 years
  | "lead"      // 12+ years / staff / principal
  | "unknown";

export type SalaryPeriod = "annual" | "monthly";
export type SalaryType = "gross_base" | "total_comp" | "unknown";

export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * A single normalized salary record.
 * id format: {source_id}_{country_code}_{role_normalized}_{seniority}_{YYYY}
 */
export interface NormalizedRecord {
  id: string;
  source_id: string;
  source_record_id: string;        // Original identifier in the source dataset
  source_type: SourceType;

  // Geography
  country_code: string;            // ISO 3166-1 alpha-2 (GB, DE, ES, FR, NL, IE)
  country_name: string;
  city_slug: string | null;        // e.g. "london", "berlin" — null for country-level
  city_name: string | null;
  region_scope: RegionScope;

  // Role
  role_raw: string;                // Original label from source (e.g. "Programmers and software dev professionals")
  role_normalized: string;         // Our slug (e.g. "software-engineer")
  role_family: string;             // Broad family (e.g. "engineering", "product", "data")
  source_occupation_code: string | null; // SOC/ISCO code if available

  // Seniority
  seniority_raw: string | null;    // Original label ("Senior", "P25–P75", etc.)
  seniority_normalized: SeniorityNormalized;

  // Salary
  salary_min: number | null;       // P25 or low end
  salary_median: number | null;    // P50 / mean / midpoint
  salary_max: number | null;       // P75 or high end
  currency: string;                // ISO 4217 (GBP, EUR)
  salary_period: SalaryPeriod;     // annual or monthly
  salary_type: SalaryType;         // gross_base / total_comp / unknown

  // Data quality
  sample_size: number | null;      // Number of respondents/records if known
  collected_at: string;            // ISO date this record was ingested (YYYY-MM-DD)
  source_published_at: string | null; // When the source published this data
  data_version: string;            // e.g. "2024-Q4", "2022-SES"

  // Confidence
  freshness_score: number;         // 0–1, 1 = current year, decays ~0.15/year
  source_confidence: number;       // 0–1, based on source type and reputation
  normalization_confidence: number; // 0–1, how confident we are in the role/seniority mapping
  record_confidence: number;       // 0–1, composite

  notes: string | null;
}

/**
 * The result of a benchmark computation.
 * Replaces simple median/low/high with full provenance.
 */
export interface BenchmarkResult {
  // Core salary output
  low: number;
  median: number;
  high: number;
  currency: string;

  // Confidence and coverage
  confidence: ConfidenceLevel;
  confidence_reason: string;
  source_count: number;
  record_count: number;
  freshness_score: number;

  // Provenance
  fallback_used: boolean;
  fallback_path: string[];    // e.g. ["city", "country", "europe"]
  sources_used: string[];     // e.g. ["ons-uk", "glassdoor", "levels-fyi"]
  data_version: string;

  // Seniority adjustment
  seniority_source: "record_matched" | "model_adjusted";
  experience_years: number;

  notes: string | null;
}

/**
 * Validates that a normalized record has required fields.
 * Returns an array of error strings (empty = valid).
 */
export function validateRecord(r: Partial<NormalizedRecord>): string[] {
  const errors: string[] = [];
  if (!r.id) errors.push("missing id");
  if (!r.source_id) errors.push("missing source_id");
  if (!r.country_code || r.country_code.length !== 2) errors.push("invalid country_code");
  if (!r.role_normalized) errors.push("missing role_normalized");
  if (!r.seniority_normalized) errors.push("missing seniority_normalized");
  if (r.salary_median == null && r.salary_min == null) errors.push("no salary data");
  if (!r.currency) errors.push("missing currency");
  if (!r.salary_period) errors.push("missing salary_period");
  if (!r.collected_at) errors.push("missing collected_at");
  if (r.freshness_score != null && (r.freshness_score < 0 || r.freshness_score > 1)) {
    errors.push("freshness_score out of range 0-1");
  }
  return errors;
}
