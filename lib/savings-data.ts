import { getCountry, getBenchmarkRateForIncome, getIncomeBandForIncome } from "./countries";

// ─── Types ───────────────────────────────────────────────────────────────────

export type VerdictTier = "critical" | "falling-behind" | "under-saving" | "on-track" | "ahead";
export type InvestsOption = "yes" | "sometimes" | "no";

export interface PathInput {
  countrySlug: string;
  annualIncome: number;
  monthlyRent: number;
  monthlyOtherExpenses: number;
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
  annualIncome: number;
  incomeBandLabel: string;
  ageBandSlug?: string;
  invests?: InvestsOption;
  currency: string;
  currencySymbol: string;
  currencyPosition: "before" | "after";
  dataSource: string;
  dataYear: number;
}

// ─── Age bands ───────────────────────────────────────────────────────────────

export const AGE_BANDS = [
  { slug: "under-25", label: "Under 25" },
  { slug: "25-30",    label: "25–30" },
  { slug: "30-35",    label: "30–35" },
  { slug: "35-40",    label: "35–40" },
  { slug: "40-50",    label: "40–50" },
  { slug: "50-plus",  label: "50+" },
] as const;

const AGE_MODIFIERS: Record<string, number> = {
  "under-25": -0.03,
  "25-30":     0.00,
  "30-35":     0.02,
  "35-40":     0.04,
  "40-50":     0.05,
  "50-plus":   0.07,
};

// Investment modifier — investing is functionally equivalent to saving.
// Consistent investors effectively raise their savings rate; non-investors
// have a higher burden on pure savings to hit the same position.
const INVEST_MODIFIERS: Record<InvestsOption, number> = {
  "yes":       -0.02,  // reduces expected rate by 2pp — investment counts
  "sometimes":  0.00,
  "no":         0.01,  // raises expected rate by 1pp — no investment safety net
};

// ─── Percentile estimation ────────────────────────────────────────────────────
// Derived from BLS CEX 2023, ONS LCF FYE2024, and OECD cross-country data.
// Distribution is heavily right-skewed in all markets studied.

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

  const incomeBand      = getIncomeBandForIncome(country, input.annualIncome);
  const monthlyIncome   = input.annualIncome / 12;
  const monthlyExpenses = input.monthlyRent + input.monthlyOtherExpenses;
  const monthlySurplus  = monthlyIncome - monthlyExpenses;
  const savingsRate     = (monthlySurplus / monthlyIncome) * 100;

  const baseExpected    = getBenchmarkRateForIncome(country, input.annualIncome);
  const ageModifier     = input.ageBandSlug ? (AGE_MODIFIERS[input.ageBandSlug] ?? 0) : 0;
  const investModifier  = input.invests ? INVEST_MODIFIERS[input.invests] : 0;
  const expectedRate    = (baseExpected + ageModifier + investModifier) * 100;

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
    monthlyOtherExpenses: input.monthlyOtherExpenses,
    monthlyExpenses:      Math.round(monthlyExpenses),
    monthlySurplus:       Math.round(monthlySurplus),
    countrySlug:          input.countrySlug,
    annualIncome:         input.annualIncome,
    incomeBandLabel:      incomeBand.label,
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
  if (gap < -2)        return "under-saving";
  if (gap < 6)         return "on-track";
  return "ahead";
}

// ─── Financial identity system ────────────────────────────────────────────────

export type FinancialIdentity =
  | "running-on-fumes"
  | "comfortable-slide"
  | "stretched-thin"
  | "treading-water"
  | "holding-the-line"
  | "quietly-ahead"
  | "the-compounder";

export interface IdentityCard {
  identity:    FinancialIdentity;
  label:       string;
  statLine:    string;
  comparison:  string;
  shareText:   string;
  borderClass: string;
  bgBarClass:  string;
  accentColor: string; // hex, for OG image
}

export function deriveIdentity(result: PathResult): FinancialIdentity {
  const country = getCountry(result.countrySlug);
  const band    = country ? getIncomeBandForIncome(country, result.annualIncome) : null;
  const bandNum = band ? parseInt(band.slug.replace("band-", ""), 10) : 1;
  if (result.verdict === "critical")                           return "running-on-fumes";
  if (result.verdict === "falling-behind" && bandNum >= 4)     return "comfortable-slide";
  if (result.verdict === "falling-behind")                     return "stretched-thin";
  if (result.verdict === "under-saving")                       return "treading-water";
  if (result.verdict === "on-track")                           return "holding-the-line";
  if (result.verdict === "ahead" && result.invests === "yes")  return "the-compounder";
  return "quietly-ahead";
}

export function buildIdentityCard(result: PathResult): IdentityCard {
  const identity  = deriveIdentity(result);
  const { savingsRate, expectedRate, gap, percentile } = result;
  const absGap    = Math.abs(gap).toFixed(1);
  const absSaving = Math.abs(savingsRate).toFixed(1);
  const gapFmt    = gap.toFixed(1);

  const comparison = percentile >= 50
    ? `Top ${100 - percentile}% of savers at this income level`
    : `Bottom ${percentile}% of savers at this income level`;

  const CONFIGS: Record<FinancialIdentity, Omit<IdentityCard, "identity" | "comparison">> = {
    "running-on-fumes": {
      label:       "Running on Fumes",
      statLine:    `Spending ${absSaving}% more than I earn`,
      shareText:   `I'm spending more than I earn. PathVerdict puts me in the bottom ${percentile}% of savers. Seeing the number is different to knowing it.\npathverdict.com`,
      borderClass: "border-red-300",
      bgBarClass:  "bg-red-300",
      accentColor: "#fca5a5",
    },
    "comfortable-slide": {
      label:       "The Comfortable Slide",
      statLine:    `Saving ${savingsRate}% · Expected ${expectedRate}%`,
      shareText:   `I earn well. I save ${savingsRate}%. People at my income save ${expectedRate}%. The gap is ${absGap} points and it doesn't close itself.\npathverdict.com`,
      borderClass: "border-orange-300",
      bgBarClass:  "bg-orange-300",
      accentColor: "#fdba74",
    },
    "stretched-thin": {
      label:       "Stretched Thin",
      statLine:    `Saving ${savingsRate}% · Gap of ${absGap} points`,
      shareText:   `Saving ${savingsRate}% when the benchmark is ${expectedRate}%. The gap's not laziness — it's the cost base. Still worth seeing it clearly.\npathverdict.com`,
      borderClass: "border-amber-300",
      bgBarClass:  "bg-amber-300",
      accentColor: "#fcd34d",
    },
    "treading-water": {
      label:       "Treading Water",
      statLine:    `Saving ${savingsRate}% · ${absGap} points short`,
      shareText:   `Technically saving. Not building. I'm ${absGap} points below where I should be for my income. Curious where you are?\npathverdict.com`,
      borderClass: "border-yellow-300",
      bgBarClass:  "bg-yellow-300",
      accentColor: "#fde68a",
    },
    "holding-the-line": {
      label:       "Holding the Line",
      statLine:    `Saving ${savingsRate}% · Right at benchmark`,
      shareText:   `I'm on track. Not ahead. Saving ${savingsRate}% — right at the benchmark for my income level. Most people aren't here.\npathverdict.com`,
      borderClass: "border-teal-300",
      bgBarClass:  "bg-teal-300",
      accentColor: "#5eead4",
    },
    "quietly-ahead": {
      label:       "Quietly Ahead",
      statLine:    `Saving ${savingsRate}% · ${gapFmt} points ahead`,
      shareText:   `Saving ${savingsRate}% when people at my income save ${expectedRate}%. I didn't expect that gap.\npathverdict.com`,
      borderClass: "border-emerald-300",
      bgBarClass:  "bg-emerald-300",
      accentColor: "#6ee7b7",
    },
    "the-compounder": {
      label:       "The Compounder",
      statLine:    `Saving ${savingsRate}% · Investing regularly`,
      shareText:   `Saving ${savingsRate}%. Investing consistently. ${gapFmt} points above benchmark. The math is doing what it's supposed to.\npathverdict.com`,
      borderClass: "border-emerald-500",
      bgBarClass:  "bg-emerald-500",
      accentColor: "#10b981",
    },
  };

  return { identity, comparison, ...CONFIGS[identity] };
}

// ─── Currency formatting ─────────────────────────────────────────────────────

export function formatAmount(
  amount: number,
  symbol: string,
  position: "before" | "after"
): string {
  const formatted = Math.abs(amount).toLocaleString();
  return position === "before" ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

// ─── Verdict visual config (styling only) ────────────────────────────────────

export interface VerdictConfig {
  heroBg: string;
  badge: string;
  badgeLabel: string;
  barColor: string;
  gapColor: string;
}

export const VERDICT_CONFIG: Record<VerdictTier, VerdictConfig> = {
  "critical": {
    heroBg:     "bg-red-50 border-b border-red-100",
    badge:      "bg-red-100 text-red-700",
    badgeLabel: "Critical",
    barColor:   "bg-red-400",
    gapColor:   "text-red-600",
  },
  "falling-behind": {
    heroBg:     "bg-orange-50 border-b border-orange-100",
    badge:      "bg-orange-100 text-orange-700",
    badgeLabel: "Falling Behind",
    barColor:   "bg-orange-400",
    gapColor:   "text-orange-600",
  },
  "under-saving": {
    heroBg:     "bg-amber-50 border-b border-amber-100",
    badge:      "bg-amber-100 text-amber-700",
    badgeLabel: "Under-Saving",
    barColor:   "bg-amber-400",
    gapColor:   "text-amber-600",
  },
  "on-track": {
    heroBg:     "bg-teal-50 border-b border-teal-100",
    badge:      "bg-teal-100 text-teal-700",
    badgeLabel: "On Track",
    barColor:   "bg-teal-500",
    gapColor:   "text-teal-600",
  },
  "ahead": {
    heroBg:     "bg-emerald-50 border-b border-emerald-100",
    badge:      "bg-emerald-100 text-emerald-700",
    badgeLabel: "Ahead",
    barColor:   "bg-emerald-500",
    gapColor:   "text-emerald-600",
  },
};

// ─── Dynamic verdict copy (uses actual numbers) ───────────────────────────────

export interface VerdictCopy {
  shortAnswer: string;
  headline: string;
  heroSub: string;
}

export function getVerdictCopy(result: PathResult): VerdictCopy {
  const { verdict, savingsRate, expectedRate, gap } = result;
  const absGap = Math.abs(gap).toFixed(1);

  switch (verdict) {
    case "critical":
      return {
        shortAnswer: "You're spending more than you earn.",
        headline:    "Your expenses exceed your income.",
        heroSub:     `Your savings rate is ${savingsRate}% — you're spending ${Math.abs(savingsRate).toFixed(1)}% more than you take in. Every month the deficit grows.`,
      };
    case "falling-behind":
      return {
        shortAnswer: "You're falling behind financially.",
        headline:    `You save ${savingsRate}% — expected is ${expectedRate}%.`,
        heroSub:     `That's a ${absGap}-point gap. People at your income level typically save ${expectedRate}% or more of their income.`,
      };
    case "under-saving":
      return {
        shortAnswer: "You're saving — but not enough.",
        headline:    `You save ${savingsRate}% — your benchmark is ${expectedRate}%.`,
        heroSub:     `You're ${absGap} points short of your income-level benchmark. You're not falling behind, but you're not building meaningfully either.`,
      };
    case "on-track":
      return {
        shortAnswer: "You're on track financially.",
        headline:    `You save ${savingsRate}% — benchmark is ${expectedRate}%.`,
        heroSub:     gap >= 0
          ? `You're ${gap.toFixed(1)} points above your income-level benchmark. You're building, not just surviving.`
          : `You're ${absGap} points below benchmark but within range. On track for your income and profile.`,
      };
    case "ahead":
      return {
        shortAnswer: "You're ahead of your peers.",
        headline:    `You save ${savingsRate}% — ${gap.toFixed(1)} points above benchmark.`,
        heroSub:     `Expected for your income level is ${expectedRate}%. You're significantly ahead of your peers.`,
      };
  }
}

// ─── Insight copy (position statements, not advice) ──────────────────────────

export function getInsightLine(result: PathResult): string {
  const { verdict, savingsRate, expectedRate, gap, invests } = result;
  const absGap = Math.abs(gap).toFixed(1);
  const investNote = invests === "no"
    ? " You also have no investment buffer."
    : invests === "yes"
    ? " Your investment habit partially offsets this."
    : "";

  switch (verdict) {
    case "critical":
      return `You're running a ${Math.abs(savingsRate).toFixed(1)}% monthly deficit. This is a structural gap — your cost base exceeds your income.${investNote}`;
    case "falling-behind":
      return `You save ${savingsRate}% when people at your income level save ${expectedRate}%. That ${absGap}-point gap is ${investNote ? "significant." + investNote : "significant."}`;
    case "under-saving":
      return `You save ${savingsRate}% — ${absGap} points short of the ${expectedRate}% benchmark for your income level.${invests === "yes" ? " Your investing offsets this partially, which is reflected in your adjusted benchmark." : ""}`;
    case "on-track":
      return `You save ${savingsRate}% — within range of the ${expectedRate}% benchmark for your income profile.${invests === "yes" ? " Your investing strengthens this position." : ""}`;
    case "ahead":
      return `You save ${savingsRate}% against a ${expectedRate}% benchmark. Most people at your income level save significantly less.${invests === "yes" ? " Combined with regular investing, this is a strong financial position." : ""}`;
  }
}
