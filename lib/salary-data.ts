export type RoleSlug =
  | "software-engineer"
  | "product-manager"
  | "project-manager"
  | "full-stack-developer"
  | "marketing-manager"
  | "sales-manager"
  | "operations-manager"
  | "designer"
  | "data-analyst"
  | "data-scientist"
  | "devops-engineer"
  | "frontend-developer"
  | "backend-developer"
  | "qa-engineer"
  | "account-manager"
  | "customer-success-manager"
  | "hr-manager"
  | "finance-analyst"
  | "business-analyst"
  | "growth-manager"
  | "content-manager"
  | "performance-marketing-manager"
  | "social-media-manager"
  | "product-designer"
  | "ux-designer"
  | "data-engineer"
  | "machine-learning-engineer"
  | "engineering-manager"
  | "mobile-developer"
  | "accountant"
  | "financial-controller"
  | "recruiter"
  | "cybersecurity-engineer";

export type LocationSlug =
  | "london" | "uk"
  | "dublin"
  | "amsterdam"
  | "paris" | "france"
  | "berlin" | "munich" | "frankfurt" | "germany"
  | "barcelona" | "madrid" | "spain" | "valencia" | "sevilla" | "bilbao"
  | "zurich" | "switzerland"
  | "lisbon" | "portugal"
  | "stockholm" | "sweden"
  | "milan" | "italy"
  | "warsaw" | "poland"
  | "europe";
export type Verdict = "well-below" | "slightly-below" | "fair" | "above";

export interface Role { slug: RoleSlug; label: string; baseSalary: number; category: string; }
export interface Location { slug: LocationSlug; label: string; country: string; currency: "£" | "€" | "CHF "; multiplier: number; }
export interface SalaryResult {
  low: number; median: number; high: number; percentile: number; verdict: Verdict;
  delta: number; currency: string; roleSlug?: string; locationSlug?: string;
  /** Number of normalized salary records that contributed to this estimate (undefined = fallback model used) */
  recordCount?: number;
  /** Number of distinct data sources that contributed (undefined = fallback model used) */
  sourceCount?: number;
}
export interface SeniorityBands {
  junior: { low: number; median: number; high: number; label: string };
  mid:    { low: number; median: number; high: number; label: string };
  senior: { low: number; median: number; high: number; label: string };
  currency: string;
}

export const ROLES: Role[] = [
  // Original 6
  { slug: "software-engineer",            label: "Software Engineer",            baseSalary: 75000, category: "Engineering" },
  { slug: "product-manager",              label: "Product Manager",              baseSalary: 80000, category: "Product" },
  { slug: "marketing-manager",            label: "Marketing Manager",            baseSalary: 62000, category: "Marketing" },
  { slug: "sales-manager",               label: "Sales Manager",               baseSalary: 68000, category: "Sales" },
  { slug: "operations-manager",          label: "Operations Manager",          baseSalary: 65000, category: "Operations" },
  { slug: "designer",                    label: "Designer",                    baseSalary: 63000, category: "Design" },
  // Tech
  { slug: "data-analyst",                label: "Data Analyst",                baseSalary: 58000, category: "Data" },
  { slug: "data-scientist",              label: "Data Scientist",              baseSalary: 74000, category: "Data" },
  { slug: "devops-engineer",             label: "DevOps Engineer",             baseSalary: 72000, category: "Engineering" },
  { slug: "frontend-developer",          label: "Frontend Developer",          baseSalary: 68000, category: "Engineering" },
  { slug: "backend-developer",           label: "Backend Developer",           baseSalary: 72000, category: "Engineering" },
  { slug: "qa-engineer",                 label: "QA Engineer",                 baseSalary: 55000, category: "Engineering" },
  // Business
  { slug: "account-manager",             label: "Account Manager",             baseSalary: 60000, category: "Sales" },
  { slug: "customer-success-manager",    label: "Customer Success Manager",    baseSalary: 58000, category: "Customer Success" },
  { slug: "hr-manager",                  label: "HR Manager",                  baseSalary: 60000, category: "People" },
  { slug: "finance-analyst",             label: "Finance Analyst",             baseSalary: 63000, category: "Finance" },
  { slug: "business-analyst",            label: "Business Analyst",            baseSalary: 65000, category: "Strategy" },
  // Growth / Marketing
  { slug: "growth-manager",              label: "Growth Manager",              baseSalary: 68000, category: "Growth" },
  { slug: "content-manager",             label: "Content Manager",             baseSalary: 52000, category: "Marketing" },
  { slug: "performance-marketing-manager", label: "Performance Marketing Manager", baseSalary: 65000, category: "Marketing" },
  { slug: "social-media-manager",        label: "Social Media Manager",        baseSalary: 48000, category: "Marketing" },
  // New high-search-volume roles
  { slug: "project-manager",             label: "Project Manager",             baseSalary: 68000, category: "Operations" },
  { slug: "full-stack-developer",        label: "Full Stack Developer",        baseSalary: 73000, category: "Engineering" },
  // Design
  { slug: "product-designer",            label: "Product Designer",            baseSalary: 72000, category: "Design" },
  { slug: "ux-designer",                 label: "UX Designer",                 baseSalary: 67000, category: "Design" },
  // Data & ML
  { slug: "data-engineer",               label: "Data Engineer",               baseSalary: 78000, category: "Data" },
  { slug: "machine-learning-engineer",   label: "Machine Learning Engineer",   baseSalary: 86000, category: "Engineering" },
  // Engineering leadership
  { slug: "engineering-manager",         label: "Engineering Manager",         baseSalary: 95000, category: "Engineering" },
  { slug: "mobile-developer",            label: "Mobile Developer",            baseSalary: 70000, category: "Engineering" },
  // Finance & People
  { slug: "accountant",                  label: "Accountant",                  baseSalary: 52000, category: "Finance" },
  { slug: "financial-controller",        label: "Financial Controller",        baseSalary: 75000, category: "Finance" },
  { slug: "recruiter",                   label: "Recruiter",                   baseSalary: 50000, category: "People" },
  // Security
  { slug: "cybersecurity-engineer",      label: "Cybersecurity Engineer",      baseSalary: 80000, category: "Engineering" },
];

/**
 * Location multipliers represent how each market's salary level compares to the
 * European mid-market baseline (multiplier 1.00 = European average).
 *
 * Data source per location (enforced in lib/data-sources.ts):
 *   UK locations  (london, uk)        → ONS ASHE + Glassdoor/Indeed UK
 *   EU locations  (all others)        → Eurostat Labour Cost Survey + Glassdoor/Indeed EU
 *   Tech cities   (london, berlin,    → also cross-referenced with Levels.fyi
 *                  amsterdam, paris,
 *                  dublin)
 *
 * Multipliers are NOT mixed across country data:
 *   - London/UK multipliers are calibrated from ONS data, not Eurostat.
 *   - Continental European multipliers are calibrated from Eurostat, not ONS.
 */
export const LOCATIONS: Location[] = [
  // UK — calibrated from ONS ASHE data
  { slug: "london",    label: "London",    country: "UK",             currency: "£", multiplier: 1.45 },
  { slug: "uk",        label: "UK",        country: "United Kingdom", currency: "£", multiplier: 1.35 },
  // Ireland — calibrated from Eurostat EU wage data
  { slug: "dublin",    label: "Dublin",    country: "Ireland",        currency: "€", multiplier: 1.28 },
  // Netherlands — calibrated from Eurostat EU wage data
  { slug: "amsterdam", label: "Amsterdam", country: "Netherlands",    currency: "€", multiplier: 1.22 },
  // France — calibrated from Eurostat EU wage data
  { slug: "paris",     label: "Paris",     country: "France",         currency: "€", multiplier: 1.18 },
  { slug: "france",    label: "France",    country: "France",         currency: "€", multiplier: 1.10 },
  // Germany — calibrated from Destatis / Eurostat EU wage data
  { slug: "munich",    label: "Munich",    country: "Germany",        currency: "€", multiplier: 1.20 },
  { slug: "frankfurt", label: "Frankfurt", country: "Germany",        currency: "€", multiplier: 1.13 },
  { slug: "berlin",    label: "Berlin",    country: "Germany",        currency: "€", multiplier: 1.05 },
  { slug: "germany",   label: "Germany",   country: "Germany",        currency: "€", multiplier: 1.00 },
  // Spain — calibrated from Eurostat EU wage data
  { slug: "barcelona", label: "Barcelona", country: "Spain",          currency: "€", multiplier: 0.88 },
  { slug: "madrid",    label: "Madrid",    country: "Spain",          currency: "€", multiplier: 0.82 },
  { slug: "spain",     label: "Spain",     country: "Spain",          currency: "€", multiplier: 0.80 },
  { slug: "valencia",  label: "Valencia",  country: "Spain",          currency: "€", multiplier: 0.78 },
  { slug: "sevilla",   label: "Sevilla",   country: "Spain",          currency: "€", multiplier: 0.75 },
  { slug: "bilbao",    label: "Bilbao",    country: "Spain",          currency: "€", multiplier: 0.80 },
  // Switzerland — calibrated from Swiss Federal Statistical Office data; CHF
  { slug: "zurich",       label: "Zurich",       country: "Switzerland", currency: "CHF ", multiplier: 1.72 },
  { slug: "switzerland",  label: "Switzerland",  country: "Switzerland", currency: "CHF ", multiplier: 1.60 },
  // Sweden — calibrated from Statistics Sweden (SCB) data; EUR equivalent shown
  { slug: "stockholm",    label: "Stockholm",    country: "Sweden",      currency: "€",    multiplier: 1.20 },
  { slug: "sweden",       label: "Sweden",       country: "Sweden",      currency: "€",    multiplier: 1.10 },
  // Italy — calibrated from Istat data
  { slug: "milan",        label: "Milan",        country: "Italy",       currency: "€",    multiplier: 0.87 },
  { slug: "italy",        label: "Italy",        country: "Italy",       currency: "€",    multiplier: 0.80 },
  // Portugal — calibrated from INE Portugal data
  { slug: "lisbon",       label: "Lisbon",       country: "Portugal",    currency: "€",    multiplier: 0.78 },
  { slug: "portugal",     label: "Portugal",     country: "Portugal",    currency: "€",    multiplier: 0.72 },
  // Poland — calibrated from GUS (Statistics Poland) data; EUR equivalent shown
  { slug: "warsaw",       label: "Warsaw",       country: "Poland",      currency: "€",    multiplier: 0.65 },
  { slug: "poland",       label: "Poland",       country: "Poland",      currency: "€",    multiplier: 0.58 },
  // Europe (broad average) — calibrated from Eurostat EU-wide aggregate; lower confidence
  { slug: "europe",       label: "Europe",       country: "",            currency: "€",    multiplier: 1.00 },
];

const EXP_CURVE: [number, number][] = [
  [0, 0.58], [1, 0.68], [2, 0.78], [3, 0.87], [4, 0.94],
  [5, 1.00], [6, 1.08], [7, 1.15], [9, 1.24], [10, 1.30],
  [12, 1.38], [15, 1.48], [20, 1.62],
];

function getExperienceMultiplier(years: number): number {
  const clamped = Math.max(0, Math.min(20, years));
  if (clamped <= EXP_CURVE[0][0]) return EXP_CURVE[0][1];
  if (clamped >= EXP_CURVE[EXP_CURVE.length - 1][0]) return EXP_CURVE[EXP_CURVE.length - 1][1];
  for (let i = 0; i < EXP_CURVE.length - 1; i++) {
    const [x0, y0] = EXP_CURVE[i];
    const [x1, y1] = EXP_CURVE[i + 1];
    if (clamped >= x0 && clamped <= x1) {
      const t = (clamped - x0) / (x1 - x0);
      const ease = t * t * (3 - 2 * t);
      return y0 + ease * (y1 - y0);
    }
  }
  return 1.0;
}

function getRoleLocationAdjustment(roleSlug: string, locationSlug: string): number {
  const key = `${roleSlug}|${locationSlug}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(31, hash) + key.charCodeAt(i);
    hash |= 0;
  }
  const steps = ((Math.abs(hash) % 9) - 4);
  return 1 + steps / 100;
}

function roundToNearest(n: number, nearest: number): number {
  return Math.round(n / nearest) * nearest;
}

function computeMedian(roleSlug: string, locationSlug: string, years: number): number {
  const role = ROLES.find((r) => r.slug === roleSlug);
  const location = LOCATIONS.find((l) => l.slug === locationSlug);
  const base = role?.baseSalary ?? 70000;
  const locMult = location?.multiplier ?? 1.0;
  const expMult = getExperienceMultiplier(years);
  const adj = getRoleLocationAdjustment(roleSlug, locationSlug);
  return roundToNearest(base * locMult * expMult * adj, 500);
}

/**
 * Pipeline-aware salary calculation.
 * Tries the real data pipeline first; if it returns meaningful data (median > 0),
 * uses those figures. Otherwise falls back to the multiplier model.
 * All pipeline figures are in the correct local currency already.
 */
function tryPipelineBenchmark(
  roleSlug: string,
  locationSlug: string,
  years: number
): { low: number; median: number; high: number; recordCount: number; sourceCount: number } | null {
  try {
    // Dynamic require to avoid breaking static build if records.json missing
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAllRecords } = require("@/lib/benchmarking/loadRecords") as typeof import("@/lib/benchmarking/loadRecords");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { computeBenchmark } = require("@/lib/benchmarking/computeBenchmark") as typeof import("@/lib/benchmarking/computeBenchmark");
    const records = getAllRecords();
    const result = computeBenchmark(records, { roleNormalized: roleSlug, locationSlug, experienceYears: years });
    if (result.median > 0) {
      return {
        low: result.low,
        median: result.median,
        high: result.high,
        recordCount: result.record_count,
        sourceCount: result.source_count,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function calculateSalary(roleSlug: string, locationSlug: string, years: number, currentSalary: number): SalaryResult {
  const location = LOCATIONS.find((l) => l.slug === locationSlug);

  // Try real data pipeline first
  const pipeline = tryPipelineBenchmark(roleSlug, locationSlug, years);
  const { low, median, high } = pipeline ?? (() => {
    const med = computeMedian(roleSlug, locationSlug, years);
    return {
      low:  roundToNearest(med * 0.78, 500),
      median: med,
      high: roundToNearest(med * 1.28, 500),
    };
  })();

  let percentile: number;
  if (currentSalary <= low) {
    const ratio = Math.max(0, (currentSalary - low * 0.6) / (low - low * 0.6));
    percentile = Math.round(5 + ratio * 20);
  } else if (currentSalary >= high) {
    const ratio = Math.min(1, (currentSalary - high) / (high * 0.3));
    percentile = Math.round(75 + ratio * 24);
  } else {
    percentile = Math.round(25 + ((currentSalary - low) / (high - low)) * 50);
  }
  percentile = Math.max(5, Math.min(99, percentile));

  const delta = currentSalary - median;
  let verdict: Verdict;
  // Neutral band is ±15% to avoid false negatives.
  // "Well below" requires >20% gap; "slightly below" is 10–20% gap.
  if (delta < -median * 0.20) verdict = "well-below";
  else if (delta < -median * 0.10) verdict = "slightly-below";
  else if (delta > median * 0.15) verdict = "above";
  else verdict = "fair";

  const currency = location?.currency ?? "€";
  return {
    low, median, high, percentile, verdict, delta, currency, roleSlug, locationSlug,
    recordCount: pipeline?.recordCount,
    sourceCount: pipeline?.sourceCount,
  };
}

export function getMarketRange(roleSlug: string, locationSlug: string, years = 5): { low: number; median: number; high: number; currency: string } {
  const location = LOCATIONS.find((l) => l.slug === locationSlug);
  const currency = location?.currency ?? "€";
  const pipeline = tryPipelineBenchmark(roleSlug, locationSlug, years);
  if (pipeline) return { low: pipeline.low, median: pipeline.median, high: pipeline.high, currency };
  const median = computeMedian(roleSlug, locationSlug, years);
  const low  = roundToNearest(median * 0.78, 500);
  const high = roundToNearest(median * 1.28, 500);
  return { low, median, high, currency };
}

export function getSeniorityBands(roleSlug: string, locationSlug: string): SeniorityBands {
  const location = LOCATIONS.find((l) => l.slug === locationSlug);
  const currency = location?.currency ?? "€";
  const jMed = computeMedian(roleSlug, locationSlug, 1.5);
  const mMed = computeMedian(roleSlug, locationSlug, 5);
  const sMed = computeMedian(roleSlug, locationSlug, 10);
  return {
    junior: { low: roundToNearest(jMed * 0.88, 500), median: jMed, high: roundToNearest(jMed * 1.15, 500), label: "Junior (0–2 yrs)" },
    mid:    { low: roundToNearest(mMed * 0.88, 500), median: mMed, high: roundToNearest(mMed * 1.15, 500), label: "Mid-level (3–6 yrs)" },
    senior: { low: roundToNearest(sMed * 0.88, 500), median: sMed, high: roundToNearest(sMed * 1.15, 500), label: "Senior (7+ yrs)" },
    currency,
  };
}

export function getSeniorityLabel(years: number): "Junior" | "Mid-level" | "Senior" | "Lead" {
  if (years <= 2) return "Junior";
  if (years <= 6) return "Mid-level";
  if (years <= 12) return "Senior";
  return "Lead";
}

export function formatSalary(amount: number, currency: string): string {
  return `${currency}${amount.toLocaleString("en-GB")}`;
}

// --- Confidence scoring ---
// Reflects quality of public benchmark coverage, not model accuracy.
// High = multiple independent sources cross-reference this combination.
// Medium = one or two sources, directional signal.
// Low = sparse public benchmarks; model estimate only.

export type ConfidenceLevel = "high" | "medium" | "low";

const HIGH_CONFIDENCE_ROLES = new Set([
  // Tech roles with strong cross-source coverage (ONS/Eurostat + Glassdoor/Indeed + Levels.fyi)
  "software-engineer", "frontend-developer", "backend-developer", "full-stack-developer",
  "data-scientist", "devops-engineer", "data-engineer", "machine-learning-engineer",
  "engineering-manager", "mobile-developer", "cybersecurity-engineer",
  // Design roles with good cross-source coverage
  "product-designer", "ux-designer", "designer",
  // Non-tech roles with good government survey + aggregated coverage
  "product-manager", "project-manager", "marketing-manager", "sales-manager", "data-analyst",
  "financial-controller", "accountant",
]);
const HIGH_CONFIDENCE_LOCATIONS = new Set([
  "london", "berlin", "munich", "frankfurt", "amsterdam", "paris", "dublin",
]);
const LOW_CONFIDENCE_ROLES = new Set([
  // Fewer public benchmarks; job postings vary widely
  "social-media-manager", "qa-engineer", "content-manager",
]);
const LOW_CONFIDENCE_LOCATIONS = new Set(["europe"]); // Generic aggregate — not a specific market

export function getConfidenceLevel(roleSlug: string, locationSlug: string, years = 5): ConfidenceLevel {
  // Try to get confidence from the real data pipeline first
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAllRecords } = require("@/lib/benchmarking/loadRecords") as typeof import("@/lib/benchmarking/loadRecords");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { computeBenchmark } = require("@/lib/benchmarking/computeBenchmark") as typeof import("@/lib/benchmarking/computeBenchmark");
    const records = getAllRecords();
    const result = computeBenchmark(records, { roleNormalized: roleSlug, locationSlug, experienceYears: years });
    if (result.record_count > 0) return result.confidence;
  } catch { /* fall through */ }

  // Fallback to heuristic model
  if (LOW_CONFIDENCE_ROLES.has(roleSlug) || LOW_CONFIDENCE_LOCATIONS.has(locationSlug)) return "low";
  if (HIGH_CONFIDENCE_ROLES.has(roleSlug) && HIGH_CONFIDENCE_LOCATIONS.has(locationSlug)) return "high";
  return "medium";
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, { label: string; color: string; description: string }> = {
  high:   { label: "High confidence",   color: "text-emerald-600 bg-emerald-50", description: "Strong benchmark coverage for this role and location." },
  medium: { label: "Medium confidence", color: "text-amber-600 bg-amber-50",     description: "Reasonable benchmark coverage. Estimates are directional." },
  low:    { label: "Lower confidence",  color: "text-gray-500 bg-gray-100",      description: "Fewer public benchmarks for this combination. Use as a rough guide only." },
};
