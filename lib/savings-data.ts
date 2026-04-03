import { getCountry, getBenchmarkRateForIncome, getIncomeBandForIncome } from "./countries";
import { estimateTax, type TaxEstimate } from "./tax";

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
  monthlyIncome: number;       // gross monthly
  netMonthlyIncome: number;    // after-tax take-home
  monthlyTaxDeduction: number; // gross - net
  taxEffectiveRate: number;    // 0–1, 0 if no profile
  taxNote: string;             // source description
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

  const incomeBand       = getIncomeBandForIncome(country, input.annualIncome);
  const taxEst: TaxEstimate | null = estimateTax(input.annualIncome, input.countrySlug);
  const grossMonthly     = input.annualIncome / 12;
  const netMonthlyIncome = taxEst ? taxEst.netMonthly : grossMonthly;
  const monthlyIncome    = grossMonthly; // kept for display
  const monthlyExpenses  = input.monthlyRent + input.monthlyOtherExpenses;
  const monthlySurplus   = netMonthlyIncome - monthlyExpenses;
  // Savings rate as % of net (disposable) income — consistent with how
  // household expenditure surveys (BLS CEX, ONS LCF, etc.) measure saving.
  const savingsRate      = (monthlySurplus / netMonthlyIncome) * 100;

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
    monthlyIncome:        Math.round(grossMonthly),
    netMonthlyIncome:     Math.round(netMonthlyIncome),
    monthlyTaxDeduction:  taxEst ? taxEst.monthlyDeduction : 0,
    taxEffectiveRate:     taxEst ? taxEst.effectiveRate : 0,
    taxNote:              taxEst ? taxEst.note : "",
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

export function buildIdentityCard(result: PathResult, locale: "en" | "es" = "en"): IdentityCard {
  const identity  = deriveIdentity(result);
  const { savingsRate, expectedRate, gap, percentile } = result;
  const absGap    = Math.abs(gap).toFixed(1);
  const absSaving = Math.abs(savingsRate).toFixed(1);
  const gapFmt    = gap.toFixed(1);

  const STYLE: Record<FinancialIdentity, Pick<IdentityCard, "borderClass" | "bgBarClass" | "accentColor">> = {
    "running-on-fumes":  { borderClass: "border-red-300",     bgBarClass: "bg-red-300",     accentColor: "#fca5a5" },
    "comfortable-slide": { borderClass: "border-orange-300",  bgBarClass: "bg-orange-300",  accentColor: "#fdba74" },
    "stretched-thin":    { borderClass: "border-amber-300",   bgBarClass: "bg-amber-300",   accentColor: "#fcd34d" },
    "treading-water":    { borderClass: "border-yellow-300",  bgBarClass: "bg-yellow-300",  accentColor: "#fde68a" },
    "holding-the-line":  { borderClass: "border-teal-300",    bgBarClass: "bg-teal-300",    accentColor: "#5eead4" },
    "quietly-ahead":     { borderClass: "border-emerald-300", bgBarClass: "bg-emerald-300", accentColor: "#6ee7b7" },
    "the-compounder":    { borderClass: "border-emerald-500", bgBarClass: "bg-emerald-500", accentColor: "#10b981" },
  };

  if (locale === "es") {
    const comparison = percentile >= 50
      ? `Top ${100 - percentile}% de ahorradores en este nivel de ingresos`
      : `El ${percentile}% inferior de ahorradores en este nivel de ingresos`;

    const ES_COPY: Record<FinancialIdentity, Pick<IdentityCard, "label" | "statLine" | "shareText">> = {
      "running-on-fumes": {
        label:     "Al límite",
        statLine:  `Gastando un ${absSaving}% más de lo que ingreso`,
        shareText: `Estoy gastando más de lo que ingreso. PathVerdict me sitúa en el ${percentile}% inferior de ahorradores. Verlo en números es diferente a saberlo.\npathverdict.com`,
      },
      "comfortable-slide": {
        label:     "La caída cómoda",
        statLine:  `Ahorrando el ${savingsRate}% · Esperado ${expectedRate}%`,
        shareText: `Gano bien. Ahorro el ${savingsRate}%. Las personas con mis ingresos ahorran el ${expectedRate}%. La diferencia son ${absGap} puntos y no se cierra sola.\npathverdict.com`,
      },
      "stretched-thin": {
        label:     "Al límite del esfuerzo",
        statLine:  `Ahorrando el ${savingsRate}% · Diferencia de ${absGap} puntos`,
        shareText: `Ahorrando el ${savingsRate}% cuando la referencia es el ${expectedRate}%. La diferencia no es pereza — es el nivel de gastos. Merece verse con claridad.\npathverdict.com`,
      },
      "treading-water": {
        label:     "Aguantando el tipo",
        statLine:  `Ahorrando el ${savingsRate}% · ${absGap} puntos por debajo`,
        shareText: `Técnicamente ahorro. Pero no avanzo. Estoy ${absGap} puntos por debajo de donde debería estar. ¿Dónde estás tú?\npathverdict.com`,
      },
      "holding-the-line": {
        label:     "Manteniéndose firme",
        statLine:  `Ahorrando el ${savingsRate}% · Justo en la referencia`,
        shareText: `Estoy en camino. No por delante. Ahorrando el ${savingsRate}% — justo en la referencia para mi nivel de ingresos. La mayoría no está aquí.\npathverdict.com`,
      },
      "quietly-ahead": {
        label:     "Silenciosamente adelantado",
        statLine:  `Ahorrando el ${savingsRate}% · ${gapFmt} puntos por delante`,
        shareText: `Ahorrando el ${savingsRate}% cuando las personas con mis ingresos ahorran el ${expectedRate}%. No esperaba esa diferencia.\npathverdict.com`,
      },
      "the-compounder": {
        label:     "El inversor constante",
        statLine:  `Ahorrando el ${savingsRate}% · Invirtiendo regularmente`,
        shareText: `Ahorrando el ${savingsRate}%. Invirtiendo de forma constante. ${gapFmt} puntos por encima de la referencia. Las matemáticas hacen su trabajo.\npathverdict.com`,
      },
    };

    return { identity, comparison, ...STYLE[identity], ...ES_COPY[identity] };
  }

  const comparison = percentile >= 50
    ? `Top ${100 - percentile}% of savers at this income level`
    : `Bottom ${percentile}% of savers at this income level`;

  const EN_COPY: Record<FinancialIdentity, Pick<IdentityCard, "label" | "statLine" | "shareText">> = {
    "running-on-fumes": {
      label:     "Running on Fumes",
      statLine:  `Spending ${absSaving}% more than I earn`,
      shareText: `I'm spending more than I earn. PathVerdict puts me in the bottom ${percentile}% of savers. Seeing the number is different to knowing it.\npathverdict.com`,
    },
    "comfortable-slide": {
      label:     "The Comfortable Slide",
      statLine:  `Saving ${savingsRate}% · Expected ${expectedRate}%`,
      shareText: `I earn well. I save ${savingsRate}%. People at my income save ${expectedRate}%. The gap is ${absGap} points and it doesn't close itself.\npathverdict.com`,
    },
    "stretched-thin": {
      label:     "Stretched Thin",
      statLine:  `Saving ${savingsRate}% · Gap of ${absGap} points`,
      shareText: `Saving ${savingsRate}% when the benchmark is ${expectedRate}%. The gap's not laziness — it's the cost base. Still worth seeing it clearly.\npathverdict.com`,
    },
    "treading-water": {
      label:     "Treading Water",
      statLine:  `Saving ${savingsRate}% · ${absGap} points short`,
      shareText: `Technically saving. Not building. I'm ${absGap} points below where I should be for my income. Curious where you are?\npathverdict.com`,
    },
    "holding-the-line": {
      label:     "Holding the Line",
      statLine:  `Saving ${savingsRate}% · Right at benchmark`,
      shareText: `I'm on track. Not ahead. Saving ${savingsRate}% — right at the benchmark for my income level. Most people aren't here.\npathverdict.com`,
    },
    "quietly-ahead": {
      label:     "Quietly Ahead",
      statLine:  `Saving ${savingsRate}% · ${gapFmt} points ahead`,
      shareText: `Saving ${savingsRate}% when people at my income save ${expectedRate}%. I didn't expect that gap.\npathverdict.com`,
    },
    "the-compounder": {
      label:     "The Compounder",
      statLine:  `Saving ${savingsRate}% · Investing regularly`,
      shareText: `Saving ${savingsRate}%. Investing consistently. ${gapFmt} points above benchmark. The math is doing what it's supposed to.\npathverdict.com`,
    },
  };

  return { identity, comparison, ...STYLE[identity], ...EN_COPY[identity] };
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

const VERDICT_BADGE_LABELS_ES: Record<VerdictTier, string> = {
  "critical":       "Crítico",
  "falling-behind": "Retrasado",
  "under-saving":   "Ahorro insuficiente",
  "on-track":       "En camino",
  "ahead":          "Por delante",
};

export function getVerdictBadgeLabel(verdict: VerdictTier, locale: "en" | "es" = "en"): string {
  if (locale === "es") return VERDICT_BADGE_LABELS_ES[verdict];
  return VERDICT_CONFIG[verdict].badgeLabel;
}

// ─── Dynamic verdict copy (uses actual numbers) ───────────────────────────────

export interface VerdictCopy {
  shortAnswer: string;
  headline: string;
  heroSub: string;
}

export function getVerdictCopy(result: PathResult, locale: "en" | "es" = "en"): VerdictCopy {
  const { verdict, savingsRate, expectedRate, gap } = result;
  const absGap = Math.abs(gap).toFixed(1);

  if (locale === "es") {
    switch (verdict) {
      case "critical":
        return {
          shortAnswer: "Estás gastando más de lo que ganas.",
          headline:    "Tus gastos superan tus ingresos.",
          heroSub:     `Tu tasa de ahorro es del ${savingsRate}% — estás gastando un ${Math.abs(savingsRate).toFixed(1)}% más de lo que ingresas. El déficit crece cada mes.`,
        };
      case "falling-behind":
        return {
          shortAnswer: "Te estás quedando atrás financieramente.",
          headline:    `Ahorras el ${savingsRate}% — se espera el ${expectedRate}%.`,
          heroSub:     `Eso es una diferencia de ${absGap} puntos. Las personas con tus ingresos suelen ahorrar el ${expectedRate}% o más.`,
        };
      case "under-saving":
        return {
          shortAnswer: "Ahorras, pero no lo suficiente.",
          headline:    `Ahorras el ${savingsRate}% — tu referencia es el ${expectedRate}%.`,
          heroSub:     `Te faltan ${absGap} puntos para el benchmark de tu nivel de ingresos. No estás retrasado, pero tampoco construyes un colchón real.`,
        };
      case "on-track":
        return {
          shortAnswer: "Estás en camino financieramente.",
          headline:    `Ahorras el ${savingsRate}% — referencia: ${expectedRate}%.`,
          heroSub:     gap >= 0
            ? `Estás ${gap.toFixed(1)} puntos por encima de tu referencia de ingresos. Avanzas, no solo sobrevives.`
            : `Estás ${absGap} puntos por debajo de la referencia, pero dentro del margen. En camino para tu perfil.`,
        };
      case "ahead":
        return {
          shortAnswer: "Estás por delante de tus comparables.",
          headline:    `Ahorras el ${savingsRate}% — ${gap.toFixed(1)} puntos por encima de la referencia.`,
          heroSub:     `La referencia para tu nivel de ingresos es el ${expectedRate}%. Estás significativamente por delante.`,
        };
    }
  }

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

export function getInsightLine(result: PathResult, locale: "en" | "es" = "en"): string {
  const { verdict, savingsRate, expectedRate, gap, invests } = result;
  const absGap = Math.abs(gap).toFixed(1);

  if (locale === "es") {
    const investNote = invests === "no"
      ? " Además, no tienes respaldo de inversiones."
      : invests === "yes"
      ? " Tu hábito inversor compensa esto parcialmente."
      : "";
    switch (verdict) {
      case "critical":
        return `Tienes un déficit mensual del ${Math.abs(savingsRate).toFixed(1)}%. Es una brecha estructural: tus gastos superan tus ingresos.${investNote}`;
      case "falling-behind":
        return `Ahorras el ${savingsRate}% cuando las personas con tus ingresos ahorran el ${expectedRate}%. Esa diferencia de ${absGap} puntos es${investNote ? " significativa." + investNote : " significativa."}`;
      case "under-saving":
        return `Ahorras el ${savingsRate}% — ${absGap} puntos por debajo del benchmark del ${expectedRate}% para tu nivel de ingresos.${invests === "yes" ? " Que inviertas compensa esto parcialmente, reflejado en tu benchmark ajustado." : ""}`;
      case "on-track":
        return `Ahorras el ${savingsRate}% — dentro del rango del benchmark del ${expectedRate}% para tu perfil de ingresos.${invests === "yes" ? " Tu hábito inversor refuerza esta posición." : ""}`;
      case "ahead":
        return `Ahorras el ${savingsRate}% frente a una referencia del ${expectedRate}%. La mayoría de las personas con tus ingresos ahorran bastante menos.${invests === "yes" ? " Combinado con inversión regular, es una posición financiera sólida." : ""}`;
    }
  }

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
