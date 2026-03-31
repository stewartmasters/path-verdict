import { type CityData } from "@/lib/cities";
import { getCountry, type IncomeBand } from "@/lib/countries";
import { calculatePath, formatAmount, VERDICT_CONFIG, type PathResult } from "@/lib/savings-data";

interface Props {
  city: CityData;
}

export default function CityCostBreakdown({ city }: Props) {
  const country = getCountry(city.countrySlug);
  if (!country) return null;

  const sym = country.currencySymbol;
  const pos = country.currencyPosition;
  const fmt = (n: number) => formatAmount(n, sym, pos);

  // Rent tiers: 75%, median (100%), 130% of city median
  const rentLow    = Math.round(city.medianRent * 0.75 / 100) * 100;
  const rentMid    = city.medianRent;
  const rentHigh   = Math.round(city.medianRent * 1.3 / 100) * 100;

  // Income scenarios: bands 2, 3, 4
  const scenarioBands = ["band-2", "band-3", "band-4"] as const;
  type Scenario = { band: IncomeBand; result: PathResult; config: typeof VERDICT_CONFIG[keyof typeof VERDICT_CONFIG] };
  const scenarios: Scenario[] = scenarioBands.flatMap((bandSlug) => {
    const band = country.incomeBands.find((b) => b.slug === bandSlug);
    if (!band) return [];
    const result = calculatePath({
      countrySlug:     city.countrySlug,
      incomeBandSlug:  bandSlug,
      monthlyRent:     city.medianRent,
      expenseBandSlug: city.typicalOtherBandSlug,
    });
    const config = VERDICT_CONFIG[result.verdict];
    return [{ band, result, config }];
  });

  return (
    <div className="space-y-6 my-6">
      {/* Rent tiers */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Rent in {city.name}</h3>
        <div className="space-y-2">
          {[
            { label: "Budget",   value: `${fmt(rentLow)} – ${fmt(Math.round(rentMid * 0.9 / 50) * 50)}/mo` },
            { label: "Typical",  value: `${fmt(rentMid)} – ${fmt(Math.round(rentMid * 1.15 / 50) * 50)}/mo`, highlight: true },
            { label: "Premium",  value: `${fmt(rentHigh)}+/mo` },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm ${
                highlight ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700"
              }`}
            >
              <span className={`font-medium ${highlight ? "text-gray-300" : "text-gray-500"}`}>{label}</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Other costs */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Other monthly costs</h3>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Food, transport, bills, going out</span>
            <span className="font-bold text-gray-900">~{fmt(city.typicalOther)}/mo</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-700">Total typical monthly spend</span>
            <span className="font-extrabold text-gray-900">~{fmt(city.medianRent + city.typicalOther)}/mo</span>
          </div>
        </div>
      </div>

      {/* Income scenarios */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">How different incomes stack up</h3>
        <p className="text-xs text-gray-400 mb-3">At typical {city.name} costs ({fmt(city.medianRent)} rent)</p>
        <div className="space-y-2">
          {scenarios.map(({ band, result, config }) => (
            <div key={band.slug} className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
              <div>
                <span className="font-semibold text-gray-700">{band.label}</span>
                <span className="text-gray-400 ml-2 text-xs">→ saving {result.savingsRate}%</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.badge}`}>
                {config.badgeLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
