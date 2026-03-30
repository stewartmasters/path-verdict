// ─── Types ──────────────────────────────────────────────────────────────────

export type VerdictTier = "critical" | "falling-behind" | "stable" | "on-track" | "ahead";
export type InvestsOption = "yes" | "sometimes" | "no";

export interface PathInput {
  incomeBandSlug: string;
  monthlyRent: number;
  expenseBandSlug: string;
  ageBandSlug?: string;
  invests?: InvestsOption;
}

export interface PathResult {
  verdict: VerdictTier;
  savingsRate: number;        // actual, as percentage (e.g. 12.5)
  expectedRate: number;       // benchmark for their profile, as percentage
  gap: number;                // savingsRate - expectedRate (signed)
  percentile: number;         // estimated 1–99
  monthlyIncome: number;
  monthlyRent: number;
  monthlyOtherExpenses: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  incomeBandSlug: string;
  ageBandSlug?: string;
  invests?: InvestsOption;
}

// ─── Income bands ────────────────────────────────────────────────────────────

export const INCOME_BANDS = [
  { slug: "30k-40k",   label: "$30,000 – $40,000",   midpoint: 35000 },
  { slug: "40k-50k",   label: "$40,000 – $50,000",   midpoint: 45000 },
  { slug: "50k-65k",   label: "$50,000 – $65,000",   midpoint: 57500 },
  { slug: "65k-85k",   label: "$65,000 – $85,000",   midpoint: 75000 },
  { slug: "85k-110k",  label: "$85,000 – $110,000",  midpoint: 97500 },
  { slug: "110k-150k", label: "$110,000 – $150,000", midpoint: 130000 },
  { slug: "150k-plus", label: "$150,000+",            midpoint: 180000 },
] as const;

// ─── Expense bands (non-rent monthly) ────────────────────────────────────────

export const EXPENSE_BANDS = [
  { slug: "under-1000", label: "Under $1,000",    midpoint: 750 },
  { slug: "1000-1500",  label: "$1,000 – $1,500", midpoint: 1250 },
  { slug: "1500-2000",  label: "$1,500 – $2,000", midpoint: 1750 },
  { slug: "2000-2500",  label: "$2,000 – $2,500", midpoint: 2250 },
  { slug: "2500-3500",  label: "$2,500 – $3,500", midpoint: 3000 },
  { slug: "over-3500",  label: "Over $3,500",      midpoint: 4500 },
] as const;

// ─── Age bands ───────────────────────────────────────────────────────────────

export const AGE_BANDS = [
  { slug: "under-25", label: "Under 25" },
  { slug: "25-30",    label: "25–30" },
  { slug: "30-35",    label: "30–35" },
  { slug: "35-40",    label: "35–40" },
  { slug: "40-50",    label: "40–50" },
  { slug: "50-plus",  label: "50+" },
] as const;

// ─── Benchmarks ──────────────────────────────────────────────────────────────

// Base expected savings rate by income band (% as decimal)
// Sources: BLS Consumer Expenditure Survey + Fed Survey of Consumer Finances
const BASE_EXPECTED_RATES: Record<string, number> = {
  "30k-40k":   0.05,
  "40k-50k":   0.08,
  "50k-65k":   0.10,
  "65k-85k":   0.13,
  "85k-110k":  0.16,
  "110k-150k": 0.20,
  "150k-plus": 0.25,
};

// Age modifiers (% as decimal, added to base expected rate)
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
// Derived from BLS CEX data on personal savings rates across US households.
// Most Americans save very little — median household saves ~5–7%.

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
  const incomeBand = INCOME_BANDS.find((b) => b.slug === input.incomeBandSlug);
  const expenseBand = EXPENSE_BANDS.find((b) => b.slug === input.expenseBandSlug);

  if (!incomeBand || !expenseBand) {
    throw new Error("Invalid income or expense band");
  }

  const monthlyIncome = incomeBand.midpoint / 12;
  const monthlyExpenses = input.monthlyRent + expenseBand.midpoint;
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = (monthlySurplus / monthlyIncome) * 100;

  const baseExpected = BASE_EXPECTED_RATES[input.incomeBandSlug] ?? 0.10;
  const ageModifier = input.ageBandSlug ? (AGE_MODIFIERS[input.ageBandSlug] ?? 0) : 0;
  const expectedRate = (baseExpected + ageModifier) * 100;

  const gap = savingsRate - expectedRate;

  const verdict = deriveVerdict(savingsRate, gap);
  const percentile = estimatePercentile(savingsRate);

  return {
    verdict,
    savingsRate: Math.round(savingsRate * 10) / 10,
    expectedRate: Math.round(expectedRate * 10) / 10,
    gap: Math.round(gap * 10) / 10,
    percentile,
    monthlyIncome: Math.round(monthlyIncome),
    monthlyRent: input.monthlyRent,
    monthlyOtherExpenses: expenseBand.midpoint,
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlySurplus: Math.round(monthlySurplus),
    incomeBandSlug: input.incomeBandSlug,
    ageBandSlug: input.ageBandSlug,
    invests: input.invests,
  };
}

function deriveVerdict(savingsRate: number, gap: number): VerdictTier {
  if (savingsRate < 0) return "critical";
  if (gap < -8)        return "falling-behind";
  if (gap < -2)        return "stable";
  if (gap < 6)         return "on-track";
  return "ahead";
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
  // ahead
  if (invests === "yes") {
    return "You have strong financial discipline. Your savings rate and investment habit put you in the top tier for your income level.";
  }
  return "Your savings behavior puts you in a strong financial position. Most people at your income level save significantly less.";
}
