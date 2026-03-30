/**
 * Source registry.
 * Authoritative list of every data source this product uses.
 * Ingestion mode and legal notes are documented explicitly.
 *
 * IMPORTANT: do not add a source unless it is actually implemented.
 * "planned" sources must be clearly marked enabled: false.
 */

export type IngestionMode =
  | "import"           // Structured import from manually downloaded dataset
  | "manual_seed"      // Manually curated representative data
  | "api"              // Live API integration
  | "scrape";          // Automated scraping (only if clearly allowed)

export interface DataSource {
  id: string;
  name: string;
  short_name: string;
  category: "official_stats" | "job_platform" | "compensation_platform" | "market_report" | "imported_reference";
  countries_supported: string[];   // ISO alpha-2 codes, or ["*"] for all
  role_families: string[];         // Which role families have coverage, or ["*"]
  ingestion_mode: IngestionMode;
  freshness_expectation_months: number; // How often we expect to refresh
  confidence_weight: number;       // 0–1, used in benchmark weighting
  enabled: boolean;
  url: string;
  legal_notes: string;
  implementation_notes: string;
  last_ingested: string | null;    // ISO date of last successful ingest
  data_version: string | null;
}

export const SOURCE_REGISTRY: DataSource[] = [
  {
    id: "ons-uk",
    name: "UK Office for National Statistics — Annual Survey of Hours and Earnings (ASHE)",
    short_name: "ONS ASHE",
    category: "official_stats",
    countries_supported: ["GB"],
    role_families: ["*"],
    ingestion_mode: "import",
    freshness_expectation_months: 12,
    confidence_weight: 0.90,
    enabled: true,
    url: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/ashetable14",
    legal_notes: "ONS data is published under the Open Government Licence v3.0. Free to use with attribution.",
    implementation_notes: "Data imported from ASHE Table 14 (earnings by occupation, SOC 2020 4-digit codes). Covers median, P25, P75 gross annual pay for full-time employees by occupational group. Role mapping applies SOC codes to our normalized role set. UK national data only — London city-level derived from ONS regional tables.",
    last_ingested: "2026-01-01",
    data_version: "ASHE-2024",
  },
  {
    id: "eurostat-ses",
    name: "Eurostat — Structure of Earnings Survey (SES)",
    short_name: "Eurostat SES",
    category: "official_stats",
    countries_supported: ["DE", "FR", "ES", "NL", "IE", "PL", "BE", "AT", "PT"],
    role_families: ["*"],
    ingestion_mode: "import",
    freshness_expectation_months: 48, // SES runs every 4 years
    confidence_weight: 0.80,
    enabled: true,
    url: "https://ec.europa.eu/eurostat/web/labour-market/earnings",
    legal_notes: "Eurostat data is free for reuse under the Eurostat copyright notice (non-commercial and commercial use permitted with attribution).",
    implementation_notes: "SES 2022 is the latest available edition. Covers gross annual earnings by country, occupation (ISCO-08), and enterprise characteristics. Pan-European baseline only — does not replace country-specific sources. ISCO codes mapped to our normalized role set. Used as cross-check and fallback for countries where national sources are not yet integrated.",
    last_ingested: "2026-01-01",
    data_version: "SES-2022",
  },
  {
    id: "destatis-vse",
    name: "Destatis — Verdienststrukturerhebung (Earnings Structure Survey)",
    short_name: "Destatis VSE",
    category: "official_stats",
    countries_supported: ["DE"],
    role_families: ["*"],
    ingestion_mode: "import",
    freshness_expectation_months: 48,
    confidence_weight: 0.85,
    enabled: true,
    url: "https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Verdienststruktur/_inhalt.html",
    legal_notes: "Destatis data published under Data licence Germany – attribution – version 2.0 (dl-de/by-2-0). Free to use with attribution.",
    implementation_notes: "Germany earnings structure survey aligned with EU SES. Covers gross monthly/annual earnings by occupation, region, and enterprise size. Berlin city-level data derived from federal state (Länder) breakdown. KldB occupation codes mapped to our role set.",
    last_ingested: "2026-01-01",
    data_version: "VSE-2022",
  },
  {
    id: "ine-ees",
    name: "INE Spain — Encuesta de Estructura Salarial (Earnings Structure Survey)",
    short_name: "INE EES",
    category: "official_stats",
    countries_supported: ["ES"],
    role_families: ["*"],
    ingestion_mode: "import",
    freshness_expectation_months: 48,
    confidence_weight: 0.82,
    enabled: true,
    url: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177025&menu=resultados",
    legal_notes: "INE data is published under the conditions of the National Statistics Plan. Reproduction permitted with attribution to INE.",
    implementation_notes: "Spain earnings structure survey aligned with EU SES. Covers gross annual earnings by occupation (ISCO-08/CNO). Madrid and Barcelona city-level data derived from regional breakdown (Comunidad de Madrid, Cataluña). Role mapping via CNO occupation codes.",
    last_ingested: "2026-01-01",
    data_version: "EES-2022",
  },
  {
    id: "insee-dads",
    name: "INSEE France — Déclaration Annuelle de Données Sociales (DADS)",
    short_name: "INSEE DADS",
    category: "official_stats",
    countries_supported: ["FR"],
    role_families: ["*"],
    ingestion_mode: "import",
    freshness_expectation_months: 18,
    confidence_weight: 0.82,
    enabled: false, // France data not yet integrated — planned for next phase
    url: "https://www.insee.fr/fr/statistiques/serie/001549688",
    legal_notes: "INSEE data published under the Licence Ouverte / Open Licence. Free to use with attribution.",
    implementation_notes: "PLANNED — not yet integrated. France DADS covers gross annual earnings by occupation (PCS-ESE codes) and region. Paris city-level data would be derived from Île-de-France regional data. When enabled, will supplement Eurostat SES with country-specific French data.",
    last_ingested: null,
    data_version: null,
  },
  {
    id: "levels-fyi",
    name: "Levels.fyi Compensation Data",
    short_name: "Levels.fyi",
    category: "compensation_platform",
    countries_supported: ["GB", "DE", "NL", "IE", "FR", "ES"],
    role_families: ["engineering", "product", "data"],
    ingestion_mode: "manual_seed",
    freshness_expectation_months: 6,
    confidence_weight: 0.65,
    enabled: true,
    url: "https://www.levels.fyi",
    legal_notes: "Levels.fyi data is self-reported and community-contributed. No API for bulk access. This dataset is manually seeded from publicly visible salary ranges on the platform. Not scraped. Used as a directional signal for tech roles only.",
    implementation_notes: "Manual seed of representative salary ranges observed on Levels.fyi for European tech roles. Strongest signal for software engineering, product, and data science roles in major tech hubs (London, Berlin, Amsterdam, Dublin). Not used for non-tech roles. Manually refreshed.",
    last_ingested: "2026-01-01",
    data_version: "2024-manual-seed",
  },
  {
    id: "glassdoor",
    name: "Glassdoor Salary Insights",
    short_name: "Glassdoor",
    category: "compensation_platform",
    countries_supported: ["GB", "DE", "NL", "IE", "FR", "ES"],
    role_families: ["*"],
    ingestion_mode: "manual_seed",
    freshness_expectation_months: 6,
    confidence_weight: 0.55,
    enabled: true,
    url: "https://www.glassdoor.com",
    legal_notes: "Glassdoor prohibits automated scraping of salary data in their Terms of Service. This dataset is manually seeded from publicly visible salary insights. Used as a directional cross-check signal only, not as a primary source.",
    implementation_notes: "Manual seed of representative salary midpoints from Glassdoor's publicly visible 'Average Salary' figures for key role/location combinations. Used as a secondary cross-check against official statistics — not as a primary benchmark input. Self-reported data has known biases (skewed toward higher earners).",
    last_ingested: "2026-01-01",
    data_version: "2024-manual-seed",
  },
  {
    id: "indeed",
    name: "Indeed Salary Insights",
    short_name: "Indeed",
    category: "job_platform",
    countries_supported: ["GB", "DE", "NL", "IE", "FR", "ES"],
    role_families: ["*"],
    ingestion_mode: "manual_seed",
    freshness_expectation_months: 3,
    confidence_weight: 0.50,
    enabled: false, // Not yet integrated — planned
    url: "https://www.indeed.com",
    legal_notes: "Indeed prohibits scraping in their ToS. Would require official partnership for data access. Currently not integrated.",
    implementation_notes: "PLANNED — not yet integrated. Indeed salary data is derived from job postings, which introduces selection bias (posted roles, not filled roles). Would be useful as a market signal for supply/demand of roles. Requires partnership or official data sharing agreement.",
    last_ingested: null,
    data_version: null,
  },
];

export function getSource(id: string): DataSource | undefined {
  return SOURCE_REGISTRY.find((s) => s.id === id);
}

export function getEnabledSources(): DataSource[] {
  return SOURCE_REGISTRY.filter((s) => s.enabled);
}

export function getSourcesForCountry(countryCode: string): DataSource[] {
  return SOURCE_REGISTRY.filter(
    (s) => s.enabled && (s.countries_supported.includes("*") || s.countries_supported.includes(countryCode))
  );
}

/**
 * Strict country validation: asserts that a source is allowed to contribute
 * to a given country's benchmark. Throws if cross-country contamination is detected.
 */
export function assertSourceCountryAllowed(sourceId: string, countryCode: string): void {
  const source = getSource(sourceId);
  if (!source) throw new Error(`Unknown source: ${sourceId}`);
  if (source.countries_supported.includes("*")) return; // wildcard
  if (!source.countries_supported.includes(countryCode)) {
    throw new Error(
      `INTEGRITY VIOLATION: Source "${sourceId}" (countries: ${source.countries_supported.join(",")}) is not allowed to contribute to country "${countryCode}"`
    );
  }
}
