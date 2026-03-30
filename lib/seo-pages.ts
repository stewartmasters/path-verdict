import { ROLES, LOCATIONS, type RoleSlug, type LocationSlug } from "./salary-data";

export interface SeoPage {
  slug: string;
  type: "role-location" | "role-only" | "location-only" | "salary-question";
  roleSlug?: RoleSlug;
  locationSlug?: LocationSlug;
  roleLabel?: string;
  locationLabel?: string;
  country?: string;
  h1: string;
  title: string;
  description: string;
  salaryAmount?: number;
}

const YEAR = 2026;

const LOCATION_CONTEXT: Record<string, string> = {
  london:       "London is one of Europe's highest-paying markets, driven by a high density of US-headquartered companies, financial institutions, and a competitive talent pool.",
  amsterdam:    "Amsterdam has become a top destination for international tech and product talent, with salaries that are among the highest in continental Europe.",
  dublin:       "Dublin's role as the EMEA headquarters for many US tech companies has pushed salaries well above the European average for most professional roles.",
  paris:        "Paris offers strong salaries — particularly in finance, luxury, and tech — backed by France's regulated labour market and a growing startup ecosystem.",
  berlin:       "Berlin is Europe's startup capital, with a maturing salary market that has risen significantly over the past decade as international companies expand there.",
  barcelona:    "Barcelona has a vibrant tech and design scene, though salaries remain lower than northern Europe — meaning there's often a gap between market value and what local companies pay.",
  madrid:       "Madrid is Spain's primary business hub with the country's highest salaries, though they still trail northern European markets by a significant margin.",
  uk:           "The UK market varies considerably — London leads, but regional cities like Manchester, Edinburgh, and Bristol have also seen salary growth in professional roles.",
  spain:        "Spain's professional salary market is evolving rapidly, particularly in tech and product, but pay still lags significantly behind northern European averages.",
  germany:      "Germany offers a stable, well-paying labour market with strong protections. Salaries are competitive across the country, with Munich and Frankfurt leading regionally.",
  france:       "France's labour market is characterised by strong regulation and solid base salaries. Benefits and social contributions are generous, though gross pay may appear lower.",
  zurich:       "Zurich is the highest-paying city in Europe for most professional roles, driven by Switzerland's strong economy, low unemployment, and a high concentration of finance and tech firms. Salaries are quoted in Swiss francs (CHF).",
  switzerland:  "Switzerland consistently ranks as Europe's highest-paying country for professional roles. Strong demand in banking, pharmaceuticals, and tech, combined with a high cost of living, drives salaries significantly above the EU average. Salaries are quoted in CHF.",
  stockholm:    "Stockholm is one of Europe's leading tech hubs, home to Spotify, Klarna, and a dense ecosystem of scale-ups. Salaries are competitive by European standards, though the market is smaller than London or Berlin.",
  sweden:       "Sweden offers a strong labour market with an emphasis on work-life balance and flat hierarchies. Tech and product roles in Stockholm pay at or above the continental European average.",
  milan:        "Milan is Italy's financial and fashion capital, with the country's highest professional salaries. Tech and finance roles have grown significantly, though salaries still lag behind northern European markets.",
  italy:        "Italy's professional salary market is lower than northern Europe but evolving. Milan and Rome lead, with growing tech ecosystems. Remote-first roles for international companies have become an important segment.",
  lisbon:       "Lisbon has emerged as one of Europe's fastest-growing tech hubs, attracting international companies and remote workers. Salaries are rising but remain below the EU average, creating significant opportunity for skilled professionals.",
  portugal:     "Portugal's professional salary market is one of Europe's lowest, but the country's low cost of living and growing tech ecosystem — especially in Lisbon and Porto — make it attractive for international talent.",
  warsaw:       "Warsaw is Central Europe's largest business hub, with a rapidly maturing tech and services market. Salaries are well below Western European levels but rising sharply, particularly for engineering and product roles.",
  poland:       "Poland has become a major European tech hub, with Warsaw and Kraków hosting large engineering teams for international companies. Salaries are significantly below Western Europe, though purchasing power is competitive locally.",
  europe:       "Across Europe, salaries vary dramatically by country, city, company type, and sector. The numbers below represent a broad European market baseline.",
};

const ROLE_CONTEXT: Record<string, string> = {
  "software-engineer":  "Software engineers remain among the highest-earning professionals across Europe, with demand consistently outpacing supply in most markets.",
  "product-manager":    "Product managers command a premium in tech-forward companies, particularly those that are product-led. The role is still relatively new in many European markets, which keeps demand high.",
  "marketing-manager":  "Marketing manager salaries vary widely depending on the industry, company stage, and whether the role is performance-driven. Tech and FMCG typically pay the most.",
  "sales-manager":      "Sales manager compensation often includes a significant variable component. The base salary figures here reflect gross fixed pay, not on-target earnings.",
  "operations-manager": "Operations is a broad function, and salaries reflect that range. Tech and logistics companies tend to pay more than traditional industries for comparable seniority.",
  "designer":           "Design salaries have grown meaningfully as companies invest in product quality. Senior designers at product-led companies can earn close to engineering equivalents.",
  "data-analyst":       "Data analysts are increasingly in demand as companies invest in data infrastructure. Salaries have risen sharply in recent years, particularly in tech and finance.",
  "data-scientist":     "Data scientists command strong premiums across Europe, particularly in finance, tech, and healthcare. Senior roles often command equity and significant bonuses.",
  "devops-engineer":    "DevOps and platform engineers are among the highest earners in tech, with consistent demand across markets. Remote work has further increased competition for this talent.",
  "frontend-developer": "Frontend developers have seen strong salary growth driven by demand for polished user experiences. React expertise commands a premium in most markets.",
  "backend-developer":  "Backend developers are core to most product teams, with salaries broadly similar to frontend roles. Experience with distributed systems or cloud infrastructure increases earning potential.",
  "qa-engineer":        "QA engineering salaries vary more than other tech roles, ranging from junior automation roles to senior quality leads with significant influence and pay.",
  "account-manager":    "Account manager salaries vary significantly based on deal size and industry. Enterprise-focused roles in SaaS typically pay the most in this category.",
  "customer-success-manager": "Customer success roles have become more strategic and better paid as companies recognise their impact on retention and expansion revenue.",
  "hr-manager":         "HR manager salaries reflect a role in transition — from administrative to strategic. People operations roles at tech companies increasingly pay closer to product and engineering.",
  "finance-analyst":    "Finance analysts earn consistent salaries across most markets. Investment banking and fintech pay significantly above the averages shown here.",
  "business-analyst":   "Business analysts sit at the intersection of strategy and operations, with salaries that vary widely depending on whether the role is closer to product, finance, or consulting.",
  "growth-manager":     "Growth roles are relatively new and salaries reflect that — some companies pay engineering-level compensation, others treat it as a marketing function. Highly variable.",
  "content-manager":    "Content manager salaries are lower than many digital roles, but senior content strategists in tech companies earn significantly more than traditional editorial roles.",
  "performance-marketing-manager": "Performance marketing managers with strong paid media expertise are increasingly well-paid, particularly at companies with significant ad budgets.",
  "social-media-manager": "Social media manager salaries are generally lower than other digital marketing roles, though senior strategists at consumer brands can earn considerably more.",
  "project-manager":      "Project managers are in demand across every industry — from construction to software. Salaries vary widely based on the sector, company size, and whether PMP or Agile certification is held. Tech and consulting pay the most.",
  "full-stack-developer": "Full stack developers are among the most versatile and in-demand engineers in Europe. The ability to work across frontend and backend commands a salary premium over specialists, particularly at smaller product companies.",
};

export function getLocationContext(locationSlug?: string): string {
  return LOCATION_CONTEXT[locationSlug ?? "europe"] ?? LOCATION_CONTEXT.europe;
}

export function getRoleContext(roleSlug?: string): string {
  return ROLE_CONTEXT[roleSlug ?? "software-engineer"] ?? ROLE_CONTEXT["software-engineer"];
}

// Null the cache whenever ROLES changes (module reload invalidates automatically)
let _seoPageCache: SeoPage[] | null = null;

export function generateSeoPages(): SeoPage[] {
  if (_seoPageCache) return _seoPageCache;
  const pages: SeoPage[] = [];

  for (const role of ROLES) {
    for (const loc of LOCATIONS) {
      pages.push({
        slug: `${role.slug}-${loc.slug}`,
        type: "role-location",
        roleSlug: role.slug,
        locationSlug: loc.slug,
        roleLabel: role.label,
        locationLabel: loc.label,
        country: loc.country,
        h1: `${role.label} Salary in ${loc.label} (${YEAR})`,
        title: `${role.label} Salary in ${loc.label} ${YEAR} — Am I Underpaid?`,
        description: `What does a ${role.label} earn in ${loc.label}? See junior, mid-level, and senior salary ranges for ${YEAR}. Check your percentile and find out if you're underpaid.`,
      });
    }
  }

  for (const role of ROLES) {
    pages.push({
      slug: role.slug,
      type: "role-only",
      roleSlug: role.slug,
      roleLabel: role.label,
      h1: `${role.label} Salary (${YEAR})`,
      title: `${role.label} Salary ${YEAR} — Average Pay & Market Range`,
      description: `What is the average ${role.label} salary in ${YEAR}? Compare pay across London, Berlin, Amsterdam, and more. Find out if you're underpaid in your market.`,
    });
  }

  for (const loc of LOCATIONS) {
    pages.push({
      slug: loc.slug,
      type: "location-only",
      locationSlug: loc.slug,
      locationLabel: loc.label,
      country: loc.country,
      h1: `Average Salaries in ${loc.label} (${YEAR})`,
      title: `Average Salaries in ${loc.label} ${YEAR} — Am I Underpaid?`,
      description: `What are average salaries in ${loc.label} in ${YEAR}? Explore salary ranges for software engineers, product managers, designers, and more. Check if you're underpaid.`,
    });
  }

  // Seniority variation pages — expanded to top roles × major cities
  // Generates "junior/mid/senior X salary in Y" pages for high-search-volume combos
  const SENIORITY_ROLES = [
    "software-engineer", "product-manager", "project-manager", "full-stack-developer",
    "data-analyst", "frontend-developer", "backend-developer", "data-scientist",
    "devops-engineer", "designer", "marketing-manager", "sales-manager",
  ];
  const SENIORITY_LOCATIONS = ["london", "berlin", "amsterdam", "paris", "dublin", "barcelona", "zurich", "stockholm", "milan", "lisbon"];
  const SENIORITY_COMBOS = SENIORITY_ROLES.flatMap((role) =>
    SENIORITY_LOCATIONS.map((location) => ({ role, location }))
  );

  for (const { role, location } of SENIORITY_COMBOS) {
    const r = ROLES.find(x => x.slug === role);
    const l = LOCATIONS.find(x => x.slug === location);
    if (!r || !l) continue;
    for (const level of ["junior", "mid", "senior"] as const) {
      const levelLabel = level === "mid" ? "Mid-Level" : level.charAt(0).toUpperCase() + level.slice(1);
      pages.push({
        slug: `${role}-${location}-${level}`,
        type: "role-location",
        roleSlug: r.slug as RoleSlug,
        locationSlug: l.slug as LocationSlug,
        roleLabel: r.label,
        locationLabel: l.label,
        country: l.country,
        h1: `${levelLabel} ${r.label} Salary in ${l.label} (${YEAR})`,
        title: `${levelLabel} ${r.label} Salary in ${l.label} ${YEAR} — Am I Underpaid?`,
        description: `What does a ${levelLabel.toLowerCase()} ${r.label} earn in ${l.label}? See the ${levelLabel.toLowerCase()} salary range for ${YEAR}. Check your percentile and find out if you're underpaid.`,
      });
    }
  }

  // "Is X a good salary in Location" pages — expanded to all major locations
  const SALARY_AMOUNTS = [25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 90000, 100000, 120000];
  const SALARY_Q_LOCATIONS: LocationSlug[] = [
    "london", "berlin", "amsterdam", "paris", "dublin", "barcelona", "madrid",
    "uk", "germany", "france", "spain",
    "zurich", "switzerland", "stockholm", "sweden", "milan", "italy", "lisbon", "portugal", "warsaw", "poland",
  ];

  for (const amount of SALARY_AMOUNTS) {
    for (const locSlug of SALARY_Q_LOCATIONS) {
      const loc = LOCATIONS.find(l => l.slug === locSlug);
      if (!loc) continue;
      const symbol = loc.currency;
      const amountStr = amount >= 1000 ? `${symbol}${(amount/1000).toFixed(0)}k` : `${symbol}${amount}`;
      const amountFull = `${symbol}${amount.toLocaleString("en-GB")}`;
      pages.push({
        slug: `is-${amount}-good-salary-${locSlug}`,
        type: "salary-question" as SeoPage["type"],
        locationSlug: locSlug,
        locationLabel: loc.label,
        country: loc.country,
        h1: `Is ${amountFull} a Good Salary in ${loc.label}?`,
        title: `Is ${amountFull} a Good Salary in ${loc.label}? (${YEAR})`,
        description: `Is ${amountFull}/year a good salary in ${loc.label}? Find out how it compares to the market, which percentile you'd be in, and whether you're underpaid.`,
        salaryAmount: amount,
      });
    }
  }

  _seoPageCache = pages;
  return pages;
}

export function getSeoPage(slug: string): SeoPage | undefined {
  return generateSeoPages().find((p) => p.slug === slug);
}

export function getRelatedPages(page: SeoPage, limit = 5): SeoPage[] {
  const all = generateSeoPages();
  const related: SeoPage[] = [];

  if (page.type === "role-location") {
    related.push(...all.filter((p) => p.type === "role-location" && p.roleSlug === page.roleSlug && p.slug !== page.slug).slice(0, 3));
    related.push(...all.filter((p) => p.type === "role-location" && p.locationSlug === page.locationSlug && p.slug !== page.slug).slice(0, 2));
  } else if (page.type === "role-only") {
    related.push(...all.filter((p) => p.type === "role-location" && p.roleSlug === page.roleSlug).slice(0, limit));
  } else if (page.type === "location-only") {
    related.push(...all.filter((p) => p.type === "role-location" && p.locationSlug === page.locationSlug).slice(0, limit));
  }

  return related.slice(0, limit);
}

// Content variation helpers — deterministic, based on slug hash
function slugVariantIndex(slug: string, variants: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % variants;
}

export function getIntroVariant(slug: string): 0 | 1 | 2 {
  return slugVariantIndex(slug, 3) as 0 | 1 | 2;
}

export function getFaqVariant(slug: string): 0 | 1 | 2 {
  return slugVariantIndex(slug + "faq", 3) as 0 | 1 | 2;
}
