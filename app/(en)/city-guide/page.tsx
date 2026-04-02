import type { Metadata } from "next";
import Link from "next/link";
import { getAllCityGuides } from "@/lib/cityGuide";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const metadata: Metadata = {
  title: "City Savings Rate Guides — PathVerdict",
  description:
    "Average savings rates, cost of living, and financial benchmarks by city worldwide. Find out how much people actually save where you live.",
  alternates: { canonical: `${BASE_URL}/city-guide` },
  openGraph: {
    title: "City Savings Rate Guides — PathVerdict",
    description: "Average savings rates and financial benchmarks by city worldwide.",
    url: `${BASE_URL}/city-guide`,
    images: [{ url: `${BASE_URL}/og.svg`, width: 1200, height: 630 }],
  },
};

export default function CityGuideIndex() {
  const guides = getAllCityGuides();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">City Guides</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          Savings rate guides by city
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          What do people actually save in London, Berlin, Singapore? City-level savings rate benchmarks, cost of living breakdowns, and financial context for major cities worldwide.
        </p>
      </div>

      {guides.length === 0 ? (
        <p className="text-gray-500 text-sm">No guides yet — check back soon.</p>
      ) : (
        <div className="space-y-6">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/city-guide/${guide.slug}`}
              className="group block p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-gray-400">
                  {!isNaN(new Date(guide.date).getTime()) ? new Date(guide.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400">{guide.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-2 leading-snug">
                {guide.title}
              </h2>
              {guide.description && (
                <p className="text-sm text-gray-500 leading-relaxed">
                  {guide.description}
                </p>
              )}
              <span className="inline-block mt-3 text-xs font-semibold text-teal-600 group-hover:text-teal-700">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="bg-gray-900 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">How does your savings rate compare?</h2>
          <p className="text-gray-400 text-sm">Enter your income and expenses. Get a benchmarked verdict for your city in 30 seconds.</p>
          <Link
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Get my verdict →
          </Link>
        </div>
      </div>
    </div>
  );
}
