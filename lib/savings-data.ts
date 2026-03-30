import { getCountry, getBenchmarkRate, type CountryConfig } from "./countries";

// ─── Types ───────────────────────────────────────────────────────────────────

export type VerdictTier = "critical" | "falling-behind" | "stable" | "on-track" | "ahead";
export type InvestsOption = "yes" | "sometimes" | "no";

export interface PathInput {
  countrySlug: string;
  incomeBandSlug: string;
  monthlyRent: number;
  expenseBandSlug: string;
  ageBandSlug?: string;
  invests?: InvestsOption;
}

export interface PathResult {
  verdict: VerdictTier;
  savingsRate: number;
  expectedRate: number;
  gap: number;
  percentile: number;
  monthlyIncome: number;
  monthlyRent: number;
  monthlyOtherExpenses: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  countrySlug: string;
  incomeBandSlug: string;
  ageBandSlug?: string;
  invests?: InvestsOption;
  currency: string;
  currencySymbol: string;
  currencyPosition: "before" | "after";
  dataSource: string;
  dataYear: number;
}

// ─── Age bands (universal) ───────────────────────────────────────────────────

export const AGE_BANDS = [
  { slug: "under-25", label: "Under 25" },
  { slug: "25-30",    label: "25–30" },
  { slug: "30-35",    label: "30–35" },
  { slug: "35-40",    label: "35–40" },
  { slug: "40-50",    label: "40–50" },
  { slug: "50-plus",  label: "50+" },
] as const;

// Age modifiers — applied on top of country benchmark rates
// Higher age = higher expectation due to wealth-building pressure
const AGE_MODIFIERS: Record<string, number> = {
  "under-25": -0.03,
  "25-30":     0.00,
  "30-35":     0.02,
  "35-40":     0.04,
  "40-50":     0.05,
  "50-plus":   0.07,
};

// ─── Percentile estimation ───────────────────────────────────────────────────
// Based on OECD + national survey data. Most households in developed markets
// save 5–10%. Distribution is heavily right-skewed.

function estimatePercentile(savingsRate: number): number {
  if (savingsRate < 0)  return 8;
  if (savingsRate < 3)  return 15;
  if (savingsRate < 6)  return 26;
  if (savingsRate < 10) return 38;
  if (savingsRate < 14) return 50;
  if (savingsRate < 18) return 63;
  if (savingsRate < 22) return 74;
  if (savingsRate < 27) return 83;
  if (savingsRate < 33) return 90;
  return 95;
}

// ─── Core calculation ────────────────────────────────────────────────────────

export function calculatePath(input: PathInput): PathResult {
  const country = getCountry(input.countrySlug);
  if (!country) throw new Error(`Unknown country: ${input.countrySlug}`);

  const incomeBand = country.incomeBands.find((b) => b.slug === input.incomeBandSlug);
  const expenseBand = country.expenseBands.find((b) => b.slug === input.expenseBandSlug);
  if (!incomeBand || !expenseBand) throw new Error("Invalid income or expense band");

  const monthlyIncome   = incomeBand.midpoint / 12;
  const monthlyExpenses = input.monthlyRent + expenseBand.midpoint;
  const monthlySurplus  = monthlyIncome - monthlyExpenses;
  const savingsRate     = (monthlySurplus / monthlyIncome) * 100;

  const baseExpected = getBenchmarkRate(country, input.incomeBandSlug);
  const ageModifier  = input.ageBandSlug ? (AGE_MODIFIERS[input.ageBandSlug] ?? 0) : 0;
  const expectedRate = (baseExpected + ageModifier) * 100;

  const gap       = savingsRate - expectedRate;
  const verdict   = deriveVerdict(savingsRate, gap);
  const percentile = estimatePercentile(savingsRate);

  return {
    verdict,
    savingsRate:          Math.round(savingsRate * 10) / 10,
    expectedRate:         Math.round(expectedRate * 10) / 10,
    gap:                  Math.round(gap * 10) / 10,
    percentile,
    monthlyIncome:        Math.round(monthlyIncome),
    monthlyRent:          input.monthlyRent,
    monthlyOtherExpenses: expenseBand.midpoint,
    monthlyExpenses:      Math.round(monthlyExpenses),
    monthlySurplus:       Math.round(monthlySurplus),
    countrySlug:          input.countrySlug,
    incomeBandSlug:       input.incomeBandSlug,
    ageBandSlug:          input.ageBandSlug,
    invests:              input.invests,
    currency:             country.currency,
    currencySymbol:       country.currencySymbol,
    currencyPosition:     country.currencyPosition,
    dataSource:           country.dataSource,
    dataYear:             country.dataYear,
  };
}

function deriveVerdict(savingsRate: number, gap: number): VerdictTier {
  if (savingsRate < 0) return "critical";
  if (gap < -8)        return "falling-behind";
  if (gap < -2)        return "stable";
  if (gap < 6)         return "on-track";
  return "ahead";
}

// ─── Currency formatting ─────────────────────────────────────────────────────

export function formatAmount(
  amount: number,
  symbol: string,
  position: "before" | "after"
): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString();
  return position === "before" ? `${symbol}${formatted}` : `${formatted}${symbol}`;
}

// ─── Verdict config ──────────────────────────────────────────────────────────

export interface VerdictConfig {
  shortAnswer: string;
  headline: string;
  heroSub: string;
  heroBg: string;
  badge: string;
  badgeLabel: string;
  barColor: string;
  gapColor: string;
}

export const VERDICT_CONFIG: Record<VerdictTier, VerdictConfig> = {
  "critical": {
    shortAnswer: "You're spending more than you earn.",
    headline: "Your expenses exceed your income.",
    heroSub: "This is a structural problem, not a budgeting one. Every month increases the gap.",
    heroBg: "bg-red-50 border-b border-red-100",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Critical",
    barColor: "bg-red-400",
    gapColor: "text-red-600",
  },
  "falling-behind": {
    shortAnswer: "You're falling behind financially.",
    headline: "You're saving significantly less than expected.",
    heroSub: "Your savings rate is well below what people at your income level typically set aside.",
    heroBg: "bg-orange-50 border-b border-orange-100",
    badge: "bg-orange-100 text-orange-700",
    badgeLabel: "Falling Behind",
    barColor: "bg-orange-400",
    gapColor: "text-orange-600",
  },
  "stable": {
    shortAnswer: "You're stable — but not building.",
    headline: "You're covering expenses, but below your savings benchmark.",
    heroSub: "Stability is not the same as progress. You're not falling behind, but you're not compounding either.",
    heroBg: "bg-amber-50 border-b border-amber-100",
    badge: "bg-amber-100 text-amber-700",
    badgeLabel: "Stable",
    barColor: "bg-amber-400",
    gapColor: "text-amber-600",
  },
  "on-track": {
    shortAnswer: "You're on track financially.",
    headline: "Your savings rate is in line with your income level.",
    heroSub: "You're meeting the benchmark for your profile. You're building, not just surviving.",
    heroBg: "bg-teal-50 border-b border-teal-100",
    badge: "bg-teal-100 text-teal-700",
    badgeLabel: "On Track",
    barColor: "bg-teal-500",
    gapColor: "text-teal-600",
  },
  "ahead": {
    shortAnswer: "You're ahead of your peers.",
    headline: "You save more than most people at your income level.",
    heroSub: "Your savings rate is above benchmark. You have strong financial discipline.",
    heroBg: "bg-emerald-50 border-b border-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
    badgeLabel: "Ahead",
    barColor: "bg-emerald-500",
    gapColor: "text-emerald-600",
  },
};

// ─── Dynamic insight copy ─────────────────────────────────────────────────────

export function getInsightLine(result: PathResult): string {
  const { verdict, invests, savingsRate } = result;

  if (verdict === "critical") {
    return "Your expenses exceed your income. This is the most urgent financial signal — address the structural gap before anything else.";
  }
  if (verdict === "falling-behind") {
    if (invests === "no") {
      return "At this rate, you are not building meaningful financial cushion. Each month increases the gap — and you're not investing either.";
    }
    return "At this rate, you are not building meaningful financial cushion. Each month increases the gap.";
  }
  if (verdict === "stable") {
    if (invests === "sometimes" || invests === "no") {
      return "You're covering expenses but not compounding. Stability is not the same as progress.";
    }
    return "You're covering expenses and investing occasionally. Consistency would move you to On Track.";
  }
  if (verdict === "on-track") {
    if (invests === "yes") {
      return `You're saving ${savingsRate}% and investing regularly. Your trajectory is above average for your income level.`;
    }
    return `You're saving ${savingsRate}% — on benchmark. Adding consistent investment would strengthen your position further.`;
  }
  if (invests === "yes") {
    return "You have strong financial discipline. Your savings rate and investment habit put you in the top tier for your income level.";
  }
  return "Your savings behavior puts you in a strong financial position. Most people at your income level save significantly less.";
}
