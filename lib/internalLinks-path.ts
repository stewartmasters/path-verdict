interface InternalLink {
  url:   string;
  label: string;
}

const CLUSTER_LINKS: Record<string, InternalLink[]> = {
  "savings-benchmarks": [
    { url: "/",                                     label: "PathVerdict — check your savings rate" },
    { url: "/methodology",                          label: "How we calculate savings benchmarks" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate?" },
    { url: "/blog/am-i-saving-enough",             label: "Am I saving enough?" },
    { url: "/financial-position/london",           label: "Savings rate in London" },
    { url: "/financial-position/new-york",         label: "Savings rate in New York" },
  ],
  "city-savings": [
    { url: "/",                                     label: "PathVerdict savings rate tool" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate?" },
    { url: "/financial-position/london",           label: "Financial position in London" },
    { url: "/financial-position/new-york",         label: "Financial position in New York" },
    { url: "/financial-position/sydney",           label: "Financial position in Sydney" },
    { url: "/affordability/london",                label: "Cost of living in London" },
  ],
  "income-savings": [
    { url: "/",                                     label: "PathVerdict — benchmark your savings" },
    { url: "/blog/why-high-earners-struggle-to-save", label: "Why six-figure earners still can't save" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate by income?" },
    { url: "/methodology",                          label: "How savings benchmarks are calculated" },
    { url: "/financial-position/new-york",         label: "New York savings benchmarks" },
    { url: "/financial-position/london",           label: "London savings benchmarks" },
  ],
  "age-financial-position": [
    { url: "/",                                     label: "PathVerdict financial position check" },
    { url: "/blog/savings-rate-by-age",            label: "How much should you save by age?" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What is a good savings rate?" },
    { url: "/blog/savings-rate-vs-wealth-building", label: "Saving vs building wealth" },
    { url: "/methodology",                          label: "How we calculate your financial position" },
  ],
  "financial-health": [
    { url: "/",                                     label: "PathVerdict — free financial health check" },
    { url: "/blog/am-i-saving-enough",             label: "Am I saving enough?" },
    { url: "/blog/savings-rate-vs-wealth-building", label: "The difference between saving and building wealth" },
    { url: "/blog/what-is-a-good-savings-rate",    label: "What's a good savings rate?" },
    { url: "/methodology",                          label: "PathVerdict methodology" },
    { url: "/financial-position/london",           label: "Financial position benchmarks" },
  ],
};

const DEFAULT_LINKS: InternalLink[] = [
  { url: "/",              label: "PathVerdict — savings rate and financial position tool" },
  { url: "/methodology",   label: "How PathVerdict calculates savings benchmarks" },
  { url: "/blog/what-is-a-good-savings-rate", label: "What is a good savings rate?" },
  { url: "/financial-position/london",        label: "Financial position in London" },
  { url: "/financial-position/new-york",      label: "Financial position in New York" },
];

export function getInternalLinks(cluster?: string, citySlug?: string): InternalLink[] {
  const base = CLUSTER_LINKS[cluster ?? ""] ?? DEFAULT_LINKS;
  // If there's a city, prefer city-specific pages
  if (citySlug) {
    return [
      { url: `/financial-position/${citySlug}`, label: `Financial position in ${citySlug.replace(/-/g, " ")}` },
      { url: `/affordability/${citySlug}`,      label: `Cost of living in ${citySlug.replace(/-/g, " ")}` },
      ...base.slice(0, 4),
    ];
  }
  return base;
}

export function formatLinksForPrompt(links: InternalLink[]): string {
  return links.map((l) => `- [${l.label}](https://pathverdict.com${l.url})`).join("\n");
}
