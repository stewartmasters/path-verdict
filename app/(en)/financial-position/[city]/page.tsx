import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CITIES, getCity, getCityBenchmarkRange, COST_TIER_LABEL } from "@/lib/cities";
import { getCountry, getBenchmarkRate } from "@/lib/countries";
import PathTool from "@/components/PathTool";
import CityBenchmarkBlock from "@/components/CityBenchmarkBlock";
import CityInternalLinks from "@/components/CityInternalLinks";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const dynamicParams = false;

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return {
    title: `Savings Rate in ${city.name} — Are You On Track?`,
    description: `See how your savings rate compares to others at your income level in ${city.name}. Benchmarked against real ${city.countrySlug.toUpperCase()} spending data. Free, instant, no signup.`,
    alternates: { canonical: `${BASE_URL}/financial-position/${city.slug}` },
    openGraph: {
      title: `Savings Rate in ${city.name} — Are You On Track?`,
      description: `Benchmark your financial position against real income data from ${city.name}.`,
      url: `${BASE_URL}/financial-position/${city.slug}`,
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function FinancialPositionPage(
  { params }: { params: Promise<{ city: string }> }
) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const country = getCountry(city.countrySlug);
  if (!country) notFound();

  const benchmarkRange = getCityBenchmarkRange(city);
  const costTierLabel  = COST_TIER_LABEL[city.costTier];

  // Benchmark context: mid-range rates for this country
  const loRate = Math.round(getBenchmarkRate(country, "band-2") * 100);
  const midRate = Math.round(getBenchmarkRate(country, "band-3") * 100);
  const hiRate  = Math.round(getBenchmarkRate(country, "band-5") * 100);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Financial Position", item: `${BASE_URL}/financial-position` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${BASE_URL}/financial-position/${city.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-500">Financial Position</span>
          <span>›</span>
          <span className="text-gray-700 font-medium">{city.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            {city.name} · {country.currency} · {costTierLabel} city
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            Savings rate in {city.name} —{" "}
            <span className="text-teal-600">are you on track?</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            {city.name} is a {costTierLabel} city. {city.rentContext} {city.savingsContext}
          </p>
        </div>

        {/* Benchmark block */}
        <CityBenchmarkBlock city={city} />

        {/* Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Pre-set for {city.name} — adjust to your situation
          </p>
          <PathTool defaultCountry={city.countrySlug} defaultRent={city.medianRent} />
        </div>

        {/* Benchmark context */}
        <div className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            What a good savings rate looks like in {city.name}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Using data from {country.dataSource}, people at mid-range incomes in{" "}
            {country.label} typically save between{" "}
            <strong className="text-gray-700">{benchmarkRange}</strong> of gross income.
            In a {costTierLabel} city like {city.name}, housing costs can compress that
            meaningfully — especially for renters.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Minimum", rate: `${loRate}%`,  sub: "floor — not building" },
              { label: "Expected", rate: `${midRate}%`, sub: "benchmark",  hl: true },
              { label: "Strong",   rate: `${hiRate}%`,  sub: "top tier" },
            ].map(({ label, rate, sub, hl }) => (
              <div key={label} className={`rounded-xl p-3 text-center ${hl ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                <div className="text-xs font-medium mb-1 text-gray-400">{label}</div>
                <div className={`font-bold text-base ${hl ? "text-white" : "text-gray-700"}`}>{rate}</div>
                <div className={`text-xs mt-0.5 ${hl ? "text-gray-500" : "text-gray-400"}`}>{sub}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Source: {country.dataSource}. Benchmarks shown for mid-income earners in {country.label}.
          </p>
        </div>

        {/* Internal links */}
        <CityInternalLinks city={city} currentPage="financial-position" />
      </div>
    </>
  );
}
