import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";
import { CITIES } from "@/lib/cities";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

const COUNTRY_URL_SLUGS: Record<string, string> = {
  us: "united-states", gb: "united-kingdom", de: "germany",
  fr: "france",        au: "australia",      ca: "canada",
  ie: "ireland",       nl: "netherlands",    es: "spain",
  se: "sweden",        nz: "new-zealand",
};

export const metadata: Metadata = {
  title: "Financial Position by City — Savings Rate Benchmarks",
  description: "Check your savings rate against official household data for 83 cities across 11 countries. Free, instant, no signup.",
  alternates: { canonical: `${BASE_URL}/financial-position` },
  openGraph: {
    title: "Financial Position by City — Savings Rate Benchmarks",
    description: "Savings rate benchmarks for 83 cities across 11 countries, sourced from official household expenditure surveys.",
    url: `${BASE_URL}/financial-position`,
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
};

export default function FinancialPositionIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">Financial Position</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          Financial position by city
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          Select a city to see savings rate benchmarks for your income level, pre-set for local rent and costs.
          Data sourced from official household expenditure surveys across 11 countries.
        </p>
      </div>

      <div className="space-y-10">
        {COUNTRIES.map((country) => {
          const cities = CITIES.filter((c) => c.countrySlug === country.slug);
          if (cities.length === 0) return null;
          const countryUrl = COUNTRY_URL_SLUGS[country.slug];
          return (
            <div key={country.slug}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900">
                  {country.flag} {country.label}
                </h2>
                {countryUrl && (
                  <Link
                    href={`/financial-position/country/${countryUrl}`}
                    className="text-xs font-semibold text-teal-600 hover:underline"
                  >
                    {country.label} benchmarks →
                  </Link>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/financial-position/${city.slug}`}
                    className="group flex items-center justify-between rounded-lg border border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50 px-4 py-2.5 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">{city.name}</span>
                    <span className="text-xs text-gray-400 capitalize">{city.costTier.replace("-", " ")}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
