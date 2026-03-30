export interface ContentCluster {
  id: string;
  name: string;
  description: string;
  pillarPage: string;
  pages: string[];
  blogSlugs: string[];
}

export const CONTENT_CLUSTERS: ContentCluster[] = [
  {
    id: "underpaid-negotiation",
    name: "Am I Underpaid / Salary Negotiation",
    description: "Core conversion cluster — users who suspect they're underpaid",
    pillarPage: "/",
    pages: ["/methodology", "/salary/software-engineer", "/salary/product-manager"],
    blogSlugs: [
      "how-to-know-if-you-are-underpaid",
      "salary-negotiation-tips",
      "how-to-increase-your-salary",
      "signs-you-are-underpaid",
      "how-to-ask-for-a-raise",
      "salary-negotiation-email-template",
    ],
  },
  {
    id: "software-engineer-salary",
    name: "Software Engineer Salary",
    description: "Highest-traffic role cluster",
    pillarPage: "/salary/software-engineer",
    pages: [
      "/salary/software-engineer-london",
      "/salary/software-engineer-berlin",
      "/salary/software-engineer-amsterdam",
      "/salary/software-engineer-paris",
      "/salary/software-engineer-dublin",
      "/salary/frontend-developer",
      "/salary/backend-developer",
    ],
    blogSlugs: ["software-engineer-salary-europe-2026", "average-salaries-europe-2026"],
  },
  {
    id: "product-manager-salary",
    name: "Product Manager Salary",
    description: "High-intent role cluster",
    pillarPage: "/salary/product-manager",
    pages: [
      "/salary/product-manager-london",
      "/salary/product-manager-berlin",
      "/salary/product-manager-amsterdam",
      "/salary/product-manager-paris",
    ],
    blogSlugs: ["average-salaries-europe-2026"],
  },
  {
    id: "european-salaries",
    name: "European Salary Comparison",
    description: "Location-based discovery cluster",
    pillarPage: "/salary/europe",
    pages: [
      "/salary/london",
      "/salary/berlin",
      "/salary/amsterdam",
      "/salary/paris",
      "/salary/dublin",
      "/salary/madrid",
    ],
    blogSlugs: ["average-salaries-europe-2026", "london-salary-vs-cost-of-living", "berlin-salary-vs-cost-of-living"],
  },
];

export function getClusterForPage(path: string): ContentCluster | undefined {
  return CONTENT_CLUSTERS.find(
    (c) => c.pillarPage === path || c.pages.includes(path)
  );
}

export function getClusterForBlog(slug: string): ContentCluster | undefined {
  return CONTENT_CLUSTERS.find((c) => c.blogSlugs.includes(slug));
}
