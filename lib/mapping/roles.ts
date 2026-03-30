/**
 * Role normalization engine.
 * Maps raw role labels from external sources to our normalized role set.
 *
 * Sources use different terminology:
 * - ONS uses SOC 2020 occupation labels
 * - Eurostat/Destatis/INE use ISCO-08 / national equivalents
 * - Glassdoor/Levels.fyi use free-text job titles
 *
 * This module resolves all of them to a canonical slug.
 */

export type RoleSlug =
  | "software-engineer"
  | "frontend-developer"
  | "backend-developer"
  | "full-stack-developer"
  | "product-manager"
  | "project-manager"
  | "data-analyst"
  | "data-scientist"
  | "devops-engineer"
  | "designer"
  | "marketing-manager"
  | "sales-manager"
  | "operations-manager"
  | "hr-manager"
  | "finance-analyst"
  | "business-analyst"
  | "growth-manager"
  | "customer-success-manager"
  | "account-manager"
  | "content-manager"
  | "performance-marketing-manager"
  | "social-media-manager"
  | "qa-engineer";

export type RoleFamily =
  | "engineering"
  | "product"
  | "data"
  | "design"
  | "marketing"
  | "sales"
  | "operations"
  | "people"
  | "finance";

export interface RoleDefinition {
  slug: RoleSlug;
  label: string;
  family: RoleFamily;
  aliases: string[];       // Raw strings that map to this role (case-insensitive)
  soc_codes: string[];     // UK SOC 2020 4-digit codes
  isco_codes: string[];    // ISCO-08 4-digit codes
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    slug: "software-engineer",
    label: "Software Engineer",
    family: "engineering",
    aliases: [
      "software engineer", "software developer", "software development professional",
      "programmer", "software development engineer", "swe", "engineer software",
      "programmers and software development professionals",
      "programmierer", "softwareentwickler", "ingénieur logiciel",
      "desarrollador de software", "desarrollador/a de software",
    ],
    soc_codes: ["2136"],
    isco_codes: ["2512", "2514"],
  },
  {
    slug: "frontend-developer",
    label: "Frontend Developer",
    family: "engineering",
    aliases: [
      "frontend developer", "front-end developer", "front end developer",
      "frontend engineer", "front-end engineer", "web developer", "ui developer",
      "web design and development professional", "javascript developer",
    ],
    soc_codes: ["2137", "2136"],
    isco_codes: ["2513", "2512"],
  },
  {
    slug: "backend-developer",
    label: "Backend Developer",
    family: "engineering",
    aliases: [
      "backend developer", "back-end developer", "back end developer",
      "backend engineer", "back-end engineer", "server-side developer",
      "api developer", "platform engineer",
    ],
    soc_codes: ["2136"],
    isco_codes: ["2512"],
  },
  {
    slug: "full-stack-developer",
    label: "Full Stack Developer",
    family: "engineering",
    aliases: [
      "full stack developer", "full-stack developer", "full stack engineer",
      "full-stack engineer", "fullstack developer", "fullstack engineer",
    ],
    soc_codes: ["2136"],
    isco_codes: ["2512"],
  },
  {
    slug: "devops-engineer",
    label: "DevOps Engineer",
    family: "engineering",
    aliases: [
      "devops engineer", "devops", "sre", "site reliability engineer",
      "platform engineer", "infrastructure engineer", "cloud engineer",
      "systems administrator", "systems engineer",
    ],
    soc_codes: ["2136", "3132"],
    isco_codes: ["2514", "3511"],
  },
  {
    slug: "product-manager",
    label: "Product Manager",
    family: "product",
    aliases: [
      "product manager", "pm", "product owner", "head of product",
      "director of product", "vp product", "digital product manager",
      "produktmanager", "chef de produit", "responsable produit", "product lead",
    ],
    soc_codes: ["2133", "2543"],
    isco_codes: ["1221", "2519"],
  },
  {
    slug: "project-manager",
    label: "Project Manager",
    family: "operations",
    aliases: [
      "project manager", "programme manager", "program manager",
      "project lead", "delivery manager", "pmo", "it project manager",
      "it programme manager", "projektmanager", "chef de projet",
      "responsable de projet", "gerente de proyectos",
    ],
    soc_codes: ["2134", "2542"],
    isco_codes: ["2421", "1219"],
  },
  {
    slug: "data-analyst",
    label: "Data Analyst",
    family: "data",
    aliases: [
      "data analyst", "business intelligence analyst", "bi analyst",
      "analytics analyst", "reporting analyst", "insights analyst",
      "datenanalyst", "analyste de données", "analista de datos",
    ],
    soc_codes: ["2425", "3539"],
    isco_codes: ["2529", "3313"],
  },
  {
    slug: "data-scientist",
    label: "Data Scientist",
    family: "data",
    aliases: [
      "data scientist", "ml engineer", "machine learning engineer",
      "ai engineer", "research scientist", "applied scientist",
      "datenwissenschaftler", "data science", "scientifique des données",
    ],
    soc_codes: ["2136", "2425"],
    isco_codes: ["2512", "2529"],
  },
  {
    slug: "designer",
    label: "Designer",
    family: "design",
    aliases: [
      "designer", "ux designer", "ui designer", "ux/ui designer",
      "product designer", "graphic designer", "web designer",
      "interaction designer", "visual designer", "ux researcher",
      "user experience designer",
    ],
    soc_codes: ["2137", "3421"],
    isco_codes: ["2166", "2513"],
  },
  {
    slug: "marketing-manager",
    label: "Marketing Manager",
    family: "marketing",
    aliases: [
      "marketing manager", "head of marketing", "vp marketing",
      "director of marketing", "brand manager", "digital marketing manager",
      "marketing lead", "marketingleiter", "responsable marketing",
      "responsable de marketing",
    ],
    soc_codes: ["1134", "2422"],
    isco_codes: ["1222", "2431"],
  },
  {
    slug: "sales-manager",
    label: "Sales Manager",
    family: "sales",
    aliases: [
      "sales manager", "head of sales", "vp sales", "director of sales",
      "account executive", "business development manager", "sales lead",
      "vertriebsleiter", "responsable commercial", "director comercial",
    ],
    soc_codes: ["1135", "3545"],
    isco_codes: ["1223", "3322"],
  },
  {
    slug: "operations-manager",
    label: "Operations Manager",
    family: "operations",
    aliases: [
      "operations manager", "head of operations", "ops manager",
      "chief operating officer", "coo", "operations lead",
      "betriebsleiter", "responsable des opérations",
    ],
    soc_codes: ["1162", "2542"],
    isco_codes: ["1219", "2423"],
  },
  {
    slug: "hr-manager",
    label: "HR Manager",
    family: "people",
    aliases: [
      "hr manager", "human resources manager", "people manager", "head of people",
      "hr business partner", "hrbp", "talent manager", "head of hr",
      "personalleiter", "drh", "responsable rh",
    ],
    soc_codes: ["1136", "2424"],
    isco_codes: ["1212", "2423"],
  },
  {
    slug: "finance-analyst",
    label: "Finance Analyst",
    family: "finance",
    aliases: [
      "finance analyst", "financial analyst", "fp&a analyst",
      "corporate finance analyst", "investment analyst", "treasury analyst",
      "finanzanalyst", "analyste financier",
    ],
    soc_codes: ["2421", "3537"],
    isco_codes: ["2411", "3313"],
  },
  {
    slug: "business-analyst",
    label: "Business Analyst",
    family: "operations",
    aliases: [
      "business analyst", "ba", "systems analyst", "process analyst",
      "it business analyst", "business systems analyst",
      "business and financial project management professional",
    ],
    soc_codes: ["2134", "2425"],
    isco_codes: ["2511", "2529"],
  },
  {
    slug: "growth-manager",
    label: "Growth Manager",
    family: "marketing",
    aliases: [
      "growth manager", "head of growth", "growth lead", "growth engineer",
      "growth hacker", "user acquisition manager",
    ],
    soc_codes: ["2422", "1134"],
    isco_codes: ["2431", "1222"],
  },
  {
    slug: "customer-success-manager",
    label: "Customer Success Manager",
    family: "sales",
    aliases: [
      "customer success manager", "csm", "customer success", "account manager",
      "client success manager", "customer experience manager",
    ],
    soc_codes: ["3545", "1135"],
    isco_codes: ["3322", "1223"],
  },
  {
    slug: "account-manager",
    label: "Account Manager",
    family: "sales",
    aliases: [
      "account manager", "key account manager", "kam", "client manager",
      "relationship manager",
    ],
    soc_codes: ["3545"],
    isco_codes: ["3322"],
  },
  {
    slug: "qa-engineer",
    label: "QA Engineer",
    family: "engineering",
    aliases: [
      "qa engineer", "quality assurance engineer", "test engineer",
      "software tester", "quality engineer", "sdet",
    ],
    soc_codes: ["3131", "2136"],
    isco_codes: ["3511", "2512"],
  },
  {
    slug: "content-manager",
    label: "Content Manager",
    family: "marketing",
    aliases: [
      "content manager", "content strategist", "editorial manager",
      "content lead", "head of content", "content director",
    ],
    soc_codes: ["3461"],
    isco_codes: ["2642"],
  },
  {
    slug: "performance-marketing-manager",
    label: "Performance Marketing Manager",
    family: "marketing",
    aliases: [
      "performance marketing manager", "paid media manager", "sem manager",
      "ppc manager", "paid acquisition manager", "biddable media manager",
    ],
    soc_codes: ["2422"],
    isco_codes: ["2431"],
  },
  {
    slug: "social-media-manager",
    label: "Social Media Manager",
    family: "marketing",
    aliases: [
      "social media manager", "social media strategist", "community manager",
      "social media lead", "head of social",
    ],
    soc_codes: ["3461", "2422"],
    isco_codes: ["2642", "2431"],
  },
];

const ROLE_MAP = new Map<string, RoleDefinition>();
const SOC_MAP = new Map<string, RoleDefinition[]>();
const ISCO_MAP = new Map<string, RoleDefinition[]>();

for (const def of ROLE_DEFINITIONS) {
  for (const alias of def.aliases) {
    ROLE_MAP.set(alias.toLowerCase(), def);
  }
  for (const code of def.soc_codes) {
    const existing = SOC_MAP.get(code) ?? [];
    SOC_MAP.set(code, [...existing, def]);
  }
  for (const code of def.isco_codes) {
    const existing = ISCO_MAP.get(code) ?? [];
    ISCO_MAP.set(code, [...existing, def]);
  }
}

export interface RoleNormalizationResult {
  role: RoleDefinition | null;
  confidence: number;   // 0–1
  method: "alias" | "soc" | "isco" | "none";
}

/** Normalize a raw role string to a canonical role definition. */
export function normalizeRole(raw: string): RoleNormalizationResult {
  const lower = raw.toLowerCase().trim();

  // Exact alias match
  const exactMatch = ROLE_MAP.get(lower);
  if (exactMatch) return { role: exactMatch, confidence: 1.0, method: "alias" };

  // Partial alias match (contains)
  for (const [alias, def] of ROLE_MAP.entries()) {
    if (lower.includes(alias) || alias.includes(lower)) {
      return { role: def, confidence: 0.85, method: "alias" };
    }
  }

  return { role: null, confidence: 0, method: "none" };
}

/** Normalize by SOC code (UK standard). Returns first match with confidence 0.7 (many-to-one). */
export function normalizeRoleBySoc(socCode: string): RoleNormalizationResult {
  const matches = SOC_MAP.get(socCode);
  if (!matches || matches.length === 0) return { role: null, confidence: 0, method: "none" };
  // Multiple roles can share a SOC code — return first (primary mapping), confidence 0.7
  return { role: matches[0], confidence: matches.length > 1 ? 0.70 : 0.85, method: "soc" };
}

/** Normalize by ISCO code (international standard). */
export function normalizeRoleByIsco(iscoCode: string): RoleNormalizationResult {
  const matches = ISCO_MAP.get(iscoCode);
  if (!matches || matches.length === 0) return { role: null, confidence: 0, method: "none" };
  return { role: matches[0], confidence: matches.length > 1 ? 0.70 : 0.85, method: "isco" };
}

export function getRoleDefinition(slug: string): RoleDefinition | undefined {
  return ROLE_DEFINITIONS.find((r) => r.slug === slug);
}
