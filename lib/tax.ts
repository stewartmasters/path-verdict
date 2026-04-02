/**
 * Effective tax rate estimates per country.
 *
 * "Effective rate" = (gross − take-home) / gross, combining:
 *   - Income tax (averaged to effective rate, not marginal)
 *   - Employee social / national insurance contributions
 *
 * These are approximations for a single, employed person with no
 * special deductions. Always shown to users with an "estimated" label.
 *
 * Calibration sources:
 *   OECD Taxing Wages 2023 — net personal average tax rates at 67%,
 *   100%, 167% of average wage per country.
 *   Cross-checked against KPMG Individual Tax Rates and national salary
 *   calculators (HMRC, impots.gouv.fr, Finanzamt, Agencia Tributaria,
 *   ATO Tax Withheld Calculator, CRA, Revenue Commissioners Ireland,
 *   Belastingdienst, Skatteverket, IRD NZ).
 *
 * `upTo` = annual gross in local currency (last bracket = Infinity).
 * `rate` = fraction of gross taken as tax + social contributions.
 */

interface Bracket {
  upTo: number;
  rate: number;
}

const PROFILES: Record<string, { brackets: Bracket[]; note: string }> = {

  // ── United Kingdom ───────────────────────────────────────────────────────────
  // Income tax + NI (8%/2% from Jan 2024). Personal allowance £12,570.
  // OECD 2023: 100% AW (~£31k) = 22.7%, 167% AW (~£52k) = 28.6%
  gb: {
    brackets: [
      { upTo:  15_000, rate: 0.07 },
      { upTo:  50_270, rate: 0.22 },
      { upTo: 100_000, rate: 0.31 },
      { upTo: 125_000, rate: 0.38 }, // personal allowance taper ~60% marginal
      { upTo: Infinity, rate: 0.42 },
    ],
    note: "Income tax + National Insurance (UK)",
  },

  // ── Germany ──────────────────────────────────────────────────────────────────
  // Income tax + solidarity surcharge + employee SS ~20% (capped ~€90k).
  // OECD 2023: 100% AW (~€42k) = 37.9%, 167% AW (~€70k) = 42.0%
  de: {
    brackets: [
      { upTo:  20_000, rate: 0.25 },
      { upTo:  40_000, rate: 0.35 },
      { upTo:  60_000, rate: 0.40 },
      { upTo: 100_000, rate: 0.44 },
      { upTo: Infinity, rate: 0.46 },
    ],
    note: "Income tax + solidarity surcharge + social contributions (Germany)",
  },

  // ── France ───────────────────────────────────────────────────────────────────
  // IR + employee social charges (CSG/CRDS ~9.7% + retirement ~4-7% + other).
  // OECD 2023: 100% AW (~€38k) = 27.8%, 167% AW (~€63k) = 31.6%
  fr: {
    brackets: [
      { upTo:  20_000, rate: 0.23 },
      { upTo:  40_000, rate: 0.28 },
      { upTo:  70_000, rate: 0.33 },
      { upTo: 100_000, rate: 0.38 },
      { upTo: Infinity, rate: 0.43 },
    ],
    note: "IR + cotisations sociales salariales (France)",
  },

  // ── Spain ────────────────────────────────────────────────────────────────────
  // IRPF effective + employee SS ~6.35% (capped ~€4,500/yr above ~€57k).
  // OECD 2023: 100% AW (~€26k) = 20.4%, 167% AW (~€43k) = 25.5%
  es: {
    brackets: [
      { upTo:  20_000, rate: 0.19 },
      { upTo:  35_000, rate: 0.24 },
      { upTo:  60_000, rate: 0.30 },
      { upTo: 100_000, rate: 0.35 },
      { upTo: 150_000, rate: 0.39 },
      { upTo: Infinity, rate: 0.42 },
    ],
    note: "IRPF + seguridad social del trabajador (Spain)",
  },

  // ── Netherlands ──────────────────────────────────────────────────────────────
  // Box 1 income tax (includes national insurance premiums) less tax credits.
  // OECD 2023: 100% AW (~€40k) = 26.6%, 167% AW (~€67k) = 33.8%
  nl: {
    brackets: [
      { upTo:  30_000, rate: 0.20 },
      { upTo:  60_000, rate: 0.27 },
      { upTo:  90_000, rate: 0.35 },
      { upTo: Infinity, rate: 0.42 },
    ],
    note: "Inkomstenbelasting Box 1 + volksverzekeringen (Netherlands)",
  },

  // ── Ireland ──────────────────────────────────────────────────────────────────
  // Income tax (20%/40%) + USC (0.5–8%) + PRSI (4%).
  // OECD 2023: 100% AW (~€46k) = 27.4%, 167% AW (~€77k) = 35.0%
  ie: {
    brackets: [
      { upTo:  20_000, rate: 0.17 },
      { upTo:  40_000, rate: 0.26 },
      { upTo:  80_000, rate: 0.38 },
      { upTo: Infinity, rate: 0.46 },
    ],
    note: "Income tax + USC + PRSI (Ireland)",
  },

  // ── Sweden ───────────────────────────────────────────────────────────────────
  // Municipal income tax (~32%) + national income tax (20% above SEK ~598k)
  // + employee social contribution ~7%.
  // OECD 2023: 100% AW (~SEK 465k) = 24.8%, 167% AW (~SEK 777k) = 29.4%
  // Skatteverket salary calculator cross-check.
  se: {
    brackets: [
      { upTo:  200_000, rate: 0.20 },
      { upTo:  400_000, rate: 0.24 },
      { upTo:  600_000, rate: 0.28 },
      { upTo:  900_000, rate: 0.33 }, // national tax (20%) applies above ~SEK 598k
      { upTo: Infinity, rate: 0.36 },
    ],
    note: "Kommunalskatt + statlig inkomstskatt + arbetstagares socialavgifter (Sweden)",
  },

  // ── Australia ────────────────────────────────────────────────────────────────
  // Income tax + Medicare levy (2%). No employee SS — superannuation is employer-side.
  // OECD 2023: 100% AW (~AUD $65k) = 22.5%, 167% AW (~AUD $109k) = 28.5%
  au: {
    brackets: [
      { upTo:  45_000, rate: 0.16 },
      { upTo:  80_000, rate: 0.25 },
      { upTo: 120_000, rate: 0.31 },
      { upTo: Infinity, rate: 0.37 },
    ],
    note: "Income tax + Medicare levy (Australia — super excluded, employer-funded)",
  },

  // ── New Zealand ──────────────────────────────────────────────────────────────
  // PAYE (10.5%–39%) + ACC earner levy (~1.6% up to $139k cap).
  // No mandatory employee social contributions (KiwiSaver is voluntary).
  // IRD tax calculator cross-check.
  nz: {
    brackets: [
      { upTo:  40_000, rate: 0.15 },
      { upTo:  70_000, rate: 0.21 },
      { upTo: 100_000, rate: 0.25 },
      { upTo: 150_000, rate: 0.28 },
      { upTo: Infinity, rate: 0.33 },
    ],
    note: "PAYE + ACC earner levy (New Zealand)",
  },

  // ── Canada ───────────────────────────────────────────────────────────────────
  // Federal + provincial (Ontario est.) + CPP/EI.
  // OECD 2023: 100% AW (~CAD $56k) = 22.0%, 167% AW (~CAD $94k) = 29.0%
  ca: {
    brackets: [
      { upTo:  50_000, rate: 0.23 },
      { upTo: 100_000, rate: 0.31 },
      { upTo: 150_000, rate: 0.38 },
      { upTo: Infinity, rate: 0.43 },
    ],
    note: "Federal + provincial income tax + CPP/EI (Canada, Ontario est.)",
  },

  // ── United States ────────────────────────────────────────────────────────────
  // Federal income tax + FICA (SS 6.2% capped ~$168k + Medicare 1.45%)
  // + national average state income tax (~4.5% effective).
  // OECD 2023: 100% AW (~$54k) = 24.0% (federal+FICA only; state adds ~3–5pp)
  us: {
    brackets: [
      { upTo:  50_000, rate: 0.22 },
      { upTo: 100_000, rate: 0.29 },
      { upTo: 200_000, rate: 0.35 },
      { upTo: Infinity, rate: 0.40 },
    ],
    note: "Federal income tax + FICA + avg state income tax (United States)",
  },
};

export interface TaxEstimate {
  grossMonthly: number;
  netMonthly: number;
  monthlyDeduction: number;
  effectiveRate: number; // 0–1
  note: string;
}

/**
 * Returns estimated monthly take-home after all deductions.
 * Returns null if no profile exists for the given country slug.
 */
export function estimateTax(
  grossAnnual: number,
  countrySlug: string,
): TaxEstimate | null {
  const profile = PROFILES[countrySlug];
  if (!profile) return null;

  const bracket = profile.brackets.find((b) => grossAnnual <= b.upTo)
    ?? profile.brackets[profile.brackets.length - 1];

  const { rate } = bracket;
  const grossMonthly    = grossAnnual / 12;
  const netMonthly      = (grossAnnual * (1 - rate)) / 12;
  const monthlyDeduction = grossMonthly - netMonthly;

  return {
    grossMonthly:     Math.round(grossMonthly),
    netMonthly:       Math.round(netMonthly),
    monthlyDeduction: Math.round(monthlyDeduction),
    effectiveRate:    rate,
    note:             profile.note,
  };
}
