import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { COUNTRIES, getCountry, incomeSlugFromBand } from "@/lib/countries";
import { CITIES } from "@/lib/cities";
import PathTool from "@/components/PathTool";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

// Map CountryConfig.slug → URL segment
const COUNTRY_URL_SLUGS: Record<string, string> = {
  us: "united-states",
  gb: "united-kingdom",
  de: "germany",
  fr: "france",
  au: "australia",
  ca: "canada",
  ie: "ireland",
  nl: "netherlands",
  es: "spain",
  se: "sweden",
  nz: "new-zealand",
};

const URL_TO_COUNTRY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_URL_SLUGS).map(([k, v]) => [v, k])
);

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.values(COUNTRY_URL_SLUGS).map((c) => ({ country: c }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ country: string }> }
): Promise<Metadata> {
  const { country: urlSlug } = await params;
  const countrySlug = URL_TO_COUNTRY_SLUG[urlSlug];
  const country = countrySlug ? getCountry(countrySlug) : undefined;
  if (!country) return {};

  return {
    title: `Savings Rate Benchmarks in ${country.label} — ${country.dataYear} Data`,
    description: `What savings rate should you aim for in ${country.label}? See income band benchmarks from ${country.dataSource}. Find your city and check how you compare — free and instant.`,
    alternates: {
      canonical: `${BASE_URL}/financial-position/country/${urlSlug}`,
    },
    openGraph: {
      title: `Savings Rate Benchmarks in ${country.label}`,
      description: `Income-band savings benchmarks for ${country.label} from ${country.dataSource}.`,
      url: `${BASE_URL}/financial-position/country/${urlSlug}`,
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function CountryPage(
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: urlSlug } = await params;
  const countrySlug = URL_TO_COUNTRY_SLUG[urlSlug];
  if (!countrySlug) notFound();

  const country = getCountry(countrySlug);
  if (!country) notFound();

  const cities = CITIES.filter((c) => c.countrySlug === countrySlug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",               item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Financial Position", item: `${BASE_URL}/financial-position` },
      { "@type": "ListItem", position: 3, name: country.label,        item: `${BASE_URL}/financial-position/country/${urlSlug}` },
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
          <span className="text-gray-700 font-medium">{country.label}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            {country.flag} {country.label} · {country.currency} · {country.dataYear} data
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            Savings rate benchmarks in {country.label} —{" "}
            <span className="text-teal-600">are you on track?</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Based on {country.dataSource}, here is what people at each income level
            in {country.label} typically save — and how your city affects that benchmark.
          </p>
        </div>

        {/* Income band benchmark table */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Expected savings rate by income — {country.label}
          </h2>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Income range</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Expected savings rate</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {country.incomeBands.map((band, i) => {
                  const benchmark = country.benchmarks.find((b) => b.incomeBandSlug === band.slug);
                  const rate = benchmark ? Math.round(benchmark.expectedRate * 100) : null;
                  const incomeSlug = incomeSlugFromBand(band);
                  return (
                    <tr key={band.slug} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3 font-medium text-gray-700">{band.label}</td>
                      <td className="px-4 py-3 text-right">
                        {rate !== null ? (
                          <span className={`font-bold ${rate >= 20 ? "text-teal-600" : rate >= 10 ? "text-gray-700" : "text-orange-500"}`}>
                            {rate}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400 hidden sm:table-cell">
                        {benchmark?.source ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Source: {country.dataSource}. Rates represent gross income saved before tax. Coverage varies by income band.
          </p>
        </div>

        {/* Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Check your savings rate — pre-set for {country.label}
          </p>
          <PathTool defaultCountry={countrySlug} />
        </div>

        {/* City grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Cities in {country.label}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Select a city to see how local rent and costs affect your savings benchmark.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/financial-position/${city.slug}`}
                className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50 px-4 py-3 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-700">{city.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{city.costTier.replace("-", " ")} cost city</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Median rent</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {country.currencyPosition === "before"
                      ? `${country.currencySymbol}${city.medianRent.toLocaleString()}`
                      : `${city.medianRent.toLocaleString()}${country.currencySymbol}`}/mo
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Income bracket shortcuts */}
        {cities.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Browse by income bracket
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              See savings benchmarks for a specific income level across {country.label}&apos;s major cities.
            </p>
            <div className="flex flex-wrap gap-2">
              {country.incomeBands.map((band) => {
                const slug = incomeSlugFromBand(band);
                const firstCity = cities[0];
                return (
                  <Link
                    key={band.slug}
                    href={firstCity ? `/financial-position/${firstCity.slug}/${slug}` : "#"}
                    className="text-sm px-4 py-2 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 font-medium transition-colors"
                  >
                    {band.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Other countries */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Compare other countries</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.filter((c) => c.slug !== countrySlug).map((c) => {
              const slug = COUNTRY_URL_SLUGS[c.slug];
              return slug ? (
                <Link
                  key={c.slug}
                  href={`/financial-position/country/${slug}`}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                >
                  {c.flag} {c.label}
                </Link>
              ) : null;
            })}
          </div>
        </div>

      </div>
    </>
  );
}
