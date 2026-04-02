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
// 83 cities across 11 countries. medianRent in local currency.


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
  {
    slug: "washington-dc", name: "Washington DC", countrySlug: "us", costTier: "very-high",
    medianRent: 2600, typicalOther: 2200,
    defaultIncomeBand: "band-5",
    rentContext: "Washington DC median rent is $2,600/month, sustained by dense federal and professional employment.",
    savingsContext: "DC's high income levels partially offset elevated housing costs, but mid-income earners still face a compressed savings ratio.",
    nearbySlug: ["new-york", "boston", "philadelphia"],
  },
  {
    slug: "philadelphia", name: "Philadelphia", countrySlug: "us", costTier: "high",
    medianRent: 1700, typicalOther: 1700,
    defaultIncomeBand: "band-4",
    rentContext: "Philadelphia median rent is around $1,700/month, making it one of the more affordable major north-east cities.",
    savingsContext: "Philadelphia earners at mid-income levels benefit from lower housing costs than nearby New York or Boston.",
    nearbySlug: ["new-york", "boston", "washington-dc"],
  },
  {
    slug: "houston", name: "Houston", countrySlug: "us", costTier: "moderate",
    medianRent: 1400, typicalOther: 1600,
    defaultIncomeBand: "band-3",
    rentContext: "Houston median rent is approximately $1,400/month, one of the lowest among major US metros.",
    savingsContext: "Houston's no-income-tax environment and low housing costs make it one of the best US cities for mid-income savings.",
    nearbySlug: ["dallas", "austin", "miami"],
  },
  {
    slug: "dallas", name: "Dallas", countrySlug: "us", costTier: "high",
    medianRent: 1600, typicalOther: 1700,
    defaultIncomeBand: "band-3",
    rentContext: "Dallas median rent is around $1,600/month, rising quickly as corporate relocations drive demand.",
    savingsContext: "Dallas earners benefit from no state income tax, though rapid rent growth is narrowing the affordability advantage.",
    nearbySlug: ["houston", "austin", "chicago"],
  },
  {
    slug: "phoenix", name: "Phoenix", countrySlug: "us", costTier: "high",
    medianRent: 1600, typicalOther: 1700,
    defaultIncomeBand: "band-3",
    rentContext: "Phoenix median rent is around $1,600/month, up sharply following sustained migration from California.",
    savingsContext: "Phoenix's income-to-cost ratio has deteriorated since 2020 but remains better than coastal peers.",
    nearbySlug: ["los-angeles", "las-vegas", "denver"],
  },
  {
    slug: "san-diego", name: "San Diego", countrySlug: "us", costTier: "very-high",
    medianRent: 2800, typicalOther: 2200,
    defaultIncomeBand: "band-5",
    rentContext: "San Diego median rent reached $2,800/month in 2023, reflecting sustained demand from defence, biotech, and tourism sectors.",
    savingsContext: "San Diego earners face Bay Area-level housing costs without commensurate tech-sector salaries for most workers.",
    nearbySlug: ["los-angeles", "san-francisco", "phoenix"],
  },
  {
    slug: "nashville", name: "Nashville", countrySlug: "us", costTier: "high",
    medianRent: 1800, typicalOther: 1700,
    defaultIncomeBand: "band-3",
    rentContext: "Nashville rents climbed to $1,800/month following rapid population growth and a corporate relocation boom.",
    savingsContext: "Nashville's no-income-tax advantage is increasingly offset by rent growth that has outpaced local wage increases.",
    nearbySlug: ["atlanta", "chicago", "austin"],
  },
  {
    slug: "portland", name: "Portland", countrySlug: "us", costTier: "high",
    medianRent: 1800, typicalOther: 1800,
    defaultIncomeBand: "band-4",
    rentContext: "Portland median rent is around $1,800/month; relatively affordable versus Seattle despite a similar economic profile.",
    savingsContext: "Portland earners face Oregon's high income tax, reducing take-home pay and effective savings rates versus gross income benchmarks.",
    nearbySlug: ["seattle", "san-francisco", "denver"],
  },
  {
    slug: "minneapolis", name: "Minneapolis", countrySlug: "us", costTier: "moderate",
    medianRent: 1400, typicalOther: 1600,
    defaultIncomeBand: "band-3",
    rentContext: "Minneapolis median rent is around $1,400/month, low for a major metro with a diverse professional economy.",
    savingsContext: "Minneapolis consistently ranks among the better US cities for mid-income savings, with low housing costs offsetting cold-climate expenses.",
    nearbySlug: ["chicago", "denver", "seattle"],
  },
  {
    slug: "las-vegas", name: "Las Vegas", countrySlug: "us", costTier: "high",
    medianRent: 1600, typicalOther: 1700,
    defaultIncomeBand: "band-3",
    rentContext: "Las Vegas median rent is approximately $1,600/month, rising following sustained in-migration from California.",
    savingsContext: "Las Vegas workers benefit from Nevada's no-income-tax status, though entertainment and lifestyle costs can offset the advantage.",
    nearbySlug: ["los-angeles", "phoenix", "denver"],
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
  {
    slug: "glasgow", name: "Glasgow", countrySlug: "gb", costTier: "moderate",
    medianRent: 850, typicalOther: 1000,
    defaultIncomeBand: "band-2",
    rentContext: "Glasgow median rent is around £850/month, making it one of the most affordable major UK cities for renters.",
    savingsContext: "Glasgow's low housing costs allow mid-income earners to save comfortably above the UK benchmark for their income band.",
    nearbySlug: ["edinburgh", "manchester", "newcastle"],
  },
  {
    slug: "liverpool", name: "Liverpool", countrySlug: "gb", costTier: "moderate",
    medianRent: 750, typicalOther: 950,
    defaultIncomeBand: "band-2",
    rentContext: "Liverpool median rent is around £750/month, among the lowest in England's major cities.",
    savingsContext: "Liverpool earners benefit from low housing costs; mid-income workers can significantly exceed UK savings benchmarks.",
    nearbySlug: ["manchester", "birmingham", "leeds"],
  },
  {
    slug: "newcastle", name: "Newcastle", countrySlug: "gb", costTier: "moderate",
    medianRent: 700, typicalOther: 900,
    defaultIncomeBand: "band-2",
    rentContext: "Newcastle median rent is around £700/month, the lowest of any major northern English city.",
    savingsContext: "Newcastle's very low housing costs make it one of the best UK cities for savings at mid and lower income levels.",
    nearbySlug: ["edinburgh", "glasgow", "leeds"],
  },
  {
    slug: "sheffield", name: "Sheffield", countrySlug: "gb", costTier: "moderate",
    medianRent: 750, typicalOther: 900,
    defaultIncomeBand: "band-2",
    rentContext: "Sheffield median rent is approximately £750/month, benefiting from a large student population keeping supply high.",
    savingsContext: "Sheffield's affordable housing gives mid-income earners strong savings capacity relative to UK national benchmarks.",
    nearbySlug: ["leeds", "manchester", "birmingham"],
  },
  {
    slug: "cardiff", name: "Cardiff", countrySlug: "gb", costTier: "moderate",
    medianRent: 950, typicalOther: 1000,
    defaultIncomeBand: "band-2",
    rentContext: "Cardiff rents average £950/month — the Welsh capital is significantly cheaper than comparable English cities.",
    savingsContext: "Cardiff professionals face a favourable income-to-cost ratio, supporting savings rates above the UK mid-income benchmark.",
    nearbySlug: ["bristol", "birmingham", "london"],
  },
  {
    slug: "nottingham", name: "Nottingham", countrySlug: "gb", costTier: "moderate",
    medianRent: 800, typicalOther: 950,
    defaultIncomeBand: "band-2",
    rentContext: "Nottingham median rent is around £800/month, affordable for a midlands city with a large university and professional base.",
    savingsContext: "Nottingham earners at mid-income levels typically save above the UK benchmark thanks to low housing costs.",
    nearbySlug: ["birmingham", "leeds", "manchester"],
  },
  {
    slug: "oxford", name: "Oxford", countrySlug: "gb", costTier: "very-high",
    medianRent: 1700, typicalOther: 1300,
    defaultIncomeBand: "band-4",
    rentContext: "Oxford median rent is around £1,700/month — driven by university demand and proximity to London it is the most expensive city outside the capital.",
    savingsContext: "Oxford renters face London-adjacent housing costs without London salaries for most workers outside academia and tech.",
    nearbySlug: ["london", "bristol", "cambridge"],
  },
  {
    slug: "cambridge", name: "Cambridge", countrySlug: "gb", costTier: "high",
    medianRent: 1500, typicalOther: 1200,
    defaultIncomeBand: "band-3",
    rentContext: "Cambridge rents average £1,500/month, sustained by university, biotech, and tech-cluster demand.",
    savingsContext: "Cambridge earners in the tech and life-sciences sector can meet savings benchmarks, but general mid-income workers face a squeeze.",
    nearbySlug: ["london", "oxford", "birmingham"],
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
  {
    slug: "cologne", name: "Cologne", countrySlug: "de", costTier: "high",
    medianRent: 1300, typicalOther: 1000,
    defaultIncomeBand: "band-3",
    rentContext: "Cologne rents average €1,300/month, driven by media and commercial activity in Germany's fourth-largest city.",
    savingsContext: "Cologne earners at mid-income levels typically achieve Germany's savings benchmark, though housing costs have risen sharply.",
    nearbySlug: ["frankfurt", "berlin", "dusseldorf"],
  },
  {
    slug: "stuttgart", name: "Stuttgart", countrySlug: "de", costTier: "high",
    medianRent: 1400, typicalOther: 1100,
    defaultIncomeBand: "band-4",
    rentContext: "Stuttgart rents average €1,400/month; high demand is driven by automotive and engineering employers.",
    savingsContext: "Stuttgart's strong automotive-sector wages partly offset high housing costs, keeping mid-income savings benchmarks achievable.",
    nearbySlug: ["munich", "frankfurt", "cologne"],
  },
  {
    slug: "dusseldorf", name: "Düsseldorf", countrySlug: "de", costTier: "high",
    medianRent: 1300, typicalOther: 1000,
    defaultIncomeBand: "band-3",
    rentContext: "Düsseldorf median rent is around €1,300/month, slightly below Cologne despite a similar professional income profile.",
    savingsContext: "Düsseldorf earners benefit from a strong commercial services sector; mid-income savings benchmarks are broadly achievable.",
    nearbySlug: ["cologne", "frankfurt", "amsterdam"],
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
  {
    slug: "marseille", name: "Marseille", countrySlug: "fr", costTier: "moderate",
    medianRent: 750, typicalOther: 950,
    defaultIncomeBand: "band-2",
    rentContext: "Marseille median rent is around €750/month, France's second-largest city but significantly cheaper than Paris.",
    savingsContext: "Marseille earners benefit from low housing costs; mid-income workers can exceed France's benchmark savings rate.",
    nearbySlug: ["lyon", "nice", "barcelona"],
  },
  {
    slug: "toulouse", name: "Toulouse", countrySlug: "fr", costTier: "moderate",
    medianRent: 800, typicalOther: 950,
    defaultIncomeBand: "band-3",
    rentContext: "Toulouse rents average €800/month; aerospace industry employment supports strong professional incomes.",
    savingsContext: "Toulouse combines moderate housing costs with above-average engineering salaries, making benchmark savings readily achievable.",
    nearbySlug: ["bordeaux", "marseille", "barcelona"],
  },
  {
    slug: "nice", name: "Nice", countrySlug: "fr", costTier: "high",
    medianRent: 1100, typicalOther: 1000,
    defaultIncomeBand: "band-3",
    rentContext: "Nice rents average €1,100/month, elevated by tourism and Côte d'Azur lifestyle demand.",
    savingsContext: "Nice earners face higher housing costs than most French cities; mid-income benchmark achievement requires careful spending.",
    nearbySlug: ["marseille", "paris", "lyon"],
  },
  {
    slug: "strasbourg", name: "Strasbourg", countrySlug: "fr", costTier: "moderate",
    medianRent: 800, typicalOther: 950,
    defaultIncomeBand: "band-3",
    rentContext: "Strasbourg rents average €800/month; EU institutions and cross-border employment drive steady demand.",
    savingsContext: "Strasbourg's moderate costs and EU-adjacent salary levels mean mid-income earners typically meet or exceed France's savings benchmark.",
    nearbySlug: ["paris", "frankfurt", "cologne"],
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
  {
    slug: "adelaide", name: "Adelaide", countrySlug: "au", costTier: "moderate",
    medianRent: 1700, typicalOther: 1900,
    defaultIncomeBand: "band-3",
    rentContext: "Adelaide rents average A$1,700/month — the most affordable of Australia's five mainland capitals.",
    savingsContext: "Adelaide's lower housing costs and strong manufacturing and defence-sector incomes support solid mid-income savings.",
    nearbySlug: ["melbourne", "perth", "brisbane"],
  },
  {
    slug: "gold-coast", name: "Gold Coast", countrySlug: "au", costTier: "high",
    medianRent: 2200, typicalOther: 2000,
    defaultIncomeBand: "band-3",
    rentContext: "Gold Coast rents average A$2,200/month, rising sharply as interstate migration from Sydney and Melbourne accelerated post-pandemic.",
    savingsContext: "Gold Coast earners face rising rent costs against a regional income base, compressing savings rates below Brisbane levels.",
    nearbySlug: ["brisbane", "sydney", "melbourne"],
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
  {
    slug: "ottawa", name: "Ottawa", countrySlug: "ca", costTier: "high",
    medianRent: 1900, typicalOther: 1600,
    defaultIncomeBand: "band-4",
    rentContext: "Ottawa median rent is C$1,900/month, driven by government and tech-sector employment in the national capital.",
    savingsContext: "Ottawa's stable public-sector incomes and moderate costs give mid-income earners a better savings outlook than Toronto or Vancouver.",
    nearbySlug: ["toronto", "montreal", "boston"],
  },
  {
    slug: "edmonton", name: "Edmonton", countrySlug: "ca", costTier: "moderate",
    medianRent: 1400, typicalOther: 1400,
    defaultIncomeBand: "band-3",
    rentContext: "Edmonton rents average C$1,400/month, among the lowest of Canada's major cities, benefiting from Alberta's abundant land.",
    savingsContext: "Edmonton earners combine Alberta's no-provincial-income-tax advantage with low housing costs — an unusually strong savings environment.",
    nearbySlug: ["calgary", "vancouver", "toronto"],
  },
  {
    slug: "halifax", name: "Halifax", countrySlug: "ca", costTier: "moderate",
    medianRent: 1500, typicalOther: 1300,
    defaultIncomeBand: "band-3",
    rentContext: "Halifax rents average C$1,500/month, rising due to remote-work migration but still well below Toronto and Vancouver.",
    savingsContext: "Halifax offers one of Canada's better income-to-cost ratios; mid-income earners can comfortably meet savings benchmarks.",
    nearbySlug: ["montreal", "toronto", "boston"],
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
  {
    slug: "galway", name: "Galway", countrySlug: "ie", costTier: "high",
    medianRent: 1400, typicalOther: 1200,
    defaultIncomeBand: "band-3",
    rentContext: "Galway rents average €1,400/month, elevated by university demand and limited housing supply in the compact city.",
    savingsContext: "Galway earners face a tight income-to-cost ratio for its size; the pharma and tech sectors support incomes but housing remains constrained.",
    nearbySlug: ["dublin", "cork", "london"],
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
    nearbySlug: ["amsterdam", "berlin", "frankfurt"],
  },
  {
    slug: "the-hague", name: "The Hague", countrySlug: "nl", costTier: "high",
    medianRent: 1400, typicalOther: 1100,
    defaultIncomeBand: "band-3",
    rentContext: "The Hague rents average €1,400/month, reflecting demand from government, legal, and international-institutions employment.",
    savingsContext: "The Hague earners benefit from stable government and international-sector incomes; mid-income savings benchmarks are broadly achievable.",
    nearbySlug: ["amsterdam", "rotterdam", "berlin"],
  },
  {
    slug: "utrecht", name: "Utrecht", countrySlug: "nl", costTier: "high",
    medianRent: 1500, typicalOther: 1100,
    defaultIncomeBand: "band-3",
    rentContext: "Utrecht rents average €1,500/month — high demand from students and professionals seeking an Amsterdam alternative.",
    savingsContext: "Utrecht earners face rising costs relative to wages; mid-income savings benchmarks are achievable but require discipline.",
    nearbySlug: ["amsterdam", "rotterdam", "berlin"],
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
  {
    slug: "valencia", name: "Valencia", countrySlug: "es", costTier: "moderate",
    medianRent: 900, typicalOther: 950,
    defaultIncomeBand: "band-2",
    rentContext: "Valencia rents average €900/month, rising due to digital-nomad and expat demand but still well below Madrid.",
    savingsContext: "Valencia's combination of low costs and growing tech-sector employment makes it increasingly attractive for savings-focused earners.",
    nearbySlug: ["madrid", "barcelona", "marseille"],
  },
  {
    slug: "malaga", name: "Málaga", countrySlug: "es", costTier: "moderate",
    medianRent: 1000, typicalOther: 950,
    defaultIncomeBand: "band-2",
    rentContext: "Málaga rents have risen to around €1,000/month, driven by digital nomads and tourism — up sharply from €600 just five years ago.",
    savingsContext: "Málaga's rapidly rising rents are compressing savings potential for local earners despite relatively low non-housing costs.",
    nearbySlug: ["madrid", "seville", "barcelona"],
  },
  {
    slug: "bilbao", name: "Bilbao", countrySlug: "es", costTier: "moderate",
    medianRent: 900, typicalOther: 950,
    defaultIncomeBand: "band-3",
    rentContext: "Bilbao rents average €900/month; the Basque Country's strong industrial base supports above-average Spanish incomes.",
    savingsContext: "Bilbao earners benefit from Spain's highest regional wages alongside moderate costs — a good environment for hitting savings benchmarks.",
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
    nearbySlug: ["stockholm", "malmo", "berlin"],
  },
  {
    slug: "malmo", name: "Malmö", countrySlug: "se", costTier: "moderate",
    medianRent: 8000, typicalOther: 9000,
    defaultIncomeBand: "band-3",
    rentContext: "Malmö private rents average 8,000 kr/month; cross-border proximity to Copenhagen makes it attractive for commuters.",
    savingsContext: "Malmö earners benefit from lower housing costs than Stockholm; mid-income savings benchmarks are typically achievable.",
    nearbySlug: ["stockholm", "gothenburg", "berlin"],
  },
  {
    slug: "uppsala", name: "Uppsala", countrySlug: "se", costTier: "moderate",
    medianRent: 8500, typicalOther: 9500,
    defaultIncomeBand: "band-3",
    rentContext: "Uppsala rents average 8,500 kr/month; university and life-sciences sector demand keeps rents elevated for a mid-size city.",
    savingsContext: "Uppsala earners at mid-income levels can generally meet Sweden's savings benchmark given the city's moderate non-housing costs.",
    nearbySlug: ["stockholm", "gothenburg", "malmo"],
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
    nearbySlug: ["auckland", "christchurch", "sydney"],
  },
  {
    slug: "christchurch", name: "Christchurch", countrySlug: "nz", costTier: "moderate",
    medianRent: 1700, typicalOther: 1800,
    defaultIncomeBand: "band-3",
    rentContext: "Christchurch median rent is NZ$1,700/month, the most affordable of New Zealand's main cities.",
    savingsContext: "Christchurch's lower costs relative to Auckland and Wellington give mid-income earners the best savings outlook of New Zealand's main centres.",
    nearbySlug: ["wellington", "auckland", "sydney"],
  },
  // ── Switzerland ─────────────────────────────────────────────────────────────
  {
    slug: "zurich", name: "Zurich", countrySlug: "ch", costTier: "very-high",
    medianRent: 2500, typicalOther: 2200,
    defaultIncomeBand: "band-4",
    rentContext: "Zurich median rent is around CHF 2,500/month for a 1-bed, making it one of Europe's most expensive rental markets.",
    savingsContext: "Zurich's very high salaries enable strong savings despite high costs — mid-income earners often outpace European peers.",
    nearbySlug: ["geneva", "vienna", "munich"],
  },

  // ── Austria ──────────────────────────────────────────────────────────────────
  {
    slug: "vienna", name: "Vienna", countrySlug: "at", costTier: "high",
    medianRent: 1100, typicalOther: 1400,
    defaultIncomeBand: "band-3",
    rentContext: "Vienna median rent is approximately €1,100/month, relatively affordable for a major European capital.",
    savingsContext: "Vienna earners benefit from moderate rents and strong social infrastructure, supporting above-average savings rates.",
    nearbySlug: ["munich", "zurich", "prague"],
  },

  // ── Norway ───────────────────────────────────────────────────────────────────
  {
    slug: "oslo", name: "Oslo", countrySlug: "no", costTier: "very-high",
    medianRent: 13500, typicalOther: 14000,
    defaultIncomeBand: "band-3",
    rentContext: "Oslo median rent is approximately 13,500 kr/month, reflecting Norway's high overall cost of living.",
    savingsContext: "Oslo's very high income levels partially offset elevated costs — mid-income earners achieve savings rates comparable to Stockholm.",
    nearbySlug: ["stockholm", "copenhagen", "london"],
  },

  // ── Portugal ─────────────────────────────────────────────────────────────────
  {
    slug: "lisbon", name: "Lisbon", countrySlug: "pt", costTier: "high",
    medianRent: 1200, typicalOther: 900,
    defaultIncomeBand: "band-3",
    rentContext: "Lisbon median rent reached €1,200/month in 2024, up over 60% in five years driven by tourism and remote worker demand.",
    savingsContext: "Lisbon earners face a growing affordability squeeze — rising rents against a relatively low local wage base compress savings rates.",
    nearbySlug: ["madrid", "barcelona", "porto"],
  },

  // ── Italy ────────────────────────────────────────────────────────────────────
  {
    slug: "milan", name: "Milan", countrySlug: "it", costTier: "high",
    medianRent: 1600, typicalOther: 1300,
    defaultIncomeBand: "band-3",
    rentContext: "Milan median rent is around €1,600/month for a 1-bed, the highest in Italy and increasingly competitive with northern European cities.",
    savingsContext: "Milan is Italy's highest-income city, but rising rents have eroded the savings advantage for mid-income earners.",
    nearbySlug: ["zurich", "paris", "rome"],
  },
  {
    slug: "rome", name: "Rome", countrySlug: "it", costTier: "high",
    medianRent: 1200, typicalOther: 1200,
    defaultIncomeBand: "band-3",
    rentContext: "Rome median rent is around €1,200/month, lower than Milan but high relative to local salaries.",
    savingsContext: "Rome's income-to-cost ratio is weaker than Milan — lower wages with moderate but still significant housing costs.",
    nearbySlug: ["milan", "madrid", "lisbon"],
  },

  // ── Belgium ──────────────────────────────────────────────────────────────────
  {
    slug: "brussels", name: "Brussels", countrySlug: "be", costTier: "high",
    medianRent: 1100, typicalOther: 1300,
    defaultIncomeBand: "band-3",
    rentContext: "Brussels median rent is around €1,100/month, moderate for a capital city given Belgium's strong wage levels.",
    savingsContext: "Brussels earners benefit from high institutional and EU-sector salaries, supporting strong savings rates at upper income bands.",
    nearbySlug: ["amsterdam", "paris", "london"],
  },

  // ── Poland ───────────────────────────────────────────────────────────────────
  {
    slug: "warsaw", name: "Warsaw", countrySlug: "pl", costTier: "high",
    medianRent: 4000, typicalOther: 3500,
    defaultIncomeBand: "band-3",
    rentContext: "Warsaw median rent has climbed to approximately 4,000 zł/month, a near-doubling since 2020 driven by rapid urbanisation and tech sector growth.",
    savingsContext: "Warsaw's tech-driven wage growth is strong, but inflation and rent increases have compressed savings rates for mid-income earners.",
    nearbySlug: ["prague", "berlin", "vienna"],
  },

  // ── Czech Republic ───────────────────────────────────────────────────────────
  {
    slug: "prague", name: "Prague", countrySlug: "cz", costTier: "high",
    medianRent: 22000, typicalOther: 18000,
    defaultIncomeBand: "band-3",
    rentContext: "Prague median rent is approximately 22,000 Kč/month, having doubled since 2019 as demand from tech workers and foreign investment surged.",
    savingsContext: "Prague's rapid rent inflation has outpaced wage growth, compressing savings rates significantly for mid-income earners.",
    nearbySlug: ["vienna", "warsaw", "berlin"],
  },

  // ── Singapore ────────────────────────────────────────────────────────────────
  {
    slug: "singapore", name: "Singapore", countrySlug: "sg", costTier: "very-high",
    medianRent: 3500, typicalOther: 2500,
    defaultIncomeBand: "band-4",
    rentContext: "Singapore median private rental is around S$3,500/month; HDB flats are cheaper but subject to occupancy restrictions for non-citizens.",
    savingsContext: "Singapore's mandatory CPF contributions mean effective savings rates are high, though the cost of living for renters is significant.",
    nearbySlug: ["sydney", "hong-kong", "kuala-lumpur"],
  },

  // ── UAE ──────────────────────────────────────────────────────────────────────
  {
    slug: "dubai", name: "Dubai", countrySlug: "ae", costTier: "very-high",
    medianRent: 8000, typicalOther: 9000,
    defaultIncomeBand: "band-3",
    rentContext: "Dubai median apartment rent is approximately AED 8,000/month, with strong demand from expat professionals driving prices higher.",
    savingsContext: "Dubai's zero income tax significantly boosts take-home pay, and high-earners can save substantially — but mid-income expats face high living costs.",
    nearbySlug: ["singapore", "london", "new-york"],
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
