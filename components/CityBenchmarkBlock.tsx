import { type CityData, getCityBenchmarkRange, COST_TIER_LABEL } from "@/lib/cities";
import { getCountry } from "@/lib/countries";
import { formatAmount } from "@/lib/savings-data";

interface Props {
  city: CityData;
}

export default function CityBenchmarkBlock({ city }: Props) {
  const country = getCountry(city.countrySlug);
  if (!country) return null;

  const benchmarkRange = getCityBenchmarkRange(city);
  const fmtRent = formatAmount(city.medianRent, country.currencySymbol, country.currencyPosition);
  const fmtOther = formatAmount(city.typicalOther, country.currencySymbol, country.currencyPosition);

  return (
    <div className="grid grid-cols-3 gap-3 my-6">
      {[
        {
          label:  "Median rent",
          value:  `${fmtRent}/mo`,
          sub:    `${city.name} ${country.dataYear}`,
        },
        {
          label:  "Typical other costs",
          value:  `${fmtOther}/mo`,
          sub:    "excl. housing",
        },
        {
          label:  "Savings benchmark",
          value:  benchmarkRange,
          sub:    `mid-income ${country.currency}`,
        },
      ].map(({ label, value, sub }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
          <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">{value}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
