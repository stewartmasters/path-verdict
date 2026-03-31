import Link from "next/link";
import { type CityData } from "@/lib/cities";
import { CITIES } from "@/lib/cities";

interface Props {
  city: CityData;
  currentPage: "financial-position" | "affordability";
}

export default function CityInternalLinks({ city, currentPage }: Props) {
  const nearbyCities = city.nearbySlug
    .map((slug) => CITIES.find((c) => c.slug === slug))
    .filter(Boolean) as CityData[];

  return (
    <div className="border-t border-gray-100 pt-8 mt-8 space-y-6">
      {/* Switch page type */}
      <div className="flex flex-wrap gap-3">
        {currentPage === "financial-position" ? (
          <Link
            href={`/affordability/${city.slug}`}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            See full cost breakdown for {city.name} →
          </Link>
        ) : (
          <Link
            href={`/financial-position/${city.slug}`}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Check your savings rate in {city.name} →
          </Link>
        )}
      </div>

      {/* Nearby cities */}
      {nearbyCities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Compare nearby cities</p>
          <div className="flex flex-wrap gap-2">
            {nearbyCities.map((nearby) => (
              <Link
                key={nearby.slug}
                href={`/${currentPage}/${nearby.slug}`}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
              >
                {nearby.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Verdict suite */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Also in the Verdict suite</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.salaryverdict.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
          >
            SalaryVerdict — Is your {city.name} salary competitive?
          </a>
          <a
            href="https://www.spendverdict.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
          >
            SpendVerdict — Is your {city.name} rent too high?
          </a>
        </div>
      </div>
    </div>
  );
}
