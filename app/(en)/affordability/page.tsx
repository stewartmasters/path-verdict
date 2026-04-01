import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";
import { CITIES, COST_TIER_LABEL } from "@/lib/cities";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const metadata: Metadata = {
  title: "Cost of Living by City — Is Your Salary Enough?",
  description: "Rent ranges, typical expenses, and income benchmarks for 83 cities across 11 countries. Find out if your salary covers your city's cost of living.",
  alternates: { canonical: `${BASE_URL}/affordability` },
  openGraph: {
    title: "Cost of Living by City — Is Your Salary Enough?",
    description: "Rent, expenses and income benchmarks for 83 cities across 11 countries.",
    url: `${BASE_URL}/affordability`,
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
};

export default function AffordabilityIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">Cost of Living</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          Cost of living by city
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          See rent ranges, typical monthly expenses, and income benchmarks for 83 cities.
          Find out if your salary is enough to live — and save — in your city.
        </p>
      </div>

      <div className="space-y-10">
        {COUNTRIES.map((country) => {
          const cities = CITIES.filter((c) => c.countrySlug === country.slug);
          if (cities.length === 0) return null;
          return (
            <div key={country.slug}>
              <h2 className="text-base font-bold text-gray-900 mb-3">
                {country.flag} {country.label}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/affordability/${city.slug}`}
                    className="group flex items-center justify-between rounded-lg border border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50 px-4 py-2.5 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">{city.name}</span>
                    <span className="text-xs text-gray-400">{COST_TIER_LABEL[city.costTier]}</span>
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
