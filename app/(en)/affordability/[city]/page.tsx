import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CITIES, getCity, COST_TIER_LABEL } from "@/lib/cities";
import { getCountry } from "@/lib/countries";
import PathTool from "@/components/PathTool";
import CityCostBreakdown from "@/components/CityCostBreakdown";
import CityInternalLinks from "@/components/CityInternalLinks";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  const country = getCountry(city.countrySlug);
  return {
    title: `Cost of Living in ${city.name} — Is Your Salary Enough?`,
    description: `How much does it cost to live in ${city.name}? See rent ranges, typical monthly expenses, and find out if your income puts you ahead or behind. Free calculator.`,
    alternates: { canonical: `${BASE_URL}/affordability/${city.slug}` },
    openGraph: {
      title: `Cost of Living in ${city.name} — Is Your Salary Enough?`,
      description: `Rent, expenses and income benchmarks for ${city.name}. Check your financial position in 30 seconds.`,
      url: `${BASE_URL}/affordability/${city.slug}`,
    },
  };
}

export default async function AffordabilityPage(
  { params }: { params: Promise<{ city: string }> }
) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const country = getCountry(city.countrySlug);
  if (!country) notFound();

  const costTierLabel = COST_TIER_LABEL[city.costTier];

  // FAQ schema for income scenario questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:    `How much does it cost to live in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Typical monthly costs in ${city.name} are approximately ${country.currencySymbol}${city.medianRent.toLocaleString()} in rent and ${country.currencySymbol}${city.typicalOther.toLocaleString()} in other expenses, totalling around ${country.currencySymbol}${(city.medianRent + city.typicalOther).toLocaleString()}/month.`,
        },
      },
      {
        "@type": "Question",
        name:    `How much should I save in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Based on ${country.dataSource}, people at mid-range incomes in ${country.label} typically save 12–20% of gross income. In a ${costTierLabel} city like ${city.name}, housing costs can reduce this, particularly for renters.`,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Affordability", item: `${BASE_URL}/affordability` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${BASE_URL}/affordability/${city.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-500">Affordability</span>
          <span>›</span>
          <span className="text-gray-700 font-medium">{city.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            {city.name} · {country.currency} · {costTierLabel} city
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            Cost of living in {city.name} —{" "}
            <span className="text-teal-600">is your salary enough?</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            {city.rentContext} {city.savingsContext}
          </p>
        </div>

        {/* Cost breakdown */}
        <CityCostBreakdown city={city} />

        {/* Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            See your personal verdict for {city.name}
          </p>
          <PathTool defaultCountry={city.countrySlug} defaultRent={city.medianRent} />
        </div>

        {/* Data note */}
        <p className="text-xs text-gray-400 mb-8">
          Cost figures are estimates based on reported median rents and typical spending patterns.
          Savings benchmarks from {country.dataSource}. Figures in {country.currency}.
        </p>

        {/* Internal links */}
        <CityInternalLinks city={city} currentPage="affordability" />
      </div>
    </>
  );
}
