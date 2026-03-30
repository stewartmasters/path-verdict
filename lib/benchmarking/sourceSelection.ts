/**
 * Source selection and country enforcement.
 * Determines which records are allowed to contribute to a benchmark for a given query.
 *
 * Rules:
 * 1. City-level records are preferred over country-level
 * 2. Country-level records only used for that country
 * 3. Europe-wide records used only as fallback (lower weight)
 * 4. Cross-country contamination is strictly forbidden
 */

import type { NormalizedRecord } from "@/lib/normalization/types";

// Map our location slugs to ISO country codes
export const LOCATION_TO_COUNTRY: Record<string, string> = {
  london:      "GB",
  uk:          "GB",
  berlin:      "DE",
  germany:     "DE",
  madrid:      "ES",
  barcelona:   "ES",
  spain:       "ES",
  paris:       "FR",
  france:      "FR",
  amsterdam:   "NL",
  dublin:      "IE",
  ireland:     "IE",
  zurich:      "CH",
  switzerland: "CH",
  stockholm:   "SE",
  sweden:      "SE",
  milan:       "IT",
  italy:       "IT",
  lisbon:      "PT",
  portugal:    "PT",
  warsaw:      "PL",
  poland:      "PL",
  europe:      "EU", // special: pan-European fallback only
};

export const LOCATION_TO_CITY: Record<string, string | null> = {
  london:      "london",
  berlin:      "berlin",
  madrid:      "madrid",
  barcelona:   "barcelona",
  paris:       "paris",
  amsterdam:   "amsterdam",
  dublin:      "dublin",
  zurich:      "zurich",
  stockholm:   "stockholm",
  milan:       "milan",
  lisbon:      "lisbon",
  warsaw:      "warsaw",
  uk:          null,
  germany:     null,
  spain:       null,
  france:      null,
  switzerland: null,
  sweden:      null,
  italy:       null,
  portugal:    null,
  poland:      null,
  europe:      null,
};

export interface SelectedRecords {
  city_records: NormalizedRecord[];
  country_records: NormalizedRecord[];
  fallback_records: NormalizedRecord[];
  fallback_path: string[];
  query_country: string;
  query_city: string | null;
}

/**
 * Select records appropriate for a given role + location query.
 * Enforces strict country boundaries and documents fallback logic.
 */
export function selectRecordsForQuery(
  allRecords: NormalizedRecord[],
  roleNormalized: string,
  locationSlug: string
): SelectedRecords {
  const queryCountry = LOCATION_TO_COUNTRY[locationSlug] ?? null;
  const queryCity = LOCATION_TO_CITY[locationSlug] ?? null;
  const fallbackPath: string[] = [];

  if (!queryCountry) {
    return {
      city_records: [],
      country_records: [],
      fallback_records: [],
      fallback_path: ["no-country-mapping"],
      query_country: "unknown",
      query_city: null,
    };
  }

  // Records matching this role (or role family via broader SOC group)
  const roleRecords = allRecords.filter((r) => r.role_normalized === roleNormalized);

  // 1. City-level records — exact country match required
  const cityRecords = queryCity
    ? roleRecords.filter(
        (r) =>
          r.city_slug === queryCity &&
          (r.country_code === queryCountry || r.country_code === "EU")
      )
    : [];

  if (cityRecords.length > 0) fallbackPath.push("city");

  // 2. Country-level records — strict country match
  // NEVER allow records from a different country at this tier
  const countryRecords = roleRecords.filter(
    (r) =>
      r.region_scope === "country" &&
      r.country_code === queryCountry &&
      r.city_slug === null
  );

  if (countryRecords.length > 0) fallbackPath.push("country");

  // 3. Europe-wide fallback — only if the location is "europe" itself OR no other records found
  const isEuropeQuery = queryCountry === "EU";
  const needsFallback = cityRecords.length === 0 && countryRecords.length === 0;

  const fallbackRecords =
    isEuropeQuery || needsFallback
      ? roleRecords.filter((r) => r.region_scope === "europe" || r.country_code === "EU")
      : [];

  if (fallbackRecords.length > 0) fallbackPath.push("europe-fallback");

  // Integrity check: ensure no contamination
  for (const r of [...cityRecords, ...countryRecords]) {
    if (queryCountry !== "EU" && r.country_code !== queryCountry && r.country_code !== "EU") {
      throw new Error(
        `INTEGRITY VIOLATION: Record ${r.id} (country: ${r.country_code}) contaminating query for ${queryCountry}`
      );
    }
  }

  return {
    city_records: cityRecords,
    country_records: countryRecords,
    fallback_records: fallbackRecords,
    fallback_path: fallbackPath.length > 0 ? fallbackPath : ["no-data"],
    query_country: queryCountry,
    query_city: queryCity,
  };
}

/**
 * Returns the weight to assign to a record based on its geographic specificity.
 * City-level data is most specific and gets highest weight.
 */
export function geographicWeight(record: NormalizedRecord, queryCity: string | null): number {
  if (queryCity && record.city_slug === queryCity) return 1.0;
  if (record.region_scope === "country") return 0.7;
  if (record.region_scope === "europe") return 0.3;
  return 0.5;
}
