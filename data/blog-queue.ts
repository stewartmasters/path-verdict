export interface QueuedPost {
  slug: string;
  title: string;
  primaryKeyword: string;
  cluster: string;
  priority: number; // 1–10
  wordCountTarget: number;
  status: "queued" | "published" | "draft";
  notes?: string;
}

export const BLOG_QUEUE: QueuedPost[] = [
  { slug: "salary-negotiation-email-template", title: "Salary Negotiation Email Template (Copy-Paste Ready)", primaryKeyword: "salary negotiation email template", cluster: "underpaid-negotiation", priority: 9, wordCountTarget: 900, status: "queued" },
  { slug: "what-percentile-means-salary", title: "What Your Salary Percentile Actually Means", primaryKeyword: "salary percentile", cluster: "underpaid-negotiation", priority: 8, wordCountTarget: 800, status: "queued" },
  { slug: "how-to-benchmark-your-salary", title: "How to Benchmark Your Salary in 2026", primaryKeyword: "how to benchmark salary", cluster: "underpaid-negotiation", priority: 8, wordCountTarget: 1000, status: "queued" },
  { slug: "product-manager-salary-europe-2026", title: "Product Manager Salary in Europe 2026", primaryKeyword: "product manager salary europe", cluster: "product-manager-salary", priority: 9, wordCountTarget: 1000, status: "queued" },
  { slug: "london-salary-vs-cost-of-living", title: "London Salary vs Cost of Living: Is It Worth It?", primaryKeyword: "london salary cost of living", cluster: "european-salaries", priority: 8, wordCountTarget: 1100, status: "queued" },
  { slug: "berlin-salary-vs-cost-of-living", title: "Berlin Salary vs Cost of Living in 2026", primaryKeyword: "berlin salary cost of living", cluster: "european-salaries", priority: 7, wordCountTarget: 1000, status: "queued" },
  { slug: "how-much-should-you-earn-at-30", title: "How Much Should You Be Earning at 30?", primaryKeyword: "how much should you earn at 30", cluster: "underpaid-negotiation", priority: 8, wordCountTarget: 900, status: "queued" },
  { slug: "data-analyst-salary-europe-2026", title: "Data Analyst Salary in Europe 2026", primaryKeyword: "data analyst salary europe", cluster: "software-engineer-salary", priority: 8, wordCountTarget: 900, status: "queued" },
  { slug: "frontend-developer-salary-europe-2026", title: "Frontend Developer Salary in Europe 2026", primaryKeyword: "frontend developer salary europe", cluster: "software-engineer-salary", priority: 8, wordCountTarget: 900, status: "queued" },
  { slug: "designer-salary-europe-2026", title: "Designer Salary in Europe 2026", primaryKeyword: "designer salary europe", cluster: "software-engineer-salary", priority: 7, wordCountTarget: 900, status: "queued" },
  { slug: "average-software-engineer-salary-london", title: "Average Software Engineer Salary in London 2026", primaryKeyword: "software engineer salary london", cluster: "software-engineer-salary", priority: 10, wordCountTarget: 1100, status: "queued" },
  { slug: "how-companies-decide-your-salary", title: "How Companies Actually Decide What to Pay You", primaryKeyword: "how companies decide salary", cluster: "underpaid-negotiation", priority: 7, wordCountTarget: 1000, status: "queued" },
  { slug: "counter-offer-guide", title: "How to Handle a Counter Offer Without Burning Bridges", primaryKeyword: "how to handle counter offer", cluster: "underpaid-negotiation", priority: 7, wordCountTarget: 900, status: "queued" },
  { slug: "equity-vs-salary", title: "Equity vs Salary: How to Compare Total Compensation", primaryKeyword: "equity vs salary", cluster: "underpaid-negotiation", priority: 7, wordCountTarget: 1000, status: "queued" },
  { slug: "junior-vs-senior-salary-difference", title: "Junior vs Senior Salary: The Real Difference", primaryKeyword: "junior vs senior salary", cluster: "software-engineer-salary", priority: 6, wordCountTarget: 800, status: "queued" },
  { slug: "remote-work-salary-europe", title: "Remote Work and Salary: What European Companies Actually Pay", primaryKeyword: "remote work salary europe", cluster: "european-salaries", priority: 7, wordCountTarget: 1000, status: "queued" },
  { slug: "glassdoor-salary-accuracy", title: "How Accurate Is Glassdoor Salary Data?", primaryKeyword: "glassdoor salary accuracy", cluster: "underpaid-negotiation", priority: 6, wordCountTarget: 800, status: "queued" },
  { slug: "salary-increase-when-switching-jobs", title: "How Much of a Salary Increase Should You Ask For When Switching Jobs?", primaryKeyword: "salary increase when switching jobs", cluster: "underpaid-negotiation", priority: 8, wordCountTarget: 900, status: "queued" },
  { slug: "amsterdam-salary-guide-2026", title: "Amsterdam Salary Guide 2026", primaryKeyword: "amsterdam salary guide", cluster: "european-salaries", priority: 7, wordCountTarget: 1000, status: "queued" },
  { slug: "dublin-salary-guide-2026", title: "Dublin Salary Guide 2026", primaryKeyword: "dublin salary guide", cluster: "european-salaries", priority: 7, wordCountTarget: 1000, status: "queued" },
];

export function getNextQueuedPost(): QueuedPost | undefined {
  return [...BLOG_QUEUE]
    .filter((p) => p.status === "queued")
    .sort((a, b) => b.priority - a.priority)[0];
}

export function getPublishedSlugs(): string[] {
  return BLOG_QUEUE.filter((p) => p.status === "published").map((p) => p.slug);
}
