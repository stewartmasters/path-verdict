/**
 * Skills premium data for the salary tool.
 *
 * Premiums represent the typical additional salary % for professionals
 * with these skills vs those without, within the same role and location.
 *
 * Sources: Levels.fyi Europe 2024, LinkedIn Salary Insights 2024,
 * Eurostat ICT Skills supplement, Stack Overflow Developer Survey 2024.
 *
 * Design constraints:
 * - Max 3 skills selected at once (additive, but capped at 3)
 * - Location boosts apply on top of base premium for markets with
 *   particularly high demand for that skill
 * - Premiums are conservative — reflect broad market, not top-of-market
 */

import type { RoleSlug, LocationSlug } from "@/lib/salary-data";

export type SkillSlug =
  // Engineering
  | "python" | "typescript" | "react" | "aws" | "gcp" | "azure"
  | "kubernetes" | "rust" | "go" | "java" | "llms" | "machine-learning"
  // Data
  | "sql" | "dbt" | "spark" | "power-bi" | "tableau"
  // Product
  | "product-analytics" | "ab-testing" | "sql-product"
  // Design
  | "figma" | "ux-research" | "motion-design"
  // Marketing
  | "google-ads" | "meta-ads" | "seo" | "marketing-automation"
  // Sales
  | "salesforce" | "enterprise-sales";

export interface SkillDef {
  slug: SkillSlug;
  label: string;
  /** Role slugs this skill meaningfully applies to */
  roles: RoleSlug[];
  /** Base premium as a fraction of salary (0.08 = +8%) */
  premium: number;
  /** Additional premium in specific high-demand locations */
  locationBoost?: Partial<Record<LocationSlug, number>>;
}

export const SKILLS: SkillDef[] = [
  // ── Engineering ──────────────────────────────────────────────────────────
  {
    slug: "llms",
    label: "LLMs / AI",
    roles: ["software-engineer", "full-stack-developer", "backend-developer",
            "machine-learning-engineer", "data-scientist", "data-engineer"],
    premium: 0.16,
    locationBoost: { london: 0.04, amsterdam: 0.03, berlin: 0.02, paris: 0.02, zurich: 0.04 },
  },
  {
    slug: "machine-learning",
    label: "Machine Learning",
    roles: ["data-scientist", "machine-learning-engineer", "data-engineer",
            "software-engineer", "data-analyst"],
    premium: 0.13,
    locationBoost: { london: 0.03, zurich: 0.04, amsterdam: 0.02 },
  },
  {
    slug: "aws",
    label: "AWS",
    roles: ["software-engineer", "devops-engineer", "backend-developer",
            "full-stack-developer", "data-engineer", "machine-learning-engineer"],
    premium: 0.09,
    locationBoost: { london: 0.02, dublin: 0.03, amsterdam: 0.02 },
  },
  {
    slug: "kubernetes",
    label: "Kubernetes",
    roles: ["devops-engineer", "software-engineer", "backend-developer",
            "data-engineer", "machine-learning-engineer"],
    premium: 0.09,
    locationBoost: { berlin: 0.02, amsterdam: 0.02 },
  },
  {
    slug: "python",
    label: "Python",
    roles: ["software-engineer", "data-scientist", "data-analyst", "data-engineer",
            "machine-learning-engineer", "backend-developer", "full-stack-developer"],
    premium: 0.07,
    locationBoost: { london: 0.02, zurich: 0.02 },
  },
  {
    slug: "rust",
    label: "Rust",
    roles: ["software-engineer", "backend-developer", "devops-engineer"],
    premium: 0.11,
    locationBoost: { berlin: 0.02, amsterdam: 0.02, zurich: 0.03 },
  },
  {
    slug: "go",
    label: "Go",
    roles: ["software-engineer", "backend-developer", "devops-engineer"],
    premium: 0.09,
    locationBoost: { london: 0.02, amsterdam: 0.02 },
  },
  {
    slug: "gcp",
    label: "Google Cloud",
    roles: ["software-engineer", "devops-engineer", "data-engineer",
            "backend-developer", "machine-learning-engineer"],
    premium: 0.08,
    locationBoost: { london: 0.02, dublin: 0.02 },
  },
  {
    slug: "azure",
    label: "Azure",
    roles: ["software-engineer", "devops-engineer", "data-engineer", "backend-developer"],
    premium: 0.07,
  },
  {
    slug: "typescript",
    label: "TypeScript",
    roles: ["software-engineer", "frontend-developer", "full-stack-developer",
            "mobile-developer", "backend-developer"],
    premium: 0.06,
  },
  {
    slug: "react",
    label: "React",
    roles: ["frontend-developer", "full-stack-developer", "software-engineer",
            "mobile-developer"],
    premium: 0.06,
  },
  {
    slug: "java",
    label: "Java",
    roles: ["software-engineer", "backend-developer", "full-stack-developer",
            "mobile-developer"],
    premium: 0.05,
  },

  // ── Data ─────────────────────────────────────────────────────────────────
  {
    slug: "sql",
    label: "SQL / Data Modelling",
    roles: ["data-analyst", "data-engineer", "data-scientist", "business-analyst",
            "finance-analyst", "financial-controller"],
    premium: 0.07,
  },
  {
    slug: "dbt",
    label: "dbt",
    roles: ["data-engineer", "data-analyst", "data-scientist"],
    premium: 0.10,
    locationBoost: { london: 0.02, amsterdam: 0.02 },
  },
  {
    slug: "spark",
    label: "Spark",
    roles: ["data-engineer", "data-scientist", "machine-learning-engineer"],
    premium: 0.09,
  },
  {
    slug: "power-bi",
    label: "Power BI",
    roles: ["data-analyst", "business-analyst", "finance-analyst", "financial-controller"],
    premium: 0.06,
  },
  {
    slug: "tableau",
    label: "Tableau",
    roles: ["data-analyst", "business-analyst", "data-scientist"],
    premium: 0.05,
  },

  // ── Product ───────────────────────────────────────────────────────────────
  {
    slug: "product-analytics",
    label: "Product Analytics",
    roles: ["product-manager", "growth-manager", "data-analyst"],
    premium: 0.09,
    locationBoost: { london: 0.02, amsterdam: 0.02 },
  },
  {
    slug: "ab-testing",
    label: "A/B Testing",
    roles: ["product-manager", "growth-manager", "data-analyst",
            "performance-marketing-manager"],
    premium: 0.07,
  },
  {
    slug: "sql-product",
    label: "SQL",
    roles: ["product-manager", "growth-manager"],
    premium: 0.08,
  },

  // ── Design ────────────────────────────────────────────────────────────────
  {
    slug: "figma",
    label: "Figma / Design Systems",
    roles: ["designer", "product-designer", "ux-designer"],
    premium: 0.07,
    locationBoost: { london: 0.02, amsterdam: 0.02 },
  },
  {
    slug: "ux-research",
    label: "UX Research",
    roles: ["ux-designer", "product-designer", "designer"],
    premium: 0.08,
  },
  {
    slug: "motion-design",
    label: "Motion Design",
    roles: ["designer", "product-designer"],
    premium: 0.07,
  },

  // ── Marketing ─────────────────────────────────────────────────────────────
  {
    slug: "google-ads",
    label: "Google Ads",
    roles: ["performance-marketing-manager", "marketing-manager", "growth-manager"],
    premium: 0.08,
  },
  {
    slug: "meta-ads",
    label: "Meta Ads",
    roles: ["performance-marketing-manager", "marketing-manager", "growth-manager",
            "social-media-manager"],
    premium: 0.07,
  },
  {
    slug: "seo",
    label: "SEO",
    roles: ["content-manager", "marketing-manager", "growth-manager"],
    premium: 0.06,
  },
  {
    slug: "marketing-automation",
    label: "Marketing Automation",
    roles: ["marketing-manager", "growth-manager", "performance-marketing-manager"],
    premium: 0.07,
    locationBoost: { london: 0.02 },
  },

  // ── Sales ─────────────────────────────────────────────────────────────────
  {
    slug: "salesforce",
    label: "Salesforce",
    roles: ["sales-manager", "account-manager", "customer-success-manager",
            "operations-manager"],
    premium: 0.07,
  },
  {
    slug: "enterprise-sales",
    label: "Enterprise Sales",
    roles: ["sales-manager", "account-manager"],
    premium: 0.11,
    locationBoost: { london: 0.03, amsterdam: 0.02, dublin: 0.02 },
  },
];

/** Returns skills relevant to a given role, sorted by premium descending */
export function getSkillsForRole(roleSlug: RoleSlug): SkillDef[] {
  return SKILLS
    .filter((s) => s.roles.includes(roleSlug))
    .sort((a, b) => b.premium - a.premium);
}

export interface SkillsPremiumResult {
  totalPremium: number;       // fraction, e.g. 0.18 = +18%
  additionalSalary: number;   // absolute amount in local currency
  breakdown: Array<{
    skill: SkillDef;
    premium: number;          // effective premium including location boost
  }>;
}

/** Calculates the combined premium for up to 3 selected skills */
export function calculateSkillsPremium(
  skillSlugs: SkillSlug[],
  roleSlug: RoleSlug,
  locationSlug: LocationSlug,
  baseSalary: number
): SkillsPremiumResult {
  const selected = skillSlugs
    .slice(0, 3)
    .map((slug) => SKILLS.find((s) => s.slug === slug))
    .filter((s): s is SkillDef => s !== undefined && s.roles.includes(roleSlug));

  const breakdown = selected.map((skill) => ({
    skill,
    premium: skill.premium + (skill.locationBoost?.[locationSlug] ?? 0),
  }));

  const totalPremium = breakdown.reduce((sum, b) => sum + b.premium, 0);
  const additionalSalary = Math.round((baseSalary * totalPremium) / 500) * 500;

  return { totalPremium, additionalSalary, breakdown };
}
