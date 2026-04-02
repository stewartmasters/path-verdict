import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How We Calculate Your Financial Position — PathVerdict Methodology",
  description:
    "PathVerdict benchmarks your savings rate against real household expenditure survey data. Here's exactly how the calculation works, what data we use, and what the numbers mean.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com"}/methodology` },
};

const SECTIONS = [
  {
    id: "where-data-comes-from",
    heading: "Where the data comes from",
    content: (
      <>
        <p>PathVerdict does not use crowdsourced data, estimates, or synthetic benchmarks. Every expected savings rate is derived from national household expenditure surveys — the same data used by central banks and finance ministries to model household saving behaviour.</p>
        <p>Our nine primary sources are:</p>
        <ul>
          <li><strong>BLS Consumer Expenditure Survey 2023 (US)</strong> — Annual income and expenditure by quintile for US households. We use quintile average income and expenditure to derive implied savings rates by income band. Published by the US Bureau of Labor Statistics under public domain.</li>
          <li><strong>ONS Living Costs &amp; Food Survey FYE2024 (UK)</strong> — Detailed decile-level household income and expenditure data for Great Britain. The most granular public savings benchmark dataset available for the UK. Published by the Office for National Statistics under Open Government Licence v3.0.</li>
          <li><strong>Destatis Einkommens- und Verbrauchsstichprobe 2023 (Germany)</strong> — German household income and expenditure survey (EVS). Quintile-level data with breakdowns by household type. Published by Destatis under the Data Licence Germany (dl-de/by-2-0).</li>
          <li><strong>INSEE Enquête Budget de Famille (France)</strong> — French household budget survey covering income, consumption, and savings by decile. Published by INSEE under open public data terms.</li>
          <li><strong>ABS Household Expenditure Survey 2019–20 (Australia)</strong> — Australian household income and expenditure by equivalised income quintile. Published by the Australian Bureau of Statistics under Creative Commons CC BY 4.0.</li>
          <li><strong>Statistics Canada Survey of Household Spending 2023 (Canada)</strong> — Canadian household expenditure by income quintile. Published under the Statistics Canada Open Licence.</li>
          <li><strong>CBS Household Budget Survey (Netherlands)</strong> — Dutch household income and expenditure data. Published by Statistics Netherlands (CBS) under Creative Commons CC BY 4.0.</li>
          <li><strong>SCB Hushållens ekonomi (HEK) 2022 (Sweden)</strong> — Swedish household income and savings data by decile. Published by Statistics Sweden (SCB) under open data terms.</li>
          <li><strong>Stats NZ Household Economic Survey 2022–23 (New Zealand)</strong> — New Zealand household income and expenditure by equivalised income quintile. Published by Statistics New Zealand under Creative Commons CC BY 4.0.</li>
        </ul>
        <p>For Ireland and Spain, we use Eurostat Household Budget Survey (HBS) data supplemented by national CBS Ireland and INE EPF sources respectively, where available at the required income-band granularity.</p>
      </>
    ),
  },
  {
    id: "how-benchmarks-are-calculated",
    heading: "How expected savings rates are calculated",
    content: (
      <>
        <p>For each country, we map income bands to expected savings rates using the income-quintile data from the household surveys above. The process is:</p>
        <ol>
          <li><strong>Income quintile alignment</strong> — Each of our income bands (e.g. £35k–£50k) is mapped to the closest survey quintile or decile by average income. Where a band straddles two quintiles, we interpolate linearly by income weight.</li>
          <li><strong>Implied savings rate calculation</strong> — For each quintile, we calculate: <em>implied savings rate = (average income − average total expenditure) / average income</em>. Total expenditure in these surveys covers all consumption categories including housing costs.</li>
          <li><strong>Validation against OECD national accounts</strong> — Country-level implied rates are cross-checked against OECD Household Savings Rate aggregate data. Where the survey-derived rates diverge materially from OECD national accounts, we apply a documented adjustment with notes in the source data.</li>
        </ol>
        <p>The result is a per-income-band expected savings rate for each of the 11 countries we cover. These are the rates shown in your result as "Expected."</p>
      </>
    ),
  },
  {
    id: "how-your-rate-is-calculated",
    heading: "How your savings rate is calculated",
    content: (
      <>
        <p>Your savings rate is calculated from the inputs you provide:</p>
        <ol>
          <li><strong>Monthly income</strong> is estimated from the midpoint of your selected income band. For example, if you select £35k–£50k, we use £42,500 annual (£3,542/month). This is the primary source of estimation uncertainty — see the precision section below.</li>
          <li><strong>Monthly rent/mortgage</strong> is taken directly from the slider value.</li>
          <li><strong>Other monthly expenses</strong> are estimated from the midpoint of your selected expense band.</li>
          <li><strong>Monthly surplus</strong> = monthly income − rent − other expenses.</li>
          <li><strong>Savings rate</strong> = monthly surplus ÷ monthly income × 100.</li>
        </ol>
        <p>This is a gross income savings rate — it measures what proportion of your before-tax income you retain, which is what the household survey benchmarks also measure. We use gross income rather than net because survey quintile data is predominantly reported on a gross basis.</p>
        <p>Note: tax is not explicitly modelled. This means the savings rate calculation treats gross income as the baseline, consistent with the source data but different from how some personal finance tools work.</p>
      </>
    ),
  },
  {
    id: "verdict-derivation",
    heading: "How the verdict is derived",
    content: (
      <>
        <p>Once we have your savings rate and the expected rate for your income band, we calculate the <strong>gap</strong>: gap = your rate − expected rate.</p>
        <p>The verdict tiers are:</p>
        <ul>
          <li><strong>Critical</strong> — your savings rate is negative (spending exceeds income). Regardless of the gap.</li>
          <li><strong>Falling Behind</strong> — gap is below −8 percentage points. You are saving significantly less than people at your income level.</li>
          <li><strong>Under-Saving</strong> — gap is between −8 and −2 percentage points. Below benchmark but not in structural deficit.</li>
          <li><strong>On Track</strong> — gap is between −2 and +6 percentage points. Saving at or near the expected rate for your income.</li>
          <li><strong>Ahead</strong> — gap is above +6 percentage points. Saving meaningfully above what people at your income level typically save.</li>
        </ul>
        <p>The thresholds (−8, −2, +6) are calibrated to reflect the natural variance in savings rates within quintiles. Household survey data shows that within any income quintile, the standard deviation of savings rates is approximately 8–12 percentage points — so a gap of 2 percentage points below expected is well within normal variance, while a gap of 8+ points below suggests a structural difference in spending behaviour.</p>
      </>
    ),
  },
  {
    id: "age-and-investment-adjustments",
    heading: "Age and investment adjustments",
    content: (
      <>
        <p>If you provide your age, we apply a small adjustment to the expected savings rate. This reflects the well-documented life-cycle pattern of household savings: younger households (under 25) tend to save less due to lower incomes and higher setup costs; savings rates typically peak in the 45–55 range before declining in retirement.</p>
        <p>The age modifiers are derived from life-cycle savings pattern data in the BLS CEX and ONS LCF (which publish age-of-head breakdowns). They are small — typically ±3 to ±7 percentage points — and are intended to make the expected rate more relevant to your stage of life rather than a single average for all ages.</p>
        <p>If you indicate you invest regularly, the expected rate is adjusted slightly downward. This reflects that consistent investing functions as a form of wealth-building equivalent to saving, and the survey benchmarks do not always capture investment flows in their expenditure figures.</p>
      </>
    ),
  },
  {
    id: "percentile-estimation",
    heading: "Percentile estimation",
    content: (
      <>
        <p>The percentile estimate — "you save more than roughly X% of people" — is derived from the distribution of savings rates across all income levels, not just your income band.</p>
        <p>We map savings rates to percentiles using a distribution fitted to BLS CEX 2023 micro-level data, cross-validated against ONS LCF FYE2024 and OECD cross-country data. The distribution is heavily right-skewed: the majority of households save below 10% of income, and the upper tail (above 25%) represents a small fraction of the population.</p>
        <p>Key reference points from the source data: a savings rate of 0% corresponds to approximately the 26th percentile; 10% to the 38th percentile; 20% to the 74th percentile; 30% to the 90th percentile. These are population-wide figures — not conditional on income.</p>
      </>
    ),
  },
  {
    id: "precision-and-limitations",
    heading: "Precision and limitations",
    content: (
      <>
        <p>We want to be honest about the precision of these outputs.</p>
        <ul>
          <li><strong>Income band midpoints introduce uncertainty.</strong> If your income band is $55k–$75k (midpoint: $65k), the actual savings rate for someone earning $56k differs from someone earning $74k by several percentage points. The output is an estimate based on the midpoint — treat it as directional, not exact.</li>
          <li><strong>Expense band midpoints introduce similar uncertainty.</strong> A wide "other expenses" band covers a range of real behaviours. The midpoint is our best estimate of typical spending within that range.</li>
          <li><strong>Tax is not modelled explicitly.</strong> In high-income bands, tax can reduce the disposable income available to save substantially. Our gross savings rate benchmark is comparable across countries, but it does not tell you exactly how much of your take-home pay you are saving.</li>
          <li><strong>Survey data is not real-time.</strong> Household expenditure surveys are typically conducted every 2–5 years. We update benchmarks when new survey waves are published. The most recent data we use (ONS LCF FYE2024, StatsCan SHS 2023) is from 2023–24; some countries use data from 2022 survey waves.</li>
          <li><strong>We cover 11 countries.</strong> If your country is not listed, the benchmark is not applicable. We do not extrapolate to uncovered markets.</li>
          <li><strong>Savings rate does not equal wealth-building rate.</strong> The gap between income and expenditure includes savings but also debt repayment. A high savings rate does not guarantee net worth is growing if there is a large debt load.</li>
        </ul>
      </>
    ),
  },
  {
    id: "why-useful",
    heading: "Why this is useful despite the limitations",
    content: (
      <>
        <p>Most people have no external reference point for whether their savings rate is normal. They've never seen the household survey data. They don't know whether saving 8% of their income is good, average, or behind — because no one has shown them what other people at their income level actually save.</p>
        <p>That's the asymmetry PathVerdict addresses. Even with income-band estimation, even with survey data that's 1–3 years old, knowing that your savings rate is 12 percentage points below what people at your income level typically save is a meaningful signal. It tells you there's a structural difference worth examining — whether that's rent cost, lifestyle creep, or something else.</p>
        <p>For a more precise view of your position, we recommend combining your PathVerdict result with:</p>
        <ul>
          <li>Your actual take-home income and monthly account statement</li>
          <li>A detailed monthly budget if you've never built one</li>
          <li>A salary benchmark from SalaryVerdict to check whether your income is at market</li>
          <li>A rent affordability check from SpendVerdict if housing cost is the main driver</li>
        </ul>
        <p>PathVerdict gives you the signal. What you do with it is up to you.</p>
      </>
    ),
  },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Methodology</span>
      </nav>

      <header className="mb-12 space-y-4">
        <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          How we work
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          How we calculate your financial position
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          We believe in being honest about what we do and don&apos;t know. This page explains where our savings benchmarks come from and exactly how we calculate your result.
        </p>
      </header>

      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-12 space-y-3">
        <h2 className="font-bold text-gray-900">The short version</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          We take your income, rent, and expenses, calculate your savings rate, then compare it to what households at your income level actually save — using data from national statistics agencies. The result is a <strong>gap</strong> between your rate and the expected rate. The gap drives the verdict.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {["Household expenditure surveys", "9 national datasets", "Income-band benchmarks", "No crowdsourcing"].map((tag) => (
            <span key={tag} className="text-xs font-semibold bg-white border border-teal-200 text-teal-700 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <nav className="mb-12 space-y-1 border-l-2 border-teal-100 pl-4">
        {SECTIONS.map(({ id, heading }) => (
          <a key={id} href={`#${id}`} className="block text-sm text-gray-500 hover:text-teal-600 py-0.5 transition-colors">{heading}</a>
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
        <h2 className="text-xl font-bold text-white">Ready to check your position?</h2>
        <p className="text-gray-400 text-sm">Takes 30 seconds. No email required. No signup.</p>
        <Link href="/" className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Get my verdict →
        </Link>
      </div>
    </div>
  );
}
