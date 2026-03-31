import { getBenchmarkRate, getCountry } from "./countries";

export type CostTier = "moderate" | "high" | "very-high";

export interface CityData {
  slug:                string;
  name:                string;
  countrySlug:         string;
  costTier:            CostTier;
  medianRent:          number;   // monthly, local currency — pre-fills calculator
  typicalOther:        number;   // typical non-rent monthly expenses
  defaultIncomeBand:   string;   // representative income band for scenarios
  rentContext:         string;   // one factual sentence about the rental market
  savingsContext:      string;   // one factual sentence about savings in this city
  nearbySlug:          string[]; // 2–3 related city slugs for internal linking
}

// ─── City dataset ─────────────────────────────────────────────────────────────
// 50 cities across 11 countries. medianRent in local currency.


export const CITIES: CityData[] = [

  // ── United States ───────────────────────────────────────────────────────────
  {
    slug: "new-york", name: "New York", countrySlug: "us", costTier: "very-high",
    medianRent: 3500, typicalOther: 2500,
    defaultIncomeBand: "band-6",
    rentContext: "Manhattan median rent exceeds $3,500/month; outer boroughs offer lower but still high costs.",
    savingsContext: "New Yorkers at mid-income levels face the country's most compressed income-to-cost ratio outside the tech hubs.",
    nearbySlug: ["boston", "chicago", "san-francisco"],
  },
  {
    slug: "san-francisco", name: "San Francisco", countrySlug: "us", costTier: "very-high",
    medianRent: 3200, typicalOther: 2200,
    defaultIncomeBand: "band-5",
    rentContext: "San Francisco median 1-bed rent was $3,200 in 2023, down from pandemic peaks but still near all-time highs.",
    savingsContext: "Bay Area workers face a disproportionate cost burden; even high earners report difficulty building savings.",
    nearbySlug: ["los-angeles", "seattle", "new-york"],
  },
  {
    slug: "los-angeles", name: "Los Angeles", countrySlug: "us", costTier: "very-high",
    medianRent: 2400, typicalOther: 2000,
    defaultIncomeBand: "band-5",
    rentContext: "LA median rent sits around $2,400/month; car ownership adds $800–1,200/month in transport costs for most.",
    savingsContext: "LA's combined housing and transport burden is among the highest in the US relative to median income.",
    nearbySlug: ["san-francisco", "miami", "chicago"],
  },
  {
    slug: "chicago", name: "Chicago", countrySlug: "us", costTier: "high",
    medianRent: 1800, typicalOther: 1800,
    defaultIncomeBand: "band-4",
    rentContext: "Chicago median rent is $1,800/month — significantly lower than coastal peers despite being a major financial hub.",
    savingsContext: "Chicago's relatively affordable housing means mid-income earners can exceed national savings benchmarks.",
    nearbySlug: ["new-york", "denver", "atlanta"],
  },
  {
    slug: "austin", name: "Austin", countrySlug: "us", costTier: "high",
    medianRent: 1900, typicalOther: 1800,
    defaultIncomeBand: "band-4",
    rentContext: "Austin rents rose over 30% between 2020 and 2023, erasing the cost advantage that drew migrants from coastal cities.",
    savingsContext: "Austin income levels grew with tech migration, but so did costs — the affordability advantage has largely been arbitraged away.",
    nearbySlug: ["denver", "chicago", "atlanta"],
  },
  {
    slug: "seattle", name: "Seattle", countrySlug: "us", costTier: "very-high",
    medianRent: 2200, typicalOther: 2000,
    defaultIncomeBand: "band-5",
    rentContext: "Seattle median rent hit $2,200 in 2023; proximity to major tech employers drives sustained housing demand.",
    savingsContext: "Seattle workers benefit from Washington state's lack of income tax, improving effective savings rates vs. gross income benchmarks.",
    nearbySlug: ["san-francisco", "los-angeles", "denver"],
  },
  {
    slug: "miami", name: "Miami", countrySlug: "us", costTier: "high",
    medianRent: 2200, typicalOther: 1800,
    defaultIncomeBand: "band-4",
    rentContext: "Miami median rent exceeded $2,200 in 2023 following strong in-migration, making it one of the most expensive non-coastal US markets.",
    savingsContext: "Miami's lack of state income tax helps, but high housing and insurance costs keep savings rates below national benchmarks.",
    nearbySlug: ["new-york", "los-angeles", "atlanta"],
  },
  {
    slug: "boston", name: "Boston", countrySlug: "us", costTier: "very-high",
    medianRent: 2800, typicalOther: 2000,
    defaultIncomeBand: "band-5",
    rentContext: "Boston median rent reached $2,800/month in 2023, driven by constrained supply and high student and professional demand.",
    savingsContext: "Boston's high income concentration masks wide inequality; mid-income earners face significant cost pressure.",
    nearbySlug: ["new-york", "chicago", "seattle"],
  },
  {
    slug: "denver", name: "Denver", countrySlug: "us", costTier: "high",
    medianRent: 1800, typicalOther: 1750,
    defaultIncomeBand: "band-3",
    rentContext: "Denver median rent rose to $1,800/month post-pandemic, ending its reputation as an affordable western city.",
    savingsContext: "Denver earners at mid-income levels are now in line with national benchmarks rather than ahead, as in prior years.",
    nearbySlug: ["austin", "chicago", "seattle"],
  },
  {
    slug: "atlanta", name: "Atlanta", countrySlug: "us", costTier: "moderate",
    medianRent: 1500, typicalOther: 1600,
    defaultIncomeBand: "band-3",
    rentContext: "Atlanta median rent is around $1,500/month, offering one of the better affordability ratios among major US metros.",
    savingsContext: "Atlanta's lower housing costs relative to income levels mean mid-income earners often save above the national benchmark.",
    nearbySlug: ["miami", "chicago", "denver"],
  },

  // ── United Kingdom ──────────────────────────────────────────────────────────
  {
    slug: "london", name: "London", countrySlug: "gb", costTier: "very-high",
    medianRent: 2000, typicalOther: 1700,
    defaultIncomeBand: "band-4",
    rentContext: "London median private rent reached £2,000/month in 2023, the fastest-rising major city in the UK.",
    savingsContext: "London renters spend a higher share of income on housing than any other UK city, directly compressing savings rates.",
    nearbySlug: ["manchester", "bristol", "dublin"],
  },
  {
    slug: "manchester", name: "Manchester", countrySlug: "gb", costTier: "moderate",
    medianRent: 900, typicalOther: 1100,
    defaultIncomeBand: "band-3",
    rentContext: "Manchester rents average £900–1,100/month — significantly below London but rising faster than local wage growth.",
    savingsContext: "Manchester offers one of the UK's better income-to-rent ratios, putting mid-income earners in stronger saving positions.",
    nearbySlug: ["leeds", "birmingham", "london"],
  },
  {
    slug: "birmingham", name: "Birmingham", countrySlug: "gb", costTier: "moderate",
    medianRent: 850, typicalOther: 1000,
    defaultIncomeBand: "band-2",
    rentContext: "Birmingham median rent is around £850/month, one of the lowest among UK major cities.",
    savingsContext: "Birmingham's low housing costs allow mid-income earners to save above the UK benchmark for their income level.",
    nearbySlug: ["manchester", "leeds", "london"],
  },
  {
    slug: "edinburgh", name: "Edinburgh", countrySlug: "gb", costTier: "high",
    medianRent: 1300, typicalOther: 1200,
    defaultIncomeBand: "band-3",
    rentContext: "Edinburgh rents average £1,300/month, driven by constrained supply and strong professional and tourist demand.",
    savingsContext: "Edinburgh earners at mid-income levels face a tighter cost ratio than other Scottish cities due to housing scarcity.",
    nearbySlug: ["manchester", "london", "birmingham"],
  },
  {
    slug: "bristol", name: "Bristol", countrySlug: "gb", costTier: "high",
    medianRent: 1400, typicalOther: 1100,
    defaultIncomeBand: "band-3",
    rentContext: "Bristol rents average £1,400/month, making it the most expensive major city outside London.",
    savingsContext: "Bristol's high costs for a non-London salary create a specific savings squeeze for mid-career earners.",
    nearbySlug: ["london", "manchester", "edinburgh"],
  },
  {
    slug: "leeds", name: "Leeds", countrySlug: "gb", costTier: "moderate",
    medianRent: 900, typicalOther: 1000,
    defaultIncomeBand: "band-2",
    rentContext: "Leeds median rent is £900/month, offering strong affordability relative to income for mid-career professionals.",
    savingsContext: "Leeds consistently ranks among the UK's best cities for income-to-expense ratios at mid-income levels.",
    nearbySlug: ["manchester", "birmingham", "edinburgh"],
  },

  // ── Germany ─────────────────────────────────────────────────────────────────
  {
    slug: "berlin", name: "Berlin", countrySlug: "de", costTier: "moderate",
    medianRent: 1050, typicalOther: 900,
    defaultIncomeBand: "band-3",
    rentContext: "Berlin average rent is €1,050/month — low by European capital standards, though rising ~10% annually.",
    savingsContext: "Berlin's low cost base means earners at mid-income levels can comfortably exceed Germany's already-high savings benchmarks.",
    nearbySlug: ["hamburg", "amsterdam", "stockholm"],
  },
  {
    slug: "munich", name: "Munich", countrySlug: "de", costTier: "very-high",
    medianRent: 1900, typicalOther: 1200,
    defaultIncomeBand: "band-4",
    rentContext: "Munich is Germany's most expensive city, with average rents of €1,900/month.",
    savingsContext: "Munich earners typically need band 4–5 income levels to achieve Germany's benchmark savings rate given housing costs.",
    nearbySlug: ["frankfurt", "berlin", "zurich"],
  },
  {
    slug: "hamburg", name: "Hamburg", countrySlug: "de", costTier: "high",
    medianRent: 1400, typicalOther: 1000,
    defaultIncomeBand: "band-4",
    rentContext: "Hamburg median rent is €1,400/month, the second-highest in Germany after Munich.",
    savingsContext: "Hamburg's higher costs relative to the German average mean mid-income earners face a moderate savings squeeze.",
    nearbySlug: ["berlin", "frankfurt", "amsterdam"],
  },
  {
    slug: "frankfurt", name: "Frankfurt", countrySlug: "de", costTier: "high",
    medianRent: 1600, typicalOther: 1100,
    defaultIncomeBand: "band-4",
    rentContext: "Frankfurt rents average €1,600/month, driven by its status as Germany's financial centre.",
    savingsContext: "Frankfurt's finance-heavy workforce skews income higher, but housing costs also significantly exceed the German average.",
    nearbySlug: ["munich", "berlin", "amsterdam"],
  },

  // ── France ──────────────────────────────────────────────────────────────────
  {
    slug: "paris", name: "Paris", countrySlug: "fr", costTier: "very-high",
    medianRent: 1400, typicalOther: 1200,
    defaultIncomeBand: "band-4",
    rentContext: "Paris median rent is €1,400/month, disproportionately high relative to Paris-wide incomes.",
    savingsContext: "Parisian renters face the country's worst income-to-rent ratio; mid-income earners often fall below France's 17% savings benchmark.",
    nearbySlug: ["lyon", "london", "amsterdam"],
  },
  {
    slug: "lyon", name: "Lyon", countrySlug: "fr", costTier: "high",
    medianRent: 900, typicalOther: 1000,
    defaultIncomeBand: "band-3",
    rentContext: "Lyon rents average €900/month, significantly more affordable than Paris for comparable professional salaries.",
    savingsContext: "Lyon offers one of France's best income-to-cost ratios, with mid-income earners typically meeting savings benchmarks.",
    nearbySlug: ["paris", "bordeaux", "barcelona"],
  },
  {
    slug: "bordeaux", name: "Bordeaux", countrySlug: "fr", costTier: "moderate",
    medianRent: 850, typicalOther: 900,
    defaultIncomeBand: "band-3",
    rentContext: "Bordeaux median rent is €850/month, below both Paris and Lyon for a comparable lifestyle.",
    savingsContext: "Bordeaux professionals at mid-income levels can typically exceed France's national savings benchmark.",
    nearbySlug: ["lyon", "paris", "madrid"],
  },

  // ── Australia ───────────────────────────────────────────────────────────────
  {
    slug: "sydney", name: "Sydney", countrySlug: "au", costTier: "very-high",
    medianRent: 2800, typicalOther: 2400,
    defaultIncomeBand: "band-4",
    rentContext: "Sydney median rent exceeded A$2,800/month in 2023, the highest in Australia by a wide margin.",
    savingsContext: "Sydney's housing crisis means even high-income earners can struggle to save above the national benchmark.",
    nearbySlug: ["melbourne", "brisbane", "auckland"],
  },
  {
    slug: "melbourne", name: "Melbourne", countrySlug: "au", costTier: "high",
    medianRent: 2000, typicalOther: 2000,
    defaultIncomeBand: "band-3",
    rentContext: "Melbourne median rent is A$2,000/month, significantly below Sydney but rising rapidly post-pandemic.",
    savingsContext: "Melbourne earners at mid-income levels are typically close to the national savings benchmark despite rising costs.",
    nearbySlug: ["sydney", "brisbane", "auckland"],
  },
  {
    slug: "brisbane", name: "Brisbane", countrySlug: "au", costTier: "high",
    medianRent: 2200, typicalOther: 1900,
    defaultIncomeBand: "band-3",
    rentContext: "Brisbane rents reached A$2,200/month following strong interstate migration from Sydney and Melbourne.",
    savingsContext: "Brisbane's rapid rent growth has narrowed the affordability advantage it held over Sydney for much of the past decade.",
    nearbySlug: ["sydney", "melbourne", "perth"],
  },
  {
    slug: "perth", name: "Perth", countrySlug: "au", costTier: "moderate",
    medianRent: 1800, typicalOther: 1700,
    defaultIncomeBand: "band-3",
    rentContext: "Perth rents average A$1,800/month, driven by a strong resources sector and low housing supply.",
    savingsContext: "Perth earners benefit from high resources-sector wages, often saving above Australia's mid-income benchmark.",
    nearbySlug: ["brisbane", "melbourne", "auckland"],
  },

  // ── Canada ──────────────────────────────────────────────────────────────────
  {
    slug: "toronto", name: "Toronto", countrySlug: "ca", costTier: "very-high",
    medianRent: 2400, typicalOther: 1800,
    defaultIncomeBand: "band-4",
    rentContext: "Toronto median rent exceeded C$2,400/month in 2023, the highest in Canada.",
    savingsContext: "Toronto's housing crisis compresses savings rates at all but the highest income levels.",
    nearbySlug: ["vancouver", "montreal", "new-york"],
  },
  {
    slug: "vancouver", name: "Vancouver", countrySlug: "ca", costTier: "very-high",
    medianRent: 2600, typicalOther: 1900,
    defaultIncomeBand: "band-4",
    rentContext: "Vancouver median rent is C$2,600/month, the highest in Canada by some measures.",
    savingsContext: "Vancouver earners consistently report difficulty saving even at high income levels due to combined housing and living costs.",
    nearbySlug: ["toronto", "seattle", "calgary"],
  },
  {
    slug: "montreal", name: "Montreal", countrySlug: "ca", costTier: "high",
    medianRent: 1600, typicalOther: 1400,
    defaultIncomeBand: "band-3",
    rentContext: "Montreal median rent is C$1,600/month, making it significantly more affordable than Toronto or Vancouver.",
    savingsContext: "Montreal offers Canada's best major-city affordability ratio, allowing mid-income earners to save well above benchmark.",
    nearbySlug: ["toronto", "calgary", "boston"],
  },
  {
    slug: "calgary", name: "Calgary", countrySlug: "ca", costTier: "high",
    medianRent: 1700, typicalOther: 1500,
    defaultIncomeBand: "band-3",
    rentContext: "Calgary rents average C$1,700/month, with strong demand driven by energy-sector employment.",
    savingsContext: "Calgary's combination of high energy-sector incomes and moderate costs creates strong conditions for mid-income saving.",
    nearbySlug: ["vancouver", "montreal", "toronto"],
  },

  // ── Ireland ─────────────────────────────────────────────────────────────────
  {
    slug: "dublin", name: "Dublin", countrySlug: "ie", costTier: "very-high",
    medianRent: 2100, typicalOther: 1550,
    defaultIncomeBand: "band-3",
    rentContext: "Dublin median rent exceeded €2,000/month in 2023, the second-highest monthly rent in the EU.",
    savingsContext: "Dublin renters face the country's most compressed income-to-rent ratio; mid-income earners typically fall below benchmark.",
    nearbySlug: ["cork", "london", "amsterdam"],
  },
  {
    slug: "cork", name: "Cork", countrySlug: "ie", costTier: "high",
    medianRent: 1500, typicalOther: 1200,
    defaultIncomeBand: "band-3",
    rentContext: "Cork median rent is approximately €1,500/month, significantly lower than Dublin but still high by European standards.",
    savingsContext: "Cork earners face similar structural pressures to Dublin but with marginally better income-to-cost ratios.",
    nearbySlug: ["dublin", "london", "liverpool"],
  },

  // ── Netherlands ─────────────────────────────────────────────────────────────
  {
    slug: "amsterdam", name: "Amsterdam", countrySlug: "nl", costTier: "very-high",
    medianRent: 1800, typicalOther: 1300,
    defaultIncomeBand: "band-4",
    rentContext: "Amsterdam median private rent is €1,800/month; the protected social housing sector insulates long-term residents.",
    savingsContext: "New entrants to Amsterdam face private market rents that significantly compress savings potential at mid-income levels.",
    nearbySlug: ["rotterdam", "brussels", "berlin"],
  },
  {
    slug: "rotterdam", name: "Rotterdam", countrySlug: "nl", costTier: "high",
    medianRent: 1200, typicalOther: 1100,
    defaultIncomeBand: "band-3",
    rentContext: "Rotterdam rents average €1,200/month, offering materially better affordability than Amsterdam.",
    savingsContext: "Rotterdam earners can typically meet the Dutch savings benchmark more easily than their Amsterdam counterparts.",
    nearbySlug: ["amsterdam", "brussels", "berlin"],
  },

  // ── Spain ───────────────────────────────────────────────────────────────────
  {
    slug: "madrid", name: "Madrid", countrySlug: "es", costTier: "high",
    medianRent: 1200, typicalOther: 1100,
    defaultIncomeBand: "band-3",
    rentContext: "Madrid median rent reached €1,200/month in 2023, among Spain's highest but well below Western European peers.",
    savingsContext: "Madrid's mid-income earners face a moderate housing burden; savings benchmarks are achievable at typical professional salaries.",
    nearbySlug: ["barcelona", "seville", "paris"],
  },
  {
    slug: "barcelona", name: "Barcelona", countrySlug: "es", costTier: "high",
    medianRent: 1300, typicalOther: 1100,
    defaultIncomeBand: "band-3",
    rentContext: "Barcelona median rent is €1,300/month — higher than Madrid and subject to persistent supply constraints.",
    savingsContext: "Barcelona's tourism-driven demand and housing constraints make saving at benchmark rates harder than in other Spanish cities.",
    nearbySlug: ["madrid", "lyon", "amsterdam"],
  },
  {
    slug: "seville", name: "Seville", countrySlug: "es", costTier: "moderate",
    medianRent: 750, typicalOther: 900,
    defaultIncomeBand: "band-2",
    rentContext: "Seville rents average €750/month, among the lowest of Spain's major cities.",
    savingsContext: "Seville's low housing costs allow mid-income earners to significantly exceed Spain's savings benchmark.",
    nearbySlug: ["madrid", "barcelona", "bordeaux"],
  },

  // ── Sweden ──────────────────────────────────────────────────────────────────
  {
    slug: "stockholm", name: "Stockholm", countrySlug: "se", costTier: "high",
    medianRent: 9500, typicalOther: 10500,
    defaultIncomeBand: "band-4",
    rentContext: "Stockholm median private rent is 9,500 kr/month; the rent-controlled sector has multi-year waiting lists.",
    savingsContext: "Stockholm earners benefit from Sweden's strong savings culture and pension system, though private rental costs are rising.",
    nearbySlug: ["gothenburg", "helsinki", "oslo"],
  },
  {
    slug: "gothenburg", name: "Gothenburg", countrySlug: "se", costTier: "moderate",
    medianRent: 7500, typicalOther: 9000,
    defaultIncomeBand: "band-3",
    rentContext: "Gothenburg private rents average 7,500 kr/month, lower than Stockholm with a similar income profile.",
    savingsContext: "Gothenburg offers a better cost ratio than Stockholm for comparable professional roles, often allowing above-benchmark savings.",
    nearbySlug: ["stockholm", "oslo", "berlin"],
  },

  // ── New Zealand ─────────────────────────────────────────────────────────────
  {
    slug: "auckland", name: "Auckland", countrySlug: "nz", costTier: "very-high",
    medianRent: 2400, typicalOther: 2200,
    defaultIncomeBand: "band-3",
    rentContext: "Auckland median rent reached NZ$2,400/month in 2023, reflecting a severe long-term housing supply deficit.",
    savingsContext: "Auckland's housing crisis means mid-income earners consistently struggle to meet New Zealand's savings benchmarks.",
    nearbySlug: ["wellington", "sydney", "brisbane"],
  },
  {
    slug: "wellington", name: "Wellington", countrySlug: "nz", costTier: "high",
    medianRent: 1900, typicalOther: 1900,
    defaultIncomeBand: "band-3",
    rentContext: "Wellington median rent is NZ$1,900/month, lower than Auckland but high relative to the public-sector-heavy income profile.",
    savingsContext: "Wellington earners face moderate savings pressure; the public-sector income base makes benchmark achievement challenging.",
    nearbySlug: ["auckland", "sydney", "brisbane"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCity(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getCityBenchmarkRange(city: CityData): string {
  const country = getCountry(city.countrySlug);
  if (!country) return "—";
  const lo = Math.round(getBenchmarkRate(country, "band-2") * 100);
  const hi = Math.round(getBenchmarkRate(country, "band-4") * 100);
  return `${lo}–${hi}%`;
}

export const COST_TIER_LABEL: Record<CostTier, string> = {
  "moderate":  "moderate cost",
  "high":      "high cost",
  "very-high": "very high cost",
};
