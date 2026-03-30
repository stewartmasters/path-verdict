import {
  ES_ROLES,
  ES_CITIES,
  ES_SALARY_AMOUNTS,
  ES_COMPARISON_PAIRS,
  ES_EXP_ROLE_SLUGS,
} from "./config";

const YEAR = 2026;

export type EsPageType =
  | "role-city"
  | "salary-question"
  | "experience"
  | "city-comparison";

export interface EsPage {
  slug: string;                // The /es/[slug] URL slug
  type: EsPageType;
  h1: string;
  title: string;               // <title> tag
  description: string;         // meta description
  // role-city / experience
  roleEsSlug?: string;
  roleDataSlug?: string;
  roleLabel?: string;
  // city
  cityEsSlug?: string;
  cityDataSlug?: string;
  cityLabel?: string;
  // experience
  experienceYears?: number;
  experienceLabel?: string;
  // salary-question
  salaryAmount?: number;
  // city-comparison
  city1EsSlug?: string;
  city1DataSlug?: string;
  city1Label?: string;
  city2EsSlug?: string;
  city2DataSlug?: string;
  city2Label?: string;
}

let _cache: EsPage[] | null = null;

export function generateEsPages(): EsPage[] {
  if (_cache) return _cache;

  const pages: EsPage[] = [];

  // ─── A. ROLE + CITY (65 pages) ────────────────────────────────────────────
  // 13 roles × 5 cities = 65
  for (const role of ES_ROLES) {
    for (const city of ES_CITIES) {
      const slug = `salario-${role.esSlug}-${city.esSlug}`;
      pages.push({
        slug,
        type: "role-city",
        h1: `Salario de ${role.labelDe} en ${city.label} (${YEAR})`,
        title: `Salario ${role.label} en ${city.label} ${YEAR} — ¿Estoy cobrando poco?`,
        description: `¿Cuánto gana un ${role.labelDe} en ${city.label}? Consulta el sueldo medio, la horquilla salarial y descubre si estás cobrando por debajo del mercado en ${YEAR}.`,
        roleEsSlug: role.esSlug,
        roleDataSlug: role.dataSlug,
        roleLabel: role.label,
        cityEsSlug: city.esSlug,
        cityDataSlug: city.dataSlug,
        cityLabel: city.label,
      });
    }
  }

  // ─── B. "¿ES X UN BUEN SALARIO?" (30 pages) ──────────────────────────────
  // 6 amounts × 5 cities = 30
  for (const amount of ES_SALARY_AMOUNTS) {
    for (const city of ES_CITIES) {
      const slug = `es-${amount}-buen-salario-${city.esSlug}`;
      const amountStr = `€${amount.toLocaleString("es-ES")}`;
      pages.push({
        slug,
        type: "salary-question",
        h1: `¿Es ${amountStr} un buen salario en ${city.label}?`,
        title: `¿${amountStr} es un buen sueldo en ${city.label}? (${YEAR})`,
        description: `Descubre si ganar ${amountStr} al año es un buen salario en ${city.label}. Compara con el mercado, consulta tu percentil y comprueba si estás cobrando lo que mereces.`,
        cityEsSlug: city.esSlug,
        cityDataSlug: city.dataSlug,
        cityLabel: city.label,
        salaryAmount: amount,
      });
    }
  }

  // ─── C. EXPERIENCE PAGES (20 pages) ──────────────────────────────────────
  // 4 roles × 5 cities = 20, focused on 5 years experience
  const expRoles = ES_ROLES.filter((r) => ES_EXP_ROLE_SLUGS.includes(r.esSlug));
  for (const role of expRoles) {
    for (const city of ES_CITIES) {
      const slug = `salario-${role.esSlug}-${city.esSlug}-5-anos`;
      pages.push({
        slug,
        type: "experience",
        h1: `Salario de ${role.labelDe} en ${city.label} con 5 años de experiencia (${YEAR})`,
        title: `Sueldo ${role.label} ${city.label} con 5 años experiencia — ${YEAR}`,
        description: `¿Cuánto cobra un ${role.labelDe} en ${city.label} con 5 años de experiencia? Consulta el rango salarial para perfil mid-level y comprueba si estás cobrando lo que mereces.`,
        roleEsSlug: role.esSlug,
        roleDataSlug: role.dataSlug,
        roleLabel: role.label,
        cityEsSlug: city.esSlug,
        cityDataSlug: city.dataSlug,
        cityLabel: city.label,
        experienceYears: 5,
        experienceLabel: "5 años de experiencia",
      });
    }
  }

  // ─── D. CITY COMPARISON (10 pages) ────────────────────────────────────────
  for (const [slug1, slug2] of ES_COMPARISON_PAIRS) {
    const city1 = ES_CITIES.find((c) => c.esSlug === slug1)!;
    const city2 = ES_CITIES.find((c) => c.esSlug === slug2)!;
    if (!city1 || !city2) continue;
    const slug = `sueldo-${slug1}-vs-${slug2}`;
    pages.push({
      slug,
      type: "city-comparison",
      h1: `Salarios en ${city1.label} vs ${city2.label} (${YEAR})`,
      title: `Sueldos ${city1.label} vs ${city2.label} ${YEAR} — ¿Cuál paga más?`,
      description: `Compara los salarios de ${city1.label} y ${city2.label} por rol. Descubre qué ciudad paga más para tu perfil y si merece la pena cambiar de ciudad para mejorar tu sueldo.`,
      city1EsSlug: city1.esSlug,
      city1DataSlug: city1.dataSlug,
      city1Label: city1.label,
      city2EsSlug: city2.esSlug,
      city2DataSlug: city2.dataSlug,
      city2Label: city2.label,
    });
  }

  // ─── E. 3-YEAR EXPERIENCE PAGES (5 pages) ────────────────────────────────
  // ingeniero-software × 5 cities with 3 years experience
  const swRole = ES_ROLES.find((r) => r.esSlug === "ingeniero-software")!;
  for (const city of ES_CITIES) {
    const slug = `salario-ingeniero-software-${city.esSlug}-3-anos`;
    pages.push({
      slug,
      type: "experience",
      h1: `Salario de ${swRole.labelDe} en ${city.label} con 3 años de experiencia (${YEAR})`,
      title: `Sueldo Ingeniero de Software ${city.label} con 3 años experiencia — ${YEAR}`,
      description: `¿Cuánto cobra un ${swRole.labelDe} en ${city.label} con 3 años de experiencia? Consulta el rango salarial para perfil junior-mid y comprueba si estás cobrando lo que mereces.`,
      roleEsSlug: swRole.esSlug,
      roleDataSlug: swRole.dataSlug,
      roleLabel: swRole.label,
      cityEsSlug: city.esSlug,
      cityDataSlug: city.dataSlug,
      cityLabel: city.label,
      experienceYears: 3,
      experienceLabel: "3 años de experiencia",
    });
  }

  _cache = pages;
  return pages;
}

export function getEsPage(slug: string): EsPage | undefined {
  return generateEsPages().find((p) => p.slug === slug);
}

export function getRelatedEsPages(page: EsPage, limit = 6): {
  sameCity: EsPage[];
  sameRole: EsPage[];
} {
  const all = generateEsPages();

  const sameCity = all
    .filter(
      (p) =>
        p.type === "role-city" &&
        p.cityEsSlug === page.cityEsSlug &&
        p.slug !== page.slug
    )
    .slice(0, 3);

  const sameRole = all
    .filter(
      (p) =>
        p.type === "role-city" &&
        p.roleEsSlug === page.roleEsSlug &&
        p.cityEsSlug !== page.cityEsSlug &&
        p.slug !== page.slug
    )
    .slice(0, 3);

  return { sameCity, sameRole };
}

/** Deterministic 0|1|2 variant index from slug hash — used to vary intro copy */
export function esIntroVariant(slug: string): 0 | 1 | 2 {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 3) as 0 | 1 | 2;
}
