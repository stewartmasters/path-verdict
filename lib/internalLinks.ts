/**
 * Internal linking engine.
 * Maps keyword clusters and role/location combinations to relevant internal pages.
 * Used by the article generation script to provide the AI with correct link targets.
 */

export interface InternalLink {
  url: string;
  label: string;
  type: "tool" | "salary-page" | "blog" | "methodology";
}

/** Always include these in every article */
const UNIVERSAL_LINKS: InternalLink[] = [
  { url: "/", label: "free salary checker", type: "tool" },
];

/** Cluster → relevant salary pages + blog posts */
const CLUSTER_LINKS: Record<string, InternalLink[]> = {
  "underpaid-signals": [
    { url: "/", label: "salary checker", type: "tool" },
    { url: "/methodology", label: "how we calculate salaries", type: "methodology" },
    { url: "/blog/salary-negotiation-tips", label: "salary negotiation tips", type: "blog" },
    { url: "/blog/signs-you-are-underpaid", label: "signs you are underpaid", type: "blog" },
    { url: "/salary/software-engineer-london", label: "software engineer salary London", type: "salary-page" },
    { url: "/salary/product-manager-berlin", label: "product manager salary Berlin", type: "salary-page" },
  ],
  "salary-negotiation": [
    { url: "/", label: "salary checker", type: "tool" },
    { url: "/blog/how-to-know-if-you-are-underpaid", label: "how to know if you are underpaid", type: "blog" },
    { url: "/blog/signs-you-are-underpaid", label: "signs you are underpaid", type: "blog" },
    { url: "/salary/software-engineer-london", label: "software engineer salary London", type: "salary-page" },
    { url: "/methodology", label: "our salary methodology", type: "methodology" },
  ],
  "salary-worth": [
    { url: "/", label: "salary checker", type: "tool" },
    { url: "/methodology", label: "how we calculate", type: "methodology" },
    { url: "/blog/how-to-know-if-you-are-underpaid", label: "how to know if you are underpaid", type: "blog" },
    { url: "/blog/salary-negotiation-tips", label: "salary negotiation tips", type: "blog" },
  ],
  "role-location-salary": [
    { url: "/", label: "salary checker", type: "tool" },
    { url: "/methodology", label: "how we calculate salaries", type: "methodology" },
    { url: "/blog/software-engineer-salary-europe-2026", label: "software engineer salary in Europe", type: "blog" },
    { url: "/blog/average-salaries-europe-2026", label: "average salaries in Europe 2026", type: "blog" },
  ],
  "city-vs-city": [
    { url: "/", label: "salary checker", type: "tool" },
    { url: "/methodology", label: "how we calculate", type: "methodology" },
    { url: "/blog/average-salaries-europe-2026", label: "average salaries in Europe 2026", type: "blog" },
    { url: "/salary/london", label: "London salary guide", type: "salary-page" },
    { url: "/salary/berlin", label: "Berlin salary guide", type: "salary-page" },
    { url: "/salary/amsterdam", label: "Amsterdam salary guide", type: "salary-page" },
    { url: "/salary/paris", label: "Paris salary guide", type: "salary-page" },
    { url: "/salary/madrid", label: "Madrid salary guide", type: "salary-page" },
    { url: "/salary/dublin", label: "Dublin salary guide", type: "salary-page" },
  ],
  "salary-vs-cost-of-living": [
    { url: "/", label: "salary checker", type: "tool" },
    { url: "/blog/average-salaries-europe-2026", label: "average salaries in Europe 2026", type: "blog" },
    { url: "/salary/london", label: "London salary guide", type: "salary-page" },
    { url: "/salary/berlin", label: "Berlin salary guide", type: "salary-page" },
    { url: "/salary/amsterdam", label: "Amsterdam salary guide", type: "salary-page" },
    { url: "/salary/paris", label: "Paris salary guide", type: "salary-page" },
    { url: "/salary/madrid", label: "Madrid salary guide", type: "salary-page" },
    { url: "/salary/dublin", label: "Dublin salary guide", type: "salary-page" },
  ],
  "career-benchmarking": [
    { url: "/", label: "salary checker", type: "tool" },
    { url: "/methodology", label: "how we calculate salaries", type: "methodology" },
    { url: "/blog/how-to-know-if-you-are-underpaid", label: "how to know if you are underpaid", type: "blog" },
    { url: "/blog/salary-negotiation-tips", label: "salary negotiation tips", type: "blog" },
    { url: "/salary/software-engineer", label: "software engineer salary guide", type: "salary-page" },
    { url: "/salary/product-manager", label: "product manager salary guide", type: "salary-page" },
  ],
};

/** Role → canonical salary page */
const ROLE_PAGES: Record<string, InternalLink> = {
  "software-engineer":           { url: "/salary/software-engineer",         label: "software engineer salary guide",         type: "salary-page" },
  "frontend-developer":          { url: "/salary/frontend-developer",         label: "frontend developer salary guide",         type: "salary-page" },
  "backend-developer":           { url: "/salary/backend-developer",          label: "backend developer salary guide",          type: "salary-page" },
  "product-manager":             { url: "/salary/product-manager",            label: "product manager salary guide",            type: "salary-page" },
  "data-analyst":                { url: "/salary/data-analyst",               label: "data analyst salary guide",               type: "salary-page" },
  "data-scientist":              { url: "/salary/data-scientist",             label: "data scientist salary guide",             type: "salary-page" },
  "devops-engineer":             { url: "/salary/devops-engineer",            label: "DevOps engineer salary guide",            type: "salary-page" },
  "designer":                    { url: "/salary/designer",                   label: "designer salary guide",                   type: "salary-page" },
  "marketing-manager":           { url: "/salary/marketing-manager",         label: "marketing manager salary guide",          type: "salary-page" },
  "sales-manager":               { url: "/salary/sales-manager",             label: "sales manager salary guide",              type: "salary-page" },
  "hr-manager":                  { url: "/salary/hr-manager",                label: "HR manager salary guide",                 type: "salary-page" },
  "finance-analyst":             { url: "/salary/finance-analyst",           label: "finance analyst salary guide",            type: "salary-page" },
  "business-analyst":            { url: "/salary/business-analyst",          label: "business analyst salary guide",           type: "salary-page" },
  "growth-manager":              { url: "/salary/growth-manager",            label: "growth manager salary guide",             type: "salary-page" },
  "customer-success-manager":    { url: "/salary/customer-success-manager",  label: "customer success manager salary guide",   type: "salary-page" },
  "operations-manager":          { url: "/salary/operations-manager",        label: "operations manager salary guide",         type: "salary-page" },
};

/** Location → canonical salary page */
const LOCATION_PAGES: Record<string, InternalLink> = {
  london:    { url: "/salary/london",    label: "London salary guide",    type: "salary-page" },
  berlin:    { url: "/salary/berlin",    label: "Berlin salary guide",    type: "salary-page" },
  amsterdam: { url: "/salary/amsterdam", label: "Amsterdam salary guide", type: "salary-page" },
  paris:     { url: "/salary/paris",     label: "Paris salary guide",     type: "salary-page" },
  madrid:    { url: "/salary/madrid",    label: "Madrid salary guide",    type: "salary-page" },
  dublin:    { url: "/salary/dublin",    label: "Dublin salary guide",    type: "salary-page" },
  barcelona: { url: "/salary/barcelona", label: "Barcelona salary guide", type: "salary-page" },
};

/**
 * Returns internal links relevant to a given keyword item.
 * Deduplicates by URL. Always includes the tool link.
 */
export function getInternalLinks(
  cluster: string,
  role?: string | null,
  location?: string | null
): InternalLink[] {
  const seen = new Set<string>();
  const links: InternalLink[] = [];

  const add = (link: InternalLink) => {
    if (!seen.has(link.url)) {
      seen.add(link.url);
      links.push(link);
    }
  };

  // Universal
  UNIVERSAL_LINKS.forEach(add);

  // Role page
  if (role && ROLE_PAGES[role]) add(ROLE_PAGES[role]);

  // Location page
  if (location && LOCATION_PAGES[location]) add(LOCATION_PAGES[location]);

  // Role × location page
  if (role && location) {
    add({ url: `/salary/${role}-${location}`, label: `${role.replace(/-/g, " ")} salary in ${location}`, type: "salary-page" });
  }

  // Cluster links
  (CLUSTER_LINKS[cluster] ?? []).forEach(add);

  return links;
}

/**
 * Formats internal links as a markdown-friendly list for passing to AI prompt.
 */
export function formatLinksForPrompt(links: InternalLink[]): string {
  return links
    .map((l) => `- [${l.label}](${l.url}) (${l.type})`)
    .join("\n");
}
