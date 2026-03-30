import { ROLES, LOCATIONS } from "./salary-data";

export interface PagePriority {
  slug: string;
  priority: number; // 1–10, higher = generate first
  type: "role-location" | "role-only" | "location-only" | "seniority";
}

// High-value city list for priority calculation
const PRIORITY_LOCATIONS = new Set(["london", "berlin", "amsterdam", "paris", "dublin"]);
const PRIORITY_ROLES = new Set([
  "software-engineer", "product-manager", "designer",
  "data-analyst", "frontend-developer", "backend-developer",
]);

export function getPagePriority(roleSlug?: string, locationSlug?: string): number {
  let score = 5;
  if (roleSlug && PRIORITY_ROLES.has(roleSlug)) score += 2;
  if (locationSlug && PRIORITY_LOCATIONS.has(locationSlug)) score += 2;
  if (roleSlug === "software-engineer" && locationSlug === "london") score = 10;
  if (roleSlug === "software-engineer" && locationSlug === "berlin") score = 9;
  if (roleSlug === "product-manager" && locationSlug === "london") score = 9;
  return Math.min(10, score);
}

export const EXPERIENCE_LEVELS = [
  { slug: "junior",  label: "Junior",    years: 1.5 },
  { slug: "mid",     label: "Mid-level", years: 5   },
  { slug: "senior",  label: "Senior",    years: 10  },
];

// Salary question page templates (not generated yet but structure is ready)
export interface SalaryQuestionPage {
  slug: string;
  amount: number;
  currency: "£" | "€";
  locationSlug?: string;
  roleSlug?: string;
  h1: string;
  title: string;
  description: string;
}

export function buildSalaryQuestionPages(): SalaryQuestionPage[] {
  const pages: SalaryQuestionPage[] = [];
  const AMOUNTS_GBP = [40000, 50000, 60000, 70000, 80000, 90000, 100000];
  const AMOUNTS_EUR = [35000, 45000, 55000, 65000, 75000, 90000];

  for (const amount of AMOUNTS_GBP) {
    pages.push({
      slug: `is-${amount}-good-salary-london`,
      amount,
      currency: "£",
      locationSlug: "london",
      h1: `Is £${amount.toLocaleString()} a Good Salary in London?`,
      title: `Is £${amount.toLocaleString()} a Good Salary in London? (2026)`,
      description: `Find out if £${amount.toLocaleString()} is a good salary in London in 2026. See what percentile it puts you in and compare to market rates.`,
    });
  }
  for (const amount of AMOUNTS_EUR) {
    for (const loc of ["berlin", "amsterdam", "paris"]) {
      const loc_label = loc.charAt(0).toUpperCase() + loc.slice(1);
      pages.push({
        slug: `is-${amount}-good-salary-${loc}`,
        amount,
        currency: "€",
        locationSlug: loc,
        h1: `Is €${amount.toLocaleString()} a Good Salary in ${loc_label}?`,
        title: `Is €${amount.toLocaleString()} a Good Salary in ${loc_label}? (2026)`,
        description: `Find out if €${amount.toLocaleString()} is a good salary in ${loc_label} in 2026. See what percentile it puts you in and compare to market rates.`,
      });
    }
  }
  return pages;
}

// Suppress unused import warnings — ROLES and LOCATIONS are available for consumers of this module
export { ROLES, LOCATIONS };
