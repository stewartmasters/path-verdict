import type { Metadata } from "next";
import Link from "next/link";
import PathTool from "@/components/PathTool";
import PopularChecks from "@/components/PopularChecks";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import TrustSection from "@/components/TrustSection";
import { BLOG_POSTS } from "@/data/blog-posts-path";

export const metadata: Metadata = {
  title: "PathVerdict — Are You Financially On Track?",
  description:
    "Find out if you're building wealth or falling behind. Benchmarked against real income and savings data. 30 seconds, no signup required.",
};

const FEATURED_CITIES = [
  { slug: "new-york",    label: "New York" },
  { slug: "london",      label: "London" },
  { slug: "sydney",      label: "Sydney" },
  { slug: "toronto",     label: "Toronto" },
  { slug: "berlin",      label: "Berlin" },
  { slug: "dublin",      label: "Dublin" },
  { slug: "amsterdam",   label: "Amsterdam" },
  { slug: "stockholm",   label: "Stockholm" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-20 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Copy */}
          <div className="space-y-6">
            <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Free · No signup · Instant result
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Find out if you&apos;re building wealth —{" "}
              <span className="text-teal-600">or just surviving</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed">
              Most people assume they&apos;re on track. They&apos;re not. PathVerdict benchmarks your income, spending, and savings against real household survey data — and delivers a verdict in under 30 seconds across 11 countries and 50 cities.
            </p>

            {/* Trust stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { value: "11",   label: "Countries" },
                { value: "50",   label: "Cities" },
                { value: "9",    label: "Official datasets" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Trust logos — minimal */}
            <div className="space-y-2 pt-1">
              <TrustSection variant="minimal" />
            </div>

            {/* Bullets */}
            <ul className="space-y-2 pt-1">
              {[
                "Your savings rate, benchmarked against people earning like you",
                "See exactly where you fall: Critical, Falling Behind, Under-Saving, On Track, or Ahead",
                "No spreadsheets. No guesswork. One clear financial position.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-teal-500 font-bold mt-0.5 flex-shrink-0">→</span>
                  {line}
                </li>
              ))}
            </ul>

          </div>

          {/* Tool */}
          <div id="path-tool" className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-6 sm:p-8 min-w-0">
            <PathTool />
            <TrustSection />
          </div>
        </div>
      </section>

      <PopularChecks />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-t border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Enter your numbers",
              desc: "Income, rent, and monthly expenses. Optional: your age and whether you invest.",
            },
            {
              step: "02",
              title: "We calculate your savings rate",
              desc: "We compare what you keep against income-adjusted benchmarks from real household expenditure data.",
            },
            {
              step: "03",
              title: "Get a clear financial verdict",
              desc: "See your savings rate, your expected rate, the gap, and exactly where you stand.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="space-y-3">
              <div className="text-3xl font-black text-teal-100">{step}</div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verdict tiers */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">The five financial positions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { tier: "Critical",       color: "bg-red-50 border-red-100",      text: "text-red-700",    desc: "Spending exceeds income. Structural deficit." },
            { tier: "Falling Behind", color: "bg-orange-50 border-orange-100", text: "text-orange-700", desc: "Savings well below benchmark for your income." },
            { tier: "Under-Saving",   color: "bg-amber-50 border-amber-100",   text: "text-amber-700",  desc: "Below benchmark but covering expenses." },
            { tier: "On Track",       color: "bg-teal-50 border-teal-100",     text: "text-teal-700",   desc: "Saving at or near expected for your income." },
            { tier: "Ahead",          color: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", desc: "Saving meaningfully above benchmark." },
          ].map(({ tier, color, text, desc }) => (
            <div key={tier} className={`p-4 rounded-xl border ${color}`}>
              <div className={`text-sm font-bold mb-1 ${text}`}>{tier}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by city */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse by city</h2>
            <p className="text-sm text-gray-400 mt-1">Pre-set for local rent and income levels.</p>
          </div>
          <Link href="/financial-position/new-york" className="text-sm text-teal-600 font-semibold hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURED_CITIES.map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/financial-position/${slug}`}
              className="group block p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all"
            >
              <div className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                {label}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Savings rate check →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Built on official data */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-t border-gray-100">
        <div className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built on official data</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">Updated 2023–2024</span>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Household expenditure surveys</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Every benchmark comes from national household expenditure surveys — not estimates, not crowdsourcing. Each expected savings rate is derived from real income-quintile data for that country.
            </p>
            <Link href="/methodology" className="text-sm font-semibold text-teal-600 hover:underline">
              See methodology →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {[
              { name: "BLS CEX",    note: "US Consumer Expenditure Survey 2023 — income quintile savings rates" },
              { name: "ONS LCF",    note: "UK Living Costs & Food Survey FYE2024 — decile household data" },
              { name: "Destatis",   note: "German Einkommens- und Verbrauchsstichprobe (EVS) 2023" },
              { name: "INSEE BdF",  note: "French Budget de Famille survey — household income/expenditure" },
              { name: "ABS HES",    note: "Australian Household Expenditure Survey 2019–20" },
              { name: "StatsCan",   note: "Survey of Household Spending 2023 — Canadian quintile data" },
              { name: "CBS HBS",    note: "Netherlands Household Budget Survey — CBS 2022" },
              { name: "SCB HEK",    note: "Swedish Household Economy Survey (HEK) 2022" },
              { name: "Stats NZ",   note: "New Zealand Household Economic Survey 2022–23" },
            ].map(({ name, note }) => (
              <div key={name} className="flex items-start gap-4 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                <span className="text-sm font-bold text-teal-600 w-24 flex-shrink-0">{name}</span>
                <span className="text-sm text-gray-400 leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog teaser */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">From the blog</h2>
          <Link href="/blog" className="text-sm text-teal-600 font-semibold hover:underline">All articles →</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[...BLOG_POSTS]
            .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
            .slice(0, 2)
            .map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block p-5 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{post.description}</p>
              </Link>
            ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="bg-gray-900 rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Still not sure where you stand?
          </h2>
          <p className="text-gray-400">30 seconds. No email. No login.</p>
          <ScrollToTopButton />
        </div>
      </section>
    </>
  );
}
