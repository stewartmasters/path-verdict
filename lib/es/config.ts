/**
 * Spanish localization config.
 * esSlug = URL slug used in /es/[slug] routes.
 * dataSlug = maps to RoleSlug / LocationSlug in lib/salary-data.ts for data lookups.
 */

export interface EsRole {
  dataSlug: string;
  esSlug: string;
  label: string;       // Spanish label used in copy
  labelDe: string;     // "de [role]" — genitive form for headers like "Salario de product manager"
  plural: string;      // plural for sentences like "los ingenieros de software ganan..."
  category: string;    // Spanish category label for grouping in the tool dropdown
}

export interface EsCity {
  dataSlug: string;
  esSlug: string;
  label: string;
  context: string;     // 1–2 sentence Spanish market context for the intro
  preposition: string; // "en" or "en la" — "en Barcelona", "en la Ciudad de..." etc.
}

export const ES_ROLES: EsRole[] = [
  {
    dataSlug: "software-engineer",
    esSlug: "ingeniero-software",
    label: "Ingeniero de Software",
    labelDe: "ingeniero de software",
    plural: "ingenieros de software",
    category: "Ingeniería",
  },
  {
    dataSlug: "product-manager",
    esSlug: "product-manager",
    label: "Product Manager",
    labelDe: "product manager",
    plural: "product managers",
    category: "Producto",
  },
  {
    dataSlug: "designer",
    esSlug: "disenador-ux",
    label: "Diseñador UX/UI",
    labelDe: "diseñador UX/UI",
    plural: "diseñadores UX/UI",
    category: "Diseño",
  },
  {
    dataSlug: "data-analyst",
    esSlug: "analista-datos",
    label: "Analista de Datos",
    labelDe: "analista de datos",
    plural: "analistas de datos",
    category: "Datos",
  },
  {
    dataSlug: "marketing-manager",
    esSlug: "director-marketing",
    label: "Director de Marketing",
    labelDe: "director de marketing",
    plural: "directores de marketing",
    category: "Marketing",
  },
  {
    dataSlug: "devops-engineer",
    esSlug: "ingeniero-devops",
    label: "Ingeniero DevOps",
    labelDe: "ingeniero DevOps",
    plural: "ingenieros DevOps",
    category: "Ingeniería",
  },
  {
    dataSlug: "data-scientist",
    esSlug: "cientifico-datos",
    label: "Científico de Datos",
    labelDe: "científico de datos",
    plural: "científicos de datos",
    category: "Datos",
  },
  {
    dataSlug: "sales-manager",
    esSlug: "director-ventas",
    label: "Director de Ventas",
    labelDe: "director de ventas",
    plural: "directores de ventas",
    category: "Ventas",
  },
  {
    dataSlug: "frontend-developer",
    esSlug: "desarrollador-frontend",
    label: "Desarrollador Frontend",
    labelDe: "desarrollador frontend",
    plural: "desarrolladores frontend",
    category: "Ingeniería",
  },
  {
    dataSlug: "backend-developer",
    esSlug: "desarrollador-backend",
    label: "Desarrollador Backend",
    labelDe: "desarrollador backend",
    plural: "desarrolladores backend",
    category: "Ingeniería",
  },
  {
    dataSlug: "project-manager",
    esSlug: "project-manager",
    label: "Project Manager",
    labelDe: "project manager",
    plural: "project managers",
    category: "Operaciones",
  },
  {
    dataSlug: "finance-analyst",
    esSlug: "analista-financiero",
    label: "Analista Financiero",
    labelDe: "analista financiero",
    plural: "analistas financieros",
    category: "Finanzas",
  },
  {
    dataSlug: "operations-manager",
    esSlug: "director-operaciones",
    label: "Director de Operaciones",
    labelDe: "director de operaciones",
    plural: "directores de operaciones",
    category: "Operaciones",
  },
];

export const ES_CITIES: EsCity[] = [
  {
    dataSlug: "barcelona",
    esSlug: "barcelona",
    label: "Barcelona",
    preposition: "en",
    context:
      "Barcelona es el segundo mercado laboral de España y concentra buena parte del sector tecnológico y creativo del país. Los salarios son más altos que en el resto de España, aunque siguen por debajo de ciudades como Madrid en ciertos sectores.",
  },
  {
    dataSlug: "madrid",
    esSlug: "madrid",
    label: "Madrid",
    preposition: "en",
    context:
      "Madrid es la capital económica de España y el mercado que mejores sueldos ofrece en la mayoría de sectores. La concentración de grandes empresas, fintech y startups internacionales impulsa la competencia salarial, especialmente en tecnología y ventas.",
  },
  {
    dataSlug: "valencia",
    esSlug: "valencia",
    label: "Valencia",
    preposition: "en",
    context:
      "Valencia ha crecido como hub tecnológico y de startups en los últimos años. Los salarios son inferiores a los de Madrid y Barcelona, pero el coste de vida más bajo hace que el poder adquisitivo real sea competitivo para muchos profesionales.",
  },
  {
    dataSlug: "sevilla",
    esSlug: "sevilla",
    label: "Sevilla",
    preposition: "en",
    context:
      "Sevilla es el principal mercado laboral del sur de España, con un creciente ecosistema tecnológico. Los salarios son de los más bajos entre las grandes ciudades españolas, aunque la demanda de perfiles técnicos está creciendo con fuerza.",
  },
  {
    dataSlug: "bilbao",
    esSlug: "bilbao",
    label: "Bilbao",
    preposition: "en",
    context:
      "Bilbao combina un tejido industrial sólido con un creciente sector servicios y tecnología. Los salarios son competitivos para el norte de España, con mejores condiciones que la media nacional en roles técnicos e industriales.",
  },
];

// All roles available in the ES tool dropdown (combines ES_ROLES with additional ones)
export const ES_ALL_ROLES: EsRole[] = ES_ROLES;

// Lookup helpers
export function getEsRoleByEsSlug(esSlug: string): EsRole | undefined {
  return ES_ROLES.find((r) => r.esSlug === esSlug);
}

export function getEsRoleByDataSlug(dataSlug: string): EsRole | undefined {
  return ES_ROLES.find((r) => r.dataSlug === dataSlug);
}

export function getEsCityByEsSlug(esSlug: string): EsCity | undefined {
  return ES_CITIES.find((c) => c.esSlug === esSlug);
}

export function getEsCityByDataSlug(dataSlug: string): EsCity | undefined {
  return ES_CITIES.find((c) => c.dataSlug === dataSlug);
}

// Salary amounts for "¿Es X un buen salario?" pages
export const ES_SALARY_AMOUNTS = [25000, 30000, 35000, 40000, 50000, 60000];

// Experience levels for experience pages
export const ES_EXPERIENCE_LEVELS = [
  { years: 3, label: "3 años de experiencia", slug: "3-anos" },
  { years: 5, label: "5 años de experiencia", slug: "5-anos" },
];

// Roles used for experience pages (subset of ES_ROLES)
export const ES_EXPERIENCE_ROLES = ES_ROLES.slice(0, 5); // first 5 roles

// Roles used for experience pages — 4 core roles × 5 cities = 20
export const ES_EXP_ROLE_SLUGS = [
  "ingeniero-software",
  "product-manager",
  "disenador-ux",
  "analista-datos",
];

// City pairs for comparison pages
export const ES_COMPARISON_PAIRS: [string, string][] = [
  ["barcelona", "madrid"],
  ["madrid", "barcelona"],
  ["barcelona", "valencia"],
  ["madrid", "valencia"],
  ["barcelona", "bilbao"],
  ["madrid", "bilbao"],
  ["barcelona", "sevilla"],
  ["madrid", "sevilla"],
  ["valencia", "madrid"],
  ["bilbao", "barcelona"],
];

// Spanish verdict copy
export const ES_VERDICT = {
  "well-below": {
    emoji: "😬",
    shortAnswer: "Probablemente estás cobrando por debajo del mercado.",
    headline: "Cobras menos que la mayoría de personas en tu puesto.",
    heroSub: "Tu salario está claramente por debajo del punto medio del mercado para tu rol y ciudad.",
    nextStep: "Vale la pena plantearlo en tu próxima conversación sobre compensación.",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Por debajo del mercado",
    barColor: "bg-red-400",
    gapColor: "text-red-600",
    heroBg: "bg-red-50 border-b border-red-100",
  },
  "slightly-below": {
    emoji: "😐",
    shortAnswer: "Tu salario podría estar algo por debajo del mercado.",
    headline: "Cobras un poco menos de lo que paga el mercado.",
    heroSub: "Estás por debajo del punto medio, aunque la diferencia no es muy grande.",
    nextStep: "Algo a tener en cuenta en tu próxima revisión salarial o negociación de oferta.",
    badge: "bg-orange-100 text-orange-700",
    badgeLabel: "Ligeramente por debajo",
    barColor: "bg-orange-400",
    gapColor: "text-orange-600",
    heroBg: "bg-orange-50 border-b border-orange-100",
  },
  "fair": {
    emoji: "🙂",
    shortAnswer: "Cobras en línea con el mercado.",
    headline: "Tu salario está en torno a la media del mercado.",
    heroSub: "Tu sueldo es coherente con lo que se paga en roles similares en tu ciudad.",
    nextStep: "Estás donde el mercado espera que estés.",
    badge: "bg-amber-100 text-amber-700",
    badgeLabel: "En línea con el mercado",
    barColor: "bg-amber-400",
    gapColor: "text-gray-600",
    heroBg: "bg-amber-50 border-b border-amber-100",
  },
  "above": {
    emoji: "😎",
    shortAnswer: "Estás por encima del mercado.",
    headline: "Cobras más que la mayoría de personas en tu rol.",
    heroSub: "Tu salario supera el punto medio del mercado. Bien negociado.",
    nextStep: "Llevas ventaja — una posición fuerte de cara a cualquier negociación.",
    badge: "bg-emerald-100 text-emerald-700",
    badgeLabel: "Por encima del mercado",
    barColor: "bg-emerald-500",
    gapColor: "text-emerald-600",
    heroBg: "bg-emerald-50 border-b border-emerald-100",
  },
} as const;

// Spanish confidence labels
export const ES_CONFIDENCE_LABELS = {
  high:   { label: "Alta fiabilidad",   color: "text-emerald-600 bg-emerald-50" },
  medium: { label: "Fiabilidad media",  color: "text-amber-600 bg-amber-50" },
  low:    { label: "Baja fiabilidad",   color: "text-gray-500 bg-gray-100" },
} as const;
