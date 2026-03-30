/**
 * Seniority normalization engine.
 * Maps raw seniority labels from sources to a canonical normalized set.
 * Conservative: if in doubt, returns "unknown" rather than over-inferring.
 */

import type { SeniorityNormalized } from "@/lib/normalization/types";

interface SeniorityEntry {
  normalized: SeniorityNormalized;
  labels: string[];           // Raw labels that map to this level (case-insensitive)
  years_min: number;
  years_max: number;
  years_midpoint: number;
}

export const SENIORITY_DEFINITIONS: SeniorityEntry[] = [
  {
    normalized: "junior",
    labels: [
      "junior", "jr", "graduate", "associate", "entry level", "entry-level",
      "trainee", "intern", "berufseinsteiger", "junior entwickler",
      "débutant", "junior développeur", "junior software engineer",
      "software engineer i", "software engineer 1",
      "analyst", // many analyst roles at entry level
    ],
    years_min: 0,
    years_max: 2,
    years_midpoint: 1,
  },
  {
    normalized: "mid",
    labels: [
      "mid", "mid-level", "middle", "intermediate", "software engineer ii",
      "software engineer 2", "experienced", "confirmed",
      "engineer ii", "engineer 2",
    ],
    years_min: 3,
    years_max: 6,
    years_midpoint: 4.5,
  },
  {
    normalized: "senior",
    labels: [
      "senior", "sr", "sr.", "senior engineer", "senior developer",
      "senior software engineer", "software engineer iii", "engineer iii",
      "senior analyst", "principal analyst",
    ],
    years_min: 7,
    years_max: 12,
    years_midpoint: 9,
  },
  {
    normalized: "lead",
    labels: [
      "lead", "staff", "principal", "distinguished", "fellow",
      "staff engineer", "principal engineer", "architect",
      "director", "head of", "vp", "vice president", "chief",
    ],
    years_min: 12,
    years_max: 30,
    years_midpoint: 15,
  },
];

const LABEL_MAP = new Map<string, SeniorityNormalized>();
for (const entry of SENIORITY_DEFINITIONS) {
  for (const label of entry.labels) {
    LABEL_MAP.set(label.toLowerCase(), entry.normalized);
  }
}

/** Normalize a raw seniority string. Returns "unknown" if not recognized. */
export function normalizeSeniority(raw: string | null | undefined): SeniorityNormalized {
  if (!raw) return "unknown";
  const lower = raw.toLowerCase().trim();

  const exact = LABEL_MAP.get(lower);
  if (exact) return exact;

  // Partial match
  for (const [label, normalized] of LABEL_MAP.entries()) {
    if (lower.includes(label)) return normalized;
  }

  return "unknown";
}

/**
 * Infer seniority from years of experience.
 * Used when source data has experience ranges but no explicit seniority label.
 */
export function seniorityFromYears(years: number): SeniorityNormalized {
  if (years <= 2) return "junior";
  if (years <= 6) return "mid";
  if (years <= 12) return "senior";
  return "lead";
}

/** Get the midpoint years for a seniority level. */
export function seniorityMidpointYears(seniority: SeniorityNormalized): number {
  const entry = SENIORITY_DEFINITIONS.find((e) => e.normalized === seniority);
  return entry?.years_midpoint ?? 5;
}

/** Get the experience multiplier for a given years-of-experience relative to mid-level. */
export function experienceMultiplier(yearsOfExp: number): number {
  // Non-linear curve: aggressive early growth, slowing at senior level
  // Based on typical European tech market observations
  const CURVE: [number, number][] = [
    [0,  0.58], [1, 0.68], [2, 0.78], [3, 0.87],
    [4,  0.94], [5, 1.00], [6, 1.08], [7, 1.15],
    [9,  1.24], [10, 1.30], [12, 1.38], [15, 1.48], [20, 1.62],
  ];
  const clamped = Math.max(0, Math.min(20, yearsOfExp));
  if (clamped <= CURVE[0][0]) return CURVE[0][1];
  if (clamped >= CURVE[CURVE.length - 1][0]) return CURVE[CURVE.length - 1][1];
  for (let i = 0; i < CURVE.length - 1; i++) {
    const [x0, y0] = CURVE[i];
    const [x1, y1] = CURVE[i + 1];
    if (clamped >= x0 && clamped <= x1) {
      const t = (clamped - x0) / (x1 - x0);
      const ease = t * t * (3 - 2 * t); // Hermite smoothstep
      return y0 + ease * (y1 - y0);
    }
  }
  return 1.0;
}
