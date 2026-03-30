import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How We Calculate Salaries — Our Methodology",
  description:
    "We use modelled salary estimates based on public benchmarks, not real-time company data. Here's exactly how our salary ranges are calculated.",
  alternates: { canonical: "/methodology" },
};

const SECTIONS = [
  {
    id: "where-data-comes-from",
    heading: "Where the data comes from",
    content: (
      <>
        <p>We do <strong>not</strong> have access to live company salary databases, proprietary HR platforms, or real-time job posting data. We want to be upfront about that.</p>
        <p>Instead, our salary estimates are built from government earnings surveys and community compensation platforms, normalized into a single structured pipeline:</p>
        <ul>
          <li><strong>Government earnings surveys</strong> — ONS ASHE (UK), Eurostat SES (EU-wide), Destatis VSE (Germany), and INE EES (Spain). These are the most statistically reliable sources available — large samples, consistent methodology, published under open data licences.</li>
          <li><strong>Levels.fyi compensation data</strong> — manually curated from publicly visible salary ranges on the platform, used as a directional signal for tech roles in major cities. Self-reported data with known upward bias — treated as an upper-market signal, not a market median.</li>
          <li><strong>Structured modelling</strong> — for role/location combinations where we have no direct source data, we fall back to a calibrated model using location and experience multipliers derived from the survey data above.</li>
        </ul>
        <p>All records are normalized into a unified schema and explicitly tagged with their source, geographic scope, seniority level, and freshness. Estimates are only produced from this pipeline — we do not use synthetic data.</p>
      </>
    ),
  },
  {
    id: "how-we-estimate",
    heading: "How we estimate salaries",
    content: (
      <>
        <p>When you query a role and location, we run a <strong>3-tier geographic search</strong> against our normalized record set:</p>
        <ol>
          <li><strong>City-level records</strong> — the most specific and highest-weighted data. For example, ONS London regional data or Levels.fyi London records.</li>
          <li><strong>Country-level records</strong> — national-level survey data (e.g. UK ONS ASHE national, Germany Destatis VSE national).</li>
          <li><strong>Pan-European fallback</strong> — Eurostat SES aggregate data, used only when no country-specific records exist for a combination.</li>
        </ol>
        <p>Each record is weighted by <strong>four factors</strong>: source reliability (government surveys weighted highest), data freshness (decaying ~15% per year), geographic specificity (city &gt; country &gt; Europe), and role normalization confidence (how well the raw occupation code maps to our role definition).</p>
        <p>If the available records don&apos;t match the queried seniority exactly, we apply an <strong>experience curve</strong> — a smooth non-linear function (Hermite spline) calibrated from observed European tech market data. Entry level is approximately 58% of mid-level market rate; 15 years of experience is approximately 148%.</p>
        <p>Where no pipeline data exists for a combination, the estimate falls back to a calibrated multiplier model using location premiums derived from our survey data.</p>
        <p>The result is a <strong>low / median / high</strong> range (weighted P25/P50/P75 across the contributing records) and a percentile estimate for where your salary sits.</p>
      </>
    ),
  },
  {
    id: "country-mapping",
    heading: "Country data integrity",
    content: (
      <>
        <p>We apply a strict country-to-source mapping. UK data is never used to estimate EU salaries, and EU data is never used to estimate UK salaries.</p>
        <ul>
          <li><strong>London and UK estimates</strong> are calibrated from ONS ASHE data (UK government survey). Eurostat data is not used for these locations.</li>
          <li><strong>Continental European estimates</strong> (Germany, France, Spain, Netherlands, Ireland) are calibrated from Eurostat Labour Cost Survey data. ONS data is not used for these locations.</li>
          <li><strong>Tech-role estimates</strong> in major cities (London, Berlin, Amsterdam, Paris, Dublin) are additionally cross-referenced with Levels.fyi community compensation data, which has strong European tech coverage.</li>
          <li><strong>Glassdoor salary data</strong> is used as a secondary directional cross-check only — not as a primary benchmark input. It is applied on a per-country basis and weighted at 0.55× vs 0.80–0.90× for government sources. <em>Indeed is not currently integrated.</em></li>
        </ul>
        <p>This mapping is maintained explicitly in our data layer and validated at build time to prevent accidental cross-country mixing.</p>
      </>
    ),
  },
  {
    id: "data-sources",
    heading: "Named data sources",
    content: (
      <>
        <p>Our salary pipeline draws on the following publicly available sources, each tagged with its geographic scope and ingestion method:</p>
        <ul>
          <li><strong>UK ONS ASHE 2024</strong> (ons-uk) — Annual Survey of Hours and Earnings Table 14. SOC 2020 occupation codes. Covers UK national and London regional gross annual pay by occupation for full-time employees. Open Government Licence v3.0. <em>UK locations only.</em></li>
          <li><strong>Eurostat Structure of Earnings Survey 2022</strong> (eurostat-ses) — EU member state earnings data by ISCO-08 occupation, enterprise size, and country. Covers DE, NL, ES, FR, IE and other states. Updated every 4 years. <em>Continental European markets.</em></li>
          <li><strong>Destatis Verdienststrukturerhebung 2022</strong> (destatis-vse) — Germany&apos;s national earnings structure survey aligned with EU SES. KldB 2010 occupation codes. Includes Berlin federal state breakdown. Data licence Germany dl-de/by-2-0. <em>Germany only.</em></li>
          <li><strong>INE Encuesta de Estructura Salarial 2022</strong> (ine-ees) — Spain&apos;s national earnings structure survey. CNO-11 occupation codes. Includes Comunidad de Madrid and Cataluña regional breakdown (used for Madrid and Barcelona). Attribution to INE required. <em>Spain only.</em></li>
          <li><strong>Levels.fyi 2024</strong> (levels-fyi) — Manually curated from publicly visible salary ranges on the platform. Representative of larger tech companies and above-market-median employers. Self-reported data has known upward bias — used as an upper-market signal for engineering, product, and data roles in major tech hubs. <em>Not used for non-tech roles.</em></li>
        </ul>
        <p>Government surveys are weighted highest in our pipeline. Levels.fyi is weighted at approximately 0.65× vs 0.80–0.90× for national statistics sources. Glassdoor salary figures are used as a secondary directional cross-check at 0.55× and are not a primary driver of estimates. Indeed is not currently integrated.</p>
      </>
    ),
  },
  {
    id: "confidence-scoring",
    heading: "Confidence scoring",
    content: (
      <>
        <p>We assign a confidence level — <strong>High</strong>, <strong>Medium</strong>, or <strong>Lower</strong> — to each estimate, computed directly from the pipeline data used to produce it. This is not a heuristic label; it is derived from six measured factors:</p>
        <ul>
          <li><strong>Source diversity</strong> — how many distinct data sources contributed. One source = medium at best.</li>
          <li><strong>Record count</strong> — how many normalized records matched the query. Fewer records = lower confidence.</li>
          <li><strong>Freshness</strong> — how recent the contributing data is. Government surveys run every 4 years; freshness decays 15% per year from publication date.</li>
          <li><strong>Geographic specificity</strong> — city-level data is scored highest; pan-European fallback lowest.</li>
          <li><strong>Seniority match</strong> — whether records exist for the exact queried seniority, or whether we had to interpolate using the experience curve.</li>
          <li><strong>Fallback depth</strong> — whether we reached the Europe-wide fallback tier, which means no country-specific data was available.</li>
        </ul>
        <p>High confidence requires a composite score ≥ 0.75 across these factors. Medium is 0.45–0.74. Lower confidence means the estimate is based on thin or indirect data — use it as a rough guide only.</p>
        <p>Confidence is shown on each salary page and in calculator results. It is not a claim about accuracy — it is a measure of how much real evidence supports the estimate.</p>
      </>
    ),
  },
  {
    id: "coverage",
    heading: "Coverage summary",
    content: (
      <>
        <p>We cover 21 role types across 12 locations. Coverage quality varies — here&apos;s an honest breakdown:</p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="font-semibold text-emerald-700 text-sm mb-1">Strong coverage (high confidence)</p>
            <p className="text-gray-600 text-sm">Software Engineer, Frontend Developer, Backend Developer, Product Manager, Designer, Marketing Manager, Sales Manager, Data Analyst — in London, Berlin, Amsterdam, Paris, Dublin. Multiple independent sources available for these combinations.</p>
          </div>
          <div>
            <p className="font-semibold text-amber-700 text-sm mb-1">Medium coverage</p>
            <p className="text-gray-600 text-sm">DevOps Engineer, Data Scientist, Business Analyst, HR Manager, Finance Analyst, Operations Manager, Customer Success Manager, Account Manager, Growth Manager, Performance Marketing Manager — in major cities. Reasonable market signals available but fewer cross-referenced sources.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 text-sm mb-1">Lower confidence</p>
            <p className="text-gray-600 text-sm">QA Engineer, Content Manager, Social Media Manager in any location. Any role in the generic &quot;Europe&quot; category. Fewer public benchmarks; use as a rough guide only.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "limitations",
    heading: "Limitations",
    content: (
      <>
        <p>We think transparency here matters. There are real limitations to be aware of:</p>
        <ul>
          <li><strong>Not all industries are well represented.</strong> Our estimates are strongest for tech, product, marketing, sales, and operations roles. Legal, executive, finance advisory, and highly specialised roles are not well modelled.</li>
          <li><strong>We don&apos;t account for company size or stage.</strong> A senior engineer at a Series A startup and one at a FAANG company are not the same. Our estimates reflect a broad market average, not any specific company type.</li>
          <li><strong>We don&apos;t include equity, bonuses, or benefits.</strong> Total compensation can be significantly higher than base salary, especially in tech. Our tool only estimates gross annual base salary.</li>
          <li><strong>Data is not real-time.</strong> We update the model periodically, but salaries can shift quickly in fast-moving markets.</li>
          <li><strong>Currency values are not live FX rates.</strong> UK estimates are in GBP; European estimates are in EUR. We do not apply live exchange rates between them.</li>
        </ul>
      </>
    ),
  },
  {
    id: "why-still-useful",
    heading: "Why this is still useful",
    content: (
      <>
        <p>Despite these limitations, benchmarking your salary is genuinely useful — even with modelled estimates.</p>
        <p>Most people have no external reference point for their salary at all. They accepted an offer, received annual increments, and have no idea whether they&apos;re at the 30th or 80th percentile for their role. That asymmetry favours employers.</p>
        <p>Our tool gives you a directional signal. If our model puts your current salary in the bottom 25% for your role and location, that&apos;s a meaningful data point — even if the exact median is off by a few thousand euros. It tells you there&apos;s a conversation worth having.</p>
        <p>For a more precise view, we recommend combining our estimate with:</p>
        <ul>
          <li>Job listings for similar roles in your location</li>
          <li>Conversations with recruiters who can share live market rates</li>
          <li>Professional network salary discussions</li>
          <li>National salary survey data published by government bodies</li>
        </ul>
        <p>Our goal is to give you enough signal to start the conversation — with your manager, a recruiter, or yourself.</p>
      </>
    ),
  },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Methodology</span>
      </nav>

      <header className="mb-12 space-y-4">
        <div className="inline-block bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          How we work
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          How we calculate salary estimates
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          We believe in being honest about what we do and don&apos;t know. This page explains where our salary data comes from and how we model it.
        </p>
      </header>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-12 space-y-3">
        <h2 className="font-bold text-gray-900">The short version</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Our salary estimates are based on <strong>public benchmarks and structured modelling</strong>. We do not use real-time company data feeds or proprietary salary databases. Our numbers are designed to give you a directional signal — not a legally precise figure.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {["Government wage data", "Industry benchmarks", "Experience modelling", "Location adjustments"].map((tag) => (
            <span key={tag} className="text-xs font-semibold bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <nav className="mb-12 space-y-1 border-l-2 border-orange-100 pl-4">
        {SECTIONS.map(({ id, heading }) => (
          <a key={id} href={`#${id}`} className="block text-sm text-gray-500 hover:text-orange-600 py-0.5 transition-colors">{heading}</a>
        ))}
      </nav>

      <div className="space-y-14">
        {SECTIONS.map(({ id, heading, content }) => (
          <section key={id} id={id} className="scroll-mt-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{heading}</h2>
            <div className="prose prose-gray prose-sm max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-3 prose-li:text-gray-600 prose-li:mb-1 prose-ul:space-y-1 prose-ol:space-y-1 prose-strong:text-gray-800 prose-strong:font-semibold">
              {content}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 bg-gray-900 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Ready to check your salary?</h2>
        <p className="text-gray-400 text-sm">Takes 30 seconds. No email required. No signup.</p>
        <Link href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Check my salary →
        </Link>
      </div>
    </div>
  );
}
