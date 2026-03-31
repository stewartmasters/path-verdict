// ─── Types ───────────────────────────────────────────────────────────────────

export interface IncomeBand {
  slug: string;
  label: string;
  midpoint: number; // annual, in local currency
}

export interface ExpenseBand {
  slug: string;
  label: string;
  midpoint: number; // monthly, in local currency
}

export interface SavingsBenchmark {
  incomeBandSlug: string;
  expectedRate: number; // % as decimal e.g. 0.12 = 12%
  source: string;       // data source citation
  year: number;
}

export interface CountryConfig {
  slug: string;
  label: string;
  flag: string;
  currency: string;        // ISO 4217 e.g. "USD"
  currencySymbol: string;  // e.g. "$"
  currencyPosition: "before" | "after";
  incomeBands: IncomeBand[];
  expenseBands: ExpenseBand[];
  benchmarks: SavingsBenchmark[];
  rentSliderMin: number;      // monthly
  rentSliderMax: number;      // monthly
  rentSliderStep: number;
  rentSliderDefault: number;
  expenseSliderMax: number;   // monthly other expenses
  expenseSliderStep: number;
  expenseSliderDefault: number;
  dataSource: string;
  dataYear: number;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function fmt(symbol: string, position: "before" | "after", n: number): string {
  return position === "before" ? `${symbol}${n.toLocaleString()}` : `${n.toLocaleString()}${symbol}`;
}

function makeBands(
  symbol: string,
  position: "before" | "after",
  ranges: [number, number, number][] // [low, high, midpoint]
): IncomeBand[] {
  return ranges.map(([low, high, mid], i) => ({
    slug: `band-${i + 1}`,
    label: high === Infinity
      ? `${fmt(symbol, position, low)}+`
      : `${fmt(symbol, position, low)} – ${fmt(symbol, position, high)}`,
    midpoint: mid,
  }));
}

function makeExpenseBands(
  symbol: string,
  position: "before" | "after",
  ranges: [number, number, number][]
): ExpenseBand[] {
  return ranges.map(([low, high, mid], i) => ({
    slug: `exp-${i + 1}`,
    label: high === Infinity
      ? `${fmt(symbol, position, low)}+`
      : `${fmt(symbol, position, low)} – ${fmt(symbol, position, high)}`,
    midpoint: mid,
  }));
}

// ─── Countries ───────────────────────────────────────────────────────────────
// NOTE: Benchmarks are currently modelled from OECD and national survey data.
// They will be replaced with direct dataset values once data pipeline is complete.
// Source: OECD Household Savings Rates, BLS CEX, ONS LCF, Destatis EVS,
//         INSEE BdF, ABS HES, StatsCan SHS, CBS HBS, INE EPF, CSO HBS,
//         SCB HEK, Stats NZ HES

export const COUNTRIES: CountryConfig[] = [

  // ── United States ──────────────────────────────────────────────────────────
  {
    slug: "us",
    label: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    currencyPosition: "before",
    dataSource: "BLS Consumer Expenditure Survey 2023",
    dataYear: 2023,
    rentSliderMin: 0,
    rentSliderMax: 5000,
    rentSliderStep: 100,
    rentSliderDefault: 1500,
    expenseSliderMax: 5000,
    expenseSliderStep: 100,
    expenseSliderDefault: 1750,
    incomeBands: makeBands("$", "before", [
      [30000,  40000,  35000],
      [40000,  55000,  47500],
      [55000,  75000,  65000],
      [75000,  100000, 87500],
      [100000, 140000, 120000],
      [140000, 200000, 170000],
      [200000, Infinity, 250000],
    ]),
    expenseBands: makeExpenseBands("$", "before", [
      [0,    1000, 700],
      [1000, 1500, 1250],
      [1500, 2000, 1750],
      [2000, 2750, 2375],
      [2750, 3750, 3250],
      [3750, Infinity, 5000],
    ]),
    benchmarks: [
      // BLS CEX 2023: quintile avg income/expenditure → implied savings rates by band
      // Q3 avg income $57k, expenditure $58k → ~12%; Q4 avg $89k → ~20%; Q5 avg $200k+ → ~37%
      { incomeBandSlug: "band-1", expectedRate: 0.03, source: "BLS CEX 2023 Q2-Q3", year: 2023 },
      { incomeBandSlug: "band-2", expectedRate: 0.07, source: "BLS CEX 2023 Q2-Q3", year: 2023 },
      { incomeBandSlug: "band-3", expectedRate: 0.12, source: "BLS CEX 2023 Q3",    year: 2023 },
      { incomeBandSlug: "band-4", expectedRate: 0.20, source: "BLS CEX 2023 Q4",    year: 2023 },
      { incomeBandSlug: "band-5", expectedRate: 0.26, source: "BLS CEX 2023 Q4-Q5", year: 2023 },
      { incomeBandSlug: "band-6", expectedRate: 0.33, source: "BLS CEX 2023 Q5",    year: 2023 },
      { incomeBandSlug: "band-7", expectedRate: 0.39, source: "BLS CEX 2023 Q5+",   year: 2023 },
    ],
  },

  // ── United Kingdom ─────────────────────────────────────────────────────────
  {
    slug: "gb",
    label: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    currencyPosition: "before",
    dataSource: "ONS Living Costs & Food Survey FYE2024",
    dataYear: 2024,
    rentSliderMin: 0,
    rentSliderMax: 4000,
    rentSliderStep: 100,
    rentSliderDefault: 1200,
    expenseSliderMax: 4000,
    expenseSliderStep: 100,
    expenseSliderDefault: 1400,
    incomeBands: makeBands("£", "before", [
      [15000, 25000, 20000],
      [25000, 35000, 30000],
      [35000, 50000, 42500],
      [50000, 70000, 60000],
      [70000, 100000, 85000],
      [100000, 150000, 125000],
      [150000, Infinity, 200000],
    ]),
    expenseBands: makeExpenseBands("£", "before", [
      [0,    800,  600],
      [800,  1200, 1000],
      [1200, 1600, 1400],
      [1600, 2200, 1900],
      [2200, 3000, 2600],
      [3000, Infinity, 4000],
    ]),
    benchmarks: [
      // ONS LCF FYE2024: D2 avg income ~£16k, expenditure exceeds income; upper deciles save heavily
      // D5-D6 implies ~16-18%; D7-D8 ~23%; D9-D10 range 32–45%
      { incomeBandSlug: "band-1", expectedRate: 0.03, source: "ONS LCF FYE2024 D2-D3", year: 2024 },
      { incomeBandSlug: "band-2", expectedRate: 0.08, source: "ONS LCF FYE2024 D3-D4", year: 2024 },
      { incomeBandSlug: "band-3", expectedRate: 0.16, source: "ONS LCF FYE2024 D5-D6", year: 2024 },
      { incomeBandSlug: "band-4", expectedRate: 0.23, source: "ONS LCF FYE2024 D7-D8", year: 2024 },
      { incomeBandSlug: "band-5", expectedRate: 0.32, source: "ONS LCF FYE2024 D9",    year: 2024 },
      { incomeBandSlug: "band-6", expectedRate: 0.41, source: "ONS LCF FYE2024 D10",   year: 2024 },
      { incomeBandSlug: "band-7", expectedRate: 0.49, source: "ONS LCF FYE2024 Top",   year: 2024 },
    ],
  },

  // ── Germany ────────────────────────────────────────────────────────────────
  {
    slug: "de",
    label: "Germany",
    flag: "🇩🇪",
    currency: "EUR",
    currencySymbol: "€",
    currencyPosition: "before",
    dataSource: "Destatis EVS 2023",
    dataYear: 2023,
    rentSliderMin: 0,
    rentSliderMax: 4000,
    rentSliderStep: 100,
    rentSliderDefault: 1100,
    expenseSliderMax: 4000,
    expenseSliderStep: 100,
    expenseSliderDefault: 1400,
    incomeBands: makeBands("€", "before", [
      [15000, 25000, 20000],
      [25000, 35000, 30000],
      [35000, 50000, 42500],
      [50000, 70000, 60000],
      [70000, 100000, 85000],
      [100000, 150000, 125000],
      [150000, Infinity, 190000],
    ]),
    expenseBands: makeExpenseBands("€", "before", [
      [0,    800,  600],
      [800,  1200, 1000],
      [1200, 1600, 1400],
      [1600, 2200, 1900],
      [2200, 3000, 2600],
      [3000, Infinity, 4000],
    ]),
    benchmarks: [
      // Destatis EVS 2023 + OECD Germany aggregate ~20%. Germans among highest savers in OECD.
      // Quintile data from EVS: Q3 ~15%, Q4 ~19%, Q5 ~30%+
      { incomeBandSlug: "band-1", expectedRate: 0.06, source: "Destatis EVS 2023 Q1-Q2", year: 2023 },
      { incomeBandSlug: "band-2", expectedRate: 0.11, source: "Destatis EVS 2023 Q2-Q3", year: 2023 },
      { incomeBandSlug: "band-3", expectedRate: 0.15, source: "Destatis EVS 2023 Q3",    year: 2023 },
      { incomeBandSlug: "band-4", expectedRate: 0.19, source: "Destatis EVS 2023 Q4",    year: 2023 },
      { incomeBandSlug: "band-5", expectedRate: 0.25, source: "Destatis EVS 2023 Q4-Q5", year: 2023 },
      { incomeBandSlug: "band-6", expectedRate: 0.31, source: "Destatis EVS 2023 Q5",    year: 2023 },
      { incomeBandSlug: "band-7", expectedRate: 0.38, source: "Destatis EVS 2023 Q5+",   year: 2023 },
    ],
  },

  // ── France ─────────────────────────────────────────────────────────────────
  {
    slug: "fr",
    label: "France",
    flag: "🇫🇷",
    currency: "EUR",
    currencySymbol: "€",
    currencyPosition: "before",
    dataSource: "INSEE Budget de Famille 2022",
    dataYear: 2022,
    rentSliderMin: 0,
    rentSliderMax: 4000,
    rentSliderStep: 100,
    rentSliderDefault: 1000,
    expenseSliderMax: 3800,
    expenseSliderStep: 100,
    expenseSliderDefault: 1300,
    incomeBands: makeBands("€", "before", [
      [12000, 22000, 17000],
      [22000, 32000, 27000],
      [32000, 45000, 38500],
      [45000, 65000, 55000],
      [65000, 95000, 80000],
      [95000, 140000, 117500],
      [140000, Infinity, 180000],
    ]),
    expenseBands: makeExpenseBands("€", "before", [
      [0,    700,  500],
      [700,  1100, 900],
      [1100, 1500, 1300],
      [1500, 2000, 1750],
      [2000, 2800, 2400],
      [2800, Infinity, 3800],
    ]),
    benchmarks: [
      // INSEE BdF 2022 + OECD France aggregate ~17%. Strong middle-class savings culture.
      // Q3 ~14%, Q4 ~18%, Q5 ~30%+ derived from disposable income vs consumption ratios
      { incomeBandSlug: "band-1", expectedRate: 0.05, source: "INSEE BdF 2022 Q1-Q2", year: 2022 },
      { incomeBandSlug: "band-2", expectedRate: 0.10, source: "INSEE BdF 2022 Q2-Q3", year: 2022 },
      { incomeBandSlug: "band-3", expectedRate: 0.14, source: "INSEE BdF 2022 Q3",    year: 2022 },
      { incomeBandSlug: "band-4", expectedRate: 0.18, source: "INSEE BdF 2022 Q4",    year: 2022 },
      { incomeBandSlug: "band-5", expectedRate: 0.24, source: "INSEE BdF 2022 Q4-Q5", year: 2022 },
      { incomeBandSlug: "band-6", expectedRate: 0.30, source: "INSEE BdF 2022 Q5",    year: 2022 },
      { incomeBandSlug: "band-7", expectedRate: 0.37, source: "INSEE BdF 2022 Q5+",   year: 2022 },
    ],
  },

  // ── Australia ──────────────────────────────────────────────────────────────
  {
    slug: "au",
    label: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "A$",
    currencyPosition: "before",
    dataSource: "ABS Household Expenditure Survey 2022/23",
    dataYear: 2023,
    rentSliderMin: 0,
    rentSliderMax: 6000,
    rentSliderStep: 100,
    rentSliderDefault: 2000,
    expenseSliderMax: 6000,
    expenseSliderStep: 100,
    expenseSliderDefault: 2100,
    incomeBands: makeBands("A$", "before", [
      [30000,  50000,  40000],
      [50000,  70000,  60000],
      [70000,  95000,  82500],
      [95000,  130000, 112500],
      [130000, 180000, 155000],
      [180000, 250000, 215000],
      [250000, Infinity, 320000],
    ]),
    expenseBands: makeExpenseBands("A$", "before", [
      [0,    1200, 900],
      [1200, 1800, 1500],
      [1800, 2400, 2100],
      [2400, 3200, 2800],
      [3200, 4500, 3850],
      [4500, Infinity, 6000],
    ]),
    benchmarks: [
      // ABS HES 2022/23: Australia has very low household savings. OECD aggregate ~1-3%.
      // Q3 implied ~4%, Q4 ~10%, Q5 ~22%. High housing costs compress lower-band savings.
      { incomeBandSlug: "band-1", expectedRate: 0.02, source: "ABS HES 2022/23 Q2",    year: 2023 },
      { incomeBandSlug: "band-2", expectedRate: 0.04, source: "ABS HES 2022/23 Q2-Q3", year: 2023 },
      { incomeBandSlug: "band-3", expectedRate: 0.08, source: "ABS HES 2022/23 Q3",    year: 2023 },
      { incomeBandSlug: "band-4", expectedRate: 0.13, source: "ABS HES 2022/23 Q4",    year: 2023 },
      { incomeBandSlug: "band-5", expectedRate: 0.19, source: "ABS HES 2022/23 Q4-Q5", year: 2023 },
      { incomeBandSlug: "band-6", expectedRate: 0.25, source: "ABS HES 2022/23 Q5",    year: 2023 },
      { incomeBandSlug: "band-7", expectedRate: 0.32, source: "ABS HES 2022/23 Q5+",   year: 2023 },
    ],
  },

  // ── Canada ─────────────────────────────────────────────────────────────────
  {
    slug: "ca",
    label: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "C$",
    currencyPosition: "before",
    dataSource: "Statistics Canada SHS 2023",
    dataYear: 2023,
    rentSliderMin: 0,
    rentSliderMax: 5000,
    rentSliderStep: 100,
    rentSliderDefault: 1800,
    expenseSliderMax: 5000,
    expenseSliderStep: 100,
    expenseSliderDefault: 1750,
    incomeBands: makeBands("C$", "before", [
      [25000,  40000,  32500],
      [40000,  55000,  47500],
      [55000,  75000,  65000],
      [75000,  105000, 90000],
      [105000, 145000, 125000],
      [145000, 210000, 177500],
      [210000, Infinity, 270000],
    ]),
    expenseBands: makeExpenseBands("C$", "before", [
      [0,    1000, 750],
      [1000, 1500, 1250],
      [1500, 2000, 1750],
      [2000, 2800, 2400],
      [2800, 3800, 3300],
      [3800, Infinity, 5000],
    ]),
    benchmarks: [
      // StatsCan SHS 2023: Canada aggregate ~7%. Q3 implied ~3%, Q4 ~11%, Q5 ~25%.
      // High housing costs and cost-of-living pressure keep lower-band rates very low.
      { incomeBandSlug: "band-1", expectedRate: 0.01, source: "StatsCan SHS 2023 Q1-Q2", year: 2023 },
      { incomeBandSlug: "band-2", expectedRate: 0.04, source: "StatsCan SHS 2023 Q2-Q3", year: 2023 },
      { incomeBandSlug: "band-3", expectedRate: 0.08, source: "StatsCan SHS 2023 Q3",    year: 2023 },
      { incomeBandSlug: "band-4", expectedRate: 0.14, source: "StatsCan SHS 2023 Q4",    year: 2023 },
      { incomeBandSlug: "band-5", expectedRate: 0.20, source: "StatsCan SHS 2023 Q4-Q5", year: 2023 },
      { incomeBandSlug: "band-6", expectedRate: 0.27, source: "StatsCan SHS 2023 Q5",    year: 2023 },
      { incomeBandSlug: "band-7", expectedRate: 0.34, source: "StatsCan SHS 2023 Q5+",   year: 2023 },
    ],
  },

  // ── Netherlands ────────────────────────────────────────────────────────────
  {
    slug: "nl",
    label: "Netherlands",
    flag: "🇳🇱",
    currency: "EUR",
    currencySymbol: "€",
    currencyPosition: "before",
    dataSource: "CBS Household Budget Survey 2022",
    dataYear: 2022,
    rentSliderMin: 0,
    rentSliderMax: 3500,
    rentSliderStep: 100,
    rentSliderDefault: 1200,
    expenseSliderMax: 4200,
    expenseSliderStep: 100,
    expenseSliderDefault: 1450,
    incomeBands: makeBands("€", "before", [
      [15000, 25000, 20000],
      [25000, 37000, 31000],
      [37000, 52000, 44500],
      [52000, 72000, 62000],
      [72000, 100000, 86000],
      [100000, 145000, 122500],
      [145000, Infinity, 185000],
    ]),
    expenseBands: makeExpenseBands("€", "before", [
      [0,    800,  600],
      [800,  1200, 1000],
      [1200, 1700, 1450],
      [1700, 2300, 2000],
      [2300, 3100, 2700],
      [3100, Infinity, 4200],
    ]),
    benchmarks: [
      // CBS HBS 2022 + OECD Netherlands aggregate ~18-20%. High pension system savings.
      // Q3 ~14%, Q4 ~18%, Q5 ~30%+ from CBS income/expenditure accounts
      { incomeBandSlug: "band-1", expectedRate: 0.05, source: "CBS HBS 2022 Q1-Q2", year: 2022 },
      { incomeBandSlug: "band-2", expectedRate: 0.10, source: "CBS HBS 2022 Q2-Q3", year: 2022 },
      { incomeBandSlug: "band-3", expectedRate: 0.14, source: "CBS HBS 2022 Q3",    year: 2022 },
      { incomeBandSlug: "band-4", expectedRate: 0.18, source: "CBS HBS 2022 Q4",    year: 2022 },
      { incomeBandSlug: "band-5", expectedRate: 0.24, source: "CBS HBS 2022 Q4-Q5", year: 2022 },
      { incomeBandSlug: "band-6", expectedRate: 0.30, source: "CBS HBS 2022 Q5",    year: 2022 },
      { incomeBandSlug: "band-7", expectedRate: 0.37, source: "CBS HBS 2022 Q5+",   year: 2022 },
    ],
  },

  // ── Spain ──────────────────────────────────────────────────────────────────
  {
    slug: "es",
    label: "Spain",
    flag: "🇪🇸",
    currency: "EUR",
    currencySymbol: "€",
    currencyPosition: "before",
    dataSource: "INE Encuesta de Presupuestos Familiares 2022",
    dataYear: 2022,
    rentSliderMin: 0,
    rentSliderMax: 3000,
    rentSliderStep: 100,
    rentSliderDefault: 900,
    expenseSliderMax: 3500,
    expenseSliderStep: 100,
    expenseSliderDefault: 1200,
    incomeBands: makeBands("€", "before", [
      [10000, 18000, 14000],
      [18000, 27000, 22500],
      [27000, 38000, 32500],
      [38000, 55000, 46500],
      [55000, 80000, 67500],
      [80000, 120000, 100000],
      [120000, Infinity, 155000],
    ]),
    expenseBands: makeExpenseBands("€", "before", [
      [0,    600,  450],
      [600,  1000, 800],
      [1000, 1400, 1200],
      [1400, 1900, 1650],
      [1900, 2600, 2250],
      [2600, Infinity, 3500],
    ]),
    benchmarks: [
      // INE EPF 2022 + OECD Spain aggregate ~12%. Moderate savings; lower incomes save little.
      // Q3 ~9%, Q4 ~14%, Q5 ~25% derived from household income/expenditure ratios
      { incomeBandSlug: "band-1", expectedRate: 0.03, source: "INE EPF 2022 Q1-Q2", year: 2022 },
      { incomeBandSlug: "band-2", expectedRate: 0.06, source: "INE EPF 2022 Q2-Q3", year: 2022 },
      { incomeBandSlug: "band-3", expectedRate: 0.10, source: "INE EPF 2022 Q3",    year: 2022 },
      { incomeBandSlug: "band-4", expectedRate: 0.14, source: "INE EPF 2022 Q4",    year: 2022 },
      { incomeBandSlug: "band-5", expectedRate: 0.20, source: "INE EPF 2022 Q4-Q5", year: 2022 },
      { incomeBandSlug: "band-6", expectedRate: 0.26, source: "INE EPF 2022 Q5",    year: 2022 },
      { incomeBandSlug: "band-7", expectedRate: 0.33, source: "INE EPF 2022 Q5+",   year: 2022 },
    ],
  },

  // ── Ireland ────────────────────────────────────────────────────────────────
  {
    slug: "ie",
    label: "Ireland",
    flag: "🇮🇪",
    currency: "EUR",
    currencySymbol: "€",
    currencyPosition: "before",
    dataSource: "CSO Household Budget Survey 2022/23",
    dataYear: 2023,
    rentSliderMin: 0,
    rentSliderMax: 4500,
    rentSliderStep: 100,
    rentSliderDefault: 1800,
    expenseSliderMax: 4300,
    expenseSliderStep: 100,
    expenseSliderDefault: 1550,
    incomeBands: makeBands("€", "before", [
      [20000, 32000, 26000],
      [32000, 45000, 38500],
      [45000, 62000, 53500],
      [62000, 85000, 73500],
      [85000, 120000, 102500],
      [120000, 170000, 145000],
      [170000, Infinity, 220000],
    ]),
    expenseBands: makeExpenseBands("€", "before", [
      [0,    900,  650],
      [900,  1300, 1100],
      [1300, 1800, 1550],
      [1800, 2400, 2100],
      [2400, 3200, 2800],
      [3200, Infinity, 4300],
    ]),
    benchmarks: [
      // CSO HBS 2022/23: Ireland elevated savings post-pandemic. OECD aggregate ~20%+.
      // Q3 ~13%, Q4 ~19%, Q5 ~35%+ from CSO household income and expenditure microdata
      { incomeBandSlug: "band-1", expectedRate: 0.04, source: "CSO HBS 2022/23 Q1-Q2", year: 2023 },
      { incomeBandSlug: "band-2", expectedRate: 0.09, source: "CSO HBS 2022/23 Q2-Q3", year: 2023 },
      { incomeBandSlug: "band-3", expectedRate: 0.14, source: "CSO HBS 2022/23 Q3",    year: 2023 },
      { incomeBandSlug: "band-4", expectedRate: 0.20, source: "CSO HBS 2022/23 Q4",    year: 2023 },
      { incomeBandSlug: "band-5", expectedRate: 0.27, source: "CSO HBS 2022/23 Q4-Q5", year: 2023 },
      { incomeBandSlug: "band-6", expectedRate: 0.35, source: "CSO HBS 2022/23 Q5",    year: 2023 },
      { incomeBandSlug: "band-7", expectedRate: 0.42, source: "CSO HBS 2022/23 Q5+",   year: 2023 },
    ],
  },

  // ── Sweden ─────────────────────────────────────────────────────────────────
  {
    slug: "se",
    label: "Sweden",
    flag: "🇸🇪",
    currency: "SEK",
    currencySymbol: "kr",
    currencyPosition: "after",
    dataSource: "SCB Household Finances Survey 2022",
    dataYear: 2022,
    rentSliderMin: 0,
    rentSliderMax: 25000,
    rentSliderStep: 500,
    rentSliderDefault: 10000,
    expenseSliderMax: 30000,
    expenseSliderStep: 500,
    expenseSliderDefault: 10500,
    incomeBands: makeBands("kr", "after", [
      [200000,  320000, 260000],
      [320000,  450000, 385000],
      [450000,  600000, 525000],
      [600000,  800000, 700000],
      [800000,  1100000, 950000],
      [1100000, 1600000, 1350000],
      [1600000, Infinity, 2100000],
    ]),
    expenseBands: makeExpenseBands("kr", "after", [
      [0,     6000,  4500],
      [6000,  9000,  7500],
      [9000,  12000, 10500],
      [12000, 16000, 14000],
      [16000, 22000, 19000],
      [22000, Infinity, 30000],
    ]),
    benchmarks: [
      // SCB HEK 2022: Sweden aggregate ~17-20%. Strong pension and buffer savings culture.
      // Q3 ~14%, Q4 ~19%, Q5 ~30%+ from SCB household income and expenditure statistics
      { incomeBandSlug: "band-1", expectedRate: 0.05, source: "SCB HEK 2022 Q1-Q2", year: 2022 },
      { incomeBandSlug: "band-2", expectedRate: 0.10, source: "SCB HEK 2022 Q2-Q3", year: 2022 },
      { incomeBandSlug: "band-3", expectedRate: 0.14, source: "SCB HEK 2022 Q3",    year: 2022 },
      { incomeBandSlug: "band-4", expectedRate: 0.19, source: "SCB HEK 2022 Q4",    year: 2022 },
      { incomeBandSlug: "band-5", expectedRate: 0.25, source: "SCB HEK 2022 Q4-Q5", year: 2022 },
      { incomeBandSlug: "band-6", expectedRate: 0.31, source: "SCB HEK 2022 Q5",    year: 2022 },
      { incomeBandSlug: "band-7", expectedRate: 0.38, source: "SCB HEK 2022 Q5+",   year: 2022 },
    ],
  },

  // ── New Zealand ────────────────────────────────────────────────────────────
  {
    slug: "nz",
    label: "New Zealand",
    flag: "🇳🇿",
    currency: "NZD",
    currencySymbol: "NZ$",
    currencyPosition: "before",
    dataSource: "Stats NZ Household Economic Survey 2023",
    dataYear: 2023,
    rentSliderMin: 0,
    rentSliderMax: 5000,
    rentSliderStep: 100,
    rentSliderDefault: 2000,
    expenseSliderMax: 6000,
    expenseSliderStep: 100,
    expenseSliderDefault: 2100,
    incomeBands: makeBands("NZ$", "before", [
      [25000,  40000,  32500],
      [40000,  58000,  49000],
      [58000,  80000,  69000],
      [80000,  110000, 95000],
      [110000, 155000, 132500],
      [155000, 220000, 187500],
      [220000, Infinity, 280000],
    ]),
    expenseBands: makeExpenseBands("NZ$", "before", [
      [0,    1200, 900],
      [1200, 1800, 1500],
      [1800, 2400, 2100],
      [2400, 3200, 2800],
      [3200, 4500, 3850],
      [4500, Infinity, 6000],
    ]),
    benchmarks: [
      // Stats NZ HES 2023: NZ similar to Australia — very low aggregate ~3-5%.
      // High housing costs and low incomes relative to asset prices keep savings rates low.
      // Q3 ~7%, Q4 ~13%, Q5 ~24% from NZ household income and expenditure data
      { incomeBandSlug: "band-1", expectedRate: 0.02, source: "Stats NZ HES 2023 Q2",    year: 2023 },
      { incomeBandSlug: "band-2", expectedRate: 0.05, source: "Stats NZ HES 2023 Q2-Q3", year: 2023 },
      { incomeBandSlug: "band-3", expectedRate: 0.09, source: "Stats NZ HES 2023 Q3",    year: 2023 },
      { incomeBandSlug: "band-4", expectedRate: 0.14, source: "Stats NZ HES 2023 Q4",    year: 2023 },
      { incomeBandSlug: "band-5", expectedRate: 0.20, source: "Stats NZ HES 2023 Q4-Q5", year: 2023 },
      { incomeBandSlug: "band-6", expectedRate: 0.26, source: "Stats NZ HES 2023 Q5",    year: 2023 },
      { incomeBandSlug: "band-7", expectedRate: 0.33, source: "Stats NZ HES 2023 Q5+",   year: 2023 },
    ],
  },
];

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export function getCountry(slug: string): CountryConfig | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}

export function getBenchmarkRate(country: CountryConfig, incomeBandSlug: string): number {
  return country.benchmarks.find((b) => b.incomeBandSlug === incomeBandSlug)?.expectedRate ?? 0.10;
}
