import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CITIES,
  getCity,
  getCityBenchmarkRange,
  COST_TIER_LABEL,
} from "@/lib/cities";
import {
  getCountry,
  getBenchmarkRate,
  incomeSlugFromBand,
  getBandFromIncomeSlug,
} from "@/lib/countries";
import PathTool from "@/components/PathTool";
import CityInternalLinks from "@/components/CityInternalLinks";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { city: string; income: string }[] = [];
  for (const city of CITIES) {
    const country = getCountry(city.countrySlug);
    if (!country) continue;
    for (const band of country.incomeBands) {
      params.push({ city: city.slug, income: incomeSlugFromBand(band) });
    }
  }
  return params;
}

export async function generateMetadata(
  { params }: { params: Promise<{ city: string; income: string }> }
): Promise<Metadata> {
  const { city: citySlug, income: incomeSlug } = await params;
  const city = getCity(citySlug);
  if (!city) return {};
  const country = getCountry(city.countrySlug);
  if (!country) return {};
  const band = getBandFromIncomeSlug(country, incomeSlug);
  if (!band) return {};

  const benchmark = country.benchmarks.find((b) => b.incomeBandSlug === band.slug);
  const expectedPct = benchmark ? Math.round(benchmark.expectedRate * 100) : 10;

  return {
    title: `Savings Rate in ${city.name} on ${band.label} — Are You On Track?`,
    description: `Earning ${band.label} in ${city.name}? People at this income level typically save ${expectedPct}% of gross income. See how you compare — free, instant, no signup.`,
    alternates: {
      canonical: `${BASE_URL}/financial-position/${city.slug}/${incomeSlug}`,
    },
    openGraph: {
      title: `Savings Rate in ${city.name} on ${band.label}`,
      description: `Benchmark your savings against real ${country.label} data for ${band.label} earners in ${city.name}.`,
      url: `${BASE_URL}/financial-position/${city.slug}/${incomeSlug}`,
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function FinancialPositionIncomePage(
  { params }: { params: Promise<{ city: string; income: string }> }
) {
  const { city: citySlug, income: incomeSlug } = await params;
  const city = getCity(citySlug);
  if (!city) notFound();

  const country = getCountry(city.countrySlug);
  if (!country) notFound();

  const band = getBandFromIncomeSlug(country, incomeSlug);
  if (!band) notFound();

  const benchmarkRange = getCityBenchmarkRange(city);
  const costTierLabel = COST_TIER_LABEL[city.costTier];

  const benchmark = country.benchmarks.find((b) => b.incomeBandSlug === band.slug);
  const expectedRate = benchmark?.expectedRate ?? 0.10;
  const expectedPct = Math.round(expectedRate * 100);

  // Neighbour bands for income navigation
  const bandIndex = country.incomeBands.findIndex((b) => b.slug === band.slug);
  const prevBand = bandIndex > 0 ? country.incomeBands[bandIndex - 1] : null;
  const nextBand = bandIndex < country.incomeBands.length - 1 ? country.incomeBands[bandIndex + 1] : null;

  // Context rates for the 3-column grid
  const loRate  = Math.round(getBenchmarkRate(country, "band-2") * 100);
  const midRate = Math.round(getBenchmarkRate(country, "band-3") * 100);
  const hiRate  = Math.round(getBenchmarkRate(country, "band-5") * 100);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",               item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Financial Position", item: `${BASE_URL}/financial-position` },
      { "@type": "ListItem", position: 3, name: city.name,            item: `${BASE_URL}/financial-position/${city.slug}` },
      { "@type": "ListItem", position: 4, name: band.label,           item: `${BASE_URL}/financial-position/${city.slug}/${incomeSlug}` },
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
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>›</span>
          <Link href={`/financial-position/${city.slug}`} className="hover:text-teal-600 transition-colors">{city.name}</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{band.label}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            {city.name} · {band.label} · {costTierLabel} city
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            Savings rate in {city.name} on {band.label} —{" "}
            <span className="text-teal-600">are you on track?</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Earning {band.label} in {city.name}? Based on {country.dataSource}, people at
            this income level in {country.label} typically save around{" "}
            <strong className="text-gray-700">{expectedPct}%</strong> of gross income.
            Enter your actual costs below to see how you compare.
          </p>
        </div>

        {/* Income band navigation */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Compare income brackets:</span>
          {country.incomeBands.map((b) => {
            const slug = incomeSlugFromBand(b);
            const isCurrent = b.slug === band.slug;
            return (
              <Link
                key={b.slug}
                href={`/financial-position/${city.slug}/${slug}`}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  isCurrent
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {slug}
              </Link>
            );
          })}
        </div>

        {/* Calculator pre-seeded for this income level */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Pre-set for {city.name} · {band.label} — adjust to your situation
          </p>
          <PathTool
            defaultCountry={city.countrySlug}
            defaultRent={city.medianRent}
            defaultIncome={band.midpoint}
          />
        </div>

        {/* Benchmark context */}
        <div className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            What {expectedPct}% savings means in {city.name}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Using {country.dataSource}, people earning {band.label} in {country.label} save
            around <strong className="text-gray-700">{expectedPct}%</strong> of gross income on average.
            In {city.name} — a {costTierLabel} city — housing costs typically run{" "}
            <strong className="text-gray-700">{benchmarkRange}</strong> of income, which
            {city.costTier === "very-high"
              ? " can significantly compress savings even at this income level."
              : city.costTier === "high"
              ? " puts real pressure on savings at lower income bands."
              : " leaves reasonable room to hit or beat the benchmark."}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Minimum", rate: `${loRate}%`,  sub: "floor — not building" },
              { label: "Expected", rate: `${midRate}%`, sub: "mid-income benchmark", hl: true },
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

        {/* Prev / next income band */}
        <div className="flex items-center justify-between mb-10 border-t border-gray-100 pt-6">
          {prevBand ? (
            <Link
              href={`/financial-position/${city.slug}/${incomeSlugFromBand(prevBand)}`}
              className="text-sm text-teal-600 hover:underline font-medium"
            >
              ← {prevBand.label}
            </Link>
          ) : <span />}
          {nextBand ? (
            <Link
              href={`/financial-position/${city.slug}/${incomeSlugFromBand(nextBand)}`}
              className="text-sm text-teal-600 hover:underline font-medium"
            >
              {nextBand.label} →
            </Link>
          ) : <span />}
        </div>

        {/* Internal links */}
        <CityInternalLinks city={city} currentPage="financial-position" />
      </div>
    </>
  );
}
