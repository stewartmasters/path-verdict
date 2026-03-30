export const DATA_MODEL_VERSION = "2026-Q1";
export const DATA_UPDATED_AT = "2026-03-01";

export interface DataSource {
  id: string;
  name: string;
  type: "government" | "aggregated" | "community" | "industry";
  /** Location slugs this source covers. Use exact location slugs from LOCATIONS. */
  locationCoverage: string[];
  /** Role slugs this source has strong signal for. "all" means directional for any role. */
  roleCoverage: string[];
  notes: string;
  url?: string;
}

/**
 * Country-to-source mapping.
 * This is the authoritative record of which data sources inform which locations.
 * Used to prevent cross-country data mixing and to surface correct attribution in UI.
 */
export const DATA_SOURCES: DataSource[] = [
  {
    id: "ons-uk",
    name: "UK ONS Annual Survey of Hours and Earnings (ASHE)",
    type: "government",
    locationCoverage: ["london", "uk"],
    roleCoverage: ["all"],
    notes:
      "UK government survey covering median gross annual pay by occupation and region. Our UK and London estimates are anchored to this data. Not used for any EU location.",
    url: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours",
  },
  {
    id: "eurostat",
    name: "Eurostat Labour Cost Survey",
    type: "government",
    locationCoverage: ["germany", "berlin", "france", "paris", "spain", "madrid", "barcelona", "netherlands", "amsterdam", "ireland", "dublin", "europe"],
    roleCoverage: ["all"],
    notes:
      "EU-wide wage structure survey covering industry-level gross annual earnings across member states. Used to calibrate location multipliers for all continental European markets. Not used for UK data.",
    url: "https://ec.europa.eu/eurostat/web/labour-market/earnings",
  },
  {
    id: "glassdoor",
    name: "Glassdoor Salary Insights",
    type: "aggregated",
    locationCoverage: ["london", "berlin", "amsterdam", "paris", "dublin", "madrid", "barcelona", "uk", "germany", "france", "spain"],
    roleCoverage: ["all"],
    notes:
      "Aggregated self-reported salary data across roles and cities. Used as a directional market signal for role-level benchmarking. Cross-checked against government sources per country — not used to override government survey baselines.",
  },
  {
    id: "indeed",
    name: "Indeed Salary Insights",
    type: "aggregated",
    locationCoverage: ["london", "berlin", "amsterdam", "paris", "dublin", "madrid", "barcelona", "uk", "germany", "france", "spain"],
    roleCoverage: ["all"],
    notes:
      "Job-posting-derived salary ranges across European markets. Used to cross-check and calibrate role/location medians against live market supply. Applied per-country, not averaged across countries.",
  },
  {
    id: "levels-fyi",
    name: "Levels.fyi Compensation Data",
    type: "community",
    locationCoverage: ["london", "berlin", "amsterdam", "paris", "dublin"],
    roleCoverage: [
      "software-engineer",
      "data-scientist",
      "product-manager",
      "devops-engineer",
      "frontend-developer",
      "backend-developer",
    ],
    notes:
      "Community-verified compensation data with the strongest signal for tech roles in major European cities. Used specifically for tech role benchmarking — not applied to non-tech or country-level aggregates.",
    url: "https://www.levels.fyi",
  },
];

/**
 * Returns the data sources that are relevant for a given role slug.
 */
export function getSourcesForRole(roleSlug: string): DataSource[] {
  return DATA_SOURCES.filter(
    (s) => s.roleCoverage.includes("all") || s.roleCoverage.includes(roleSlug)
  );
}

/**
 * Returns the data sources that are relevant for a given location slug.
 * This is the primary guard against cross-country data mixing.
 */
export function getSourcesForLocation(locationSlug: string): DataSource[] {
  return DATA_SOURCES.filter((s) => s.locationCoverage.includes(locationSlug));
}

/**
 * Returns the data sources applicable to a specific role + location combination.
 */
export function getSourcesForRoleLocation(roleSlug: string, locationSlug: string): DataSource[] {
  return DATA_SOURCES.filter(
    (s) =>
      s.locationCoverage.includes(locationSlug) &&
      (s.roleCoverage.includes("all") || s.roleCoverage.includes(roleSlug))
  );
}

/**
 * Data integrity validation.
 * Asserts that UK-specific sources are never applied to EU locations and vice versa.
 * Called at build time to catch configuration errors.
 */
export function validateSourceIntegrity(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ukLocations = ["london", "uk"];
  const euLocations = ["germany", "berlin", "france", "paris", "spain", "madrid", "barcelona", "netherlands", "amsterdam", "ireland", "dublin", "europe"];

  for (const source of DATA_SOURCES) {
    if (source.id === "ons-uk") {
      const crossover = source.locationCoverage.filter((l) => euLocations.includes(l));
      if (crossover.length > 0) {
        errors.push(`ONS (UK-only) is incorrectly mapped to EU locations: ${crossover.join(", ")}`);
      }
    }
    if (source.id === "eurostat") {
      const crossover = source.locationCoverage.filter((l) => ukLocations.includes(l));
      if (crossover.length > 0) {
        errors.push(`Eurostat (EU-only) is incorrectly mapped to UK locations: ${crossover.join(", ")}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
