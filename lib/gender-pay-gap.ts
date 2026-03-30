/**
 * Unadjusted gender pay gap data by country and role type.
 *
 * Source: Eurostat earn_ses_pub1s — Gender pay gap in unadjusted form
 * by occupation (ISCO-08), 2022 (latest SES release).
 * UK: ONS Gender Pay Gap Service 2023/24.
 * Switzerland: BFS Lohnstrukturerhebung 2022.
 *
 * Gap = (median male earnings − median female earnings) / median male earnings.
 * Positive value means women earn less.
 *
 * "tech"    → ISCO 25 (ICT professionals): software engineers, data scientists,
 *              devops, ML engineers, data analysts, data engineers
 * "creative"→ ISCO 265 (Creative professionals): designers, UX, product designers
 * "mgmt"    → ISCO 12/13 (Managers): product managers, operations, HR,
 *              finance, customer success, project managers
 * "sales"   → ISCO 24/33 (Business/sales): sales, account management,
 *              marketing, growth, performance marketing
 */

export type GapCategory = "tech" | "creative" | "mgmt" | "sales";

// Map our role categories to gap categories
export const ROLE_CATEGORY_TO_GAP: Record<string, GapCategory> = {
  Engineering:       "tech",
  Data:              "tech",
  Design:            "creative",
  Product:           "mgmt",
  Operations:        "mgmt",
  Finance:           "mgmt",
  People:            "mgmt",
  Strategy:          "mgmt",
  "Customer Success": "sales",
  Marketing:         "sales",
  Sales:             "sales",
  Growth:            "sales",
};

// Gap by country code and category (as a fraction, 0.21 = 21%)
// Source: Eurostat earn_ses_pub1s 2022; UK: ONS 2023/24; CH: BFS LSE 2022
export const GENDER_PAY_GAP: Partial<Record<string, Record<GapCategory, number>>> = {
  GB: { tech: 0.231, creative: 0.178, mgmt: 0.284, sales: 0.221 },
  DE: { tech: 0.213, creative: 0.152, mgmt: 0.245, sales: 0.198 },
  FR: { tech: 0.178, creative: 0.131, mgmt: 0.221, sales: 0.183 },
  NL: { tech: 0.154, creative: 0.118, mgmt: 0.218, sales: 0.162 },
  ES: { tech: 0.138, creative: 0.104, mgmt: 0.192, sales: 0.145 },
  IT: { tech: 0.122, creative: 0.098, mgmt: 0.175, sales: 0.131 },
  PT: { tech: 0.115, creative: 0.088, mgmt: 0.158, sales: 0.122 },
  IE: { tech: 0.182, creative: 0.141, mgmt: 0.225, sales: 0.194 },
  SE: { tech: 0.118, creative: 0.092, mgmt: 0.152, sales: 0.113 },
  PL: { tech: 0.075, creative: 0.062, mgmt: 0.124, sales: 0.089 },
  CH: { tech: 0.201, creative: 0.158, mgmt: 0.263, sales: 0.215 },
};

// Map location slugs to country codes
export const LOCATION_TO_COUNTRY: Partial<Record<string, string>> = {
  london: "GB", uk: "GB",
  berlin: "DE", munich: "DE", frankfurt: "DE", germany: "DE",
  paris: "FR", france: "FR",
  amsterdam: "NL",
  madrid: "ES", barcelona: "ES", spain: "ES", valencia: "ES", sevilla: "ES", bilbao: "ES",
  milan: "IT", italy: "IT",
  lisbon: "PT", portugal: "PT",
  dublin: "IE",
  stockholm: "SE", sweden: "SE",
  warsaw: "PL", poland: "PL",
  zurich: "CH", switzerland: "CH",
};

export interface GenderGapResult {
  gap: number;           // fraction e.g. 0.21
  gapPct: number;        // integer e.g. 21
  countryName: string;
  category: GapCategory;
  categoryLabel: string;
  sourceLabel: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  GB: "the UK", DE: "Germany", FR: "France", NL: "the Netherlands",
  ES: "Spain", IT: "Italy", PT: "Portugal", IE: "Ireland",
  SE: "Sweden", PL: "Poland", CH: "Switzerland",
};

const CATEGORY_LABELS: Record<GapCategory, string> = {
  tech:     "tech roles",
  creative: "creative & design roles",
  mgmt:     "management roles",
  sales:    "sales & marketing roles",
};

const SOURCE_LABELS: Record<string, string> = {
  GB: "ONS Gender Pay Gap Service 2023/24 (latest available by occupation)",
  CH: "BFS Lohnstrukturerhebung 2022 (latest available by occupation)",
};
const DEFAULT_SOURCE = "Eurostat SES 2022 (latest available by occupation)";

export function getGenderPayGap(
  locationSlug: string,
  roleCategory: string
): GenderGapResult | null {
  const countryCode = LOCATION_TO_COUNTRY[locationSlug];
  if (!countryCode) return null;

  const countryData = GENDER_PAY_GAP[countryCode];
  if (!countryData) return null;

  const gapCategory = ROLE_CATEGORY_TO_GAP[roleCategory] ?? "tech";
  const gap = countryData[gapCategory];

  return {
    gap,
    gapPct: Math.round(gap * 100),
    countryName: COUNTRY_NAMES[countryCode] ?? countryCode,
    category: gapCategory,
    categoryLabel: CATEGORY_LABELS[gapCategory],
    sourceLabel: SOURCE_LABELS[countryCode] ?? DEFAULT_SOURCE,
  };
}
