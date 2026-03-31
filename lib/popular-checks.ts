import { calculatePath, buildIdentityCard, type PathInput, type PathResult, type IdentityCard } from "./savings-data";

export interface PopularCheck {
  id:            string;
  locationLabel: string; // "$118k in New York"
  hook:          string; // punchy one-liner
  flag:          string; // emoji
  citySlug:      string; // links to /financial-position/[city]
  input:         PathInput;
  result:        PathResult;
  identityCard:  IdentityCard;
}

// ─── Raw scenario definitions ─────────────────────────────────────────────────
// Each input maps to real income/expense bands from countries.ts.
// Verdicts are computed — not hard-coded — so they always reflect the live calculator.

const SCENARIOS: Array<{ id: string; locationLabel: string; hook: string; flag: string; citySlug: string; input: PathInput }> = [
  {
    id:            "denver-38k",
    locationLabel: "$38k in Denver",
    hook:          "Entry-level Denver. The rent won.",
    flag:          "🇺🇸",
    citySlug:      "denver",
    input: {
      countrySlug:     "us",
      incomeBandSlug:  "band-1", // $30–40k, mid $35k
      monthlyRent:     1600,
      monthlyOtherExpenses: 1750,
    },
  },
  {
    id:            "nyc-118k",
    locationLabel: "$118k in New York",
    hook:          "Six figures. Still not building.",
    flag:          "🇺🇸",
    citySlug:      "new-york",
    input: {
      countrySlug:     "us",
      incomeBandSlug:  "band-5", // $100–140k, mid $120k
      monthlyRent:     4200,
      monthlyOtherExpenses: 5000,
    },
  },
  {
    id:            "london-67k",
    locationLabel: "£67k in London",
    hook:          "London takes more than you give it.",
    flag:          "🇬🇧",
    citySlug:      "london",
    input: {
      countrySlug:     "gb",
      incomeBandSlug:  "band-4", // £50–70k, mid £60k
      monthlyRent:     2200,
      monthlyOtherExpenses: 1900,
    },
  },
  {
    id:            "manchester-44k",
    locationLabel: "£44k in Manchester",
    hook:          "Northern salary. Quietly better off.",
    flag:          "🇬🇧",
    citySlug:      "manchester",
    input: {
      countrySlug:     "gb",
      incomeBandSlug:  "band-3", // £35–50k, mid £42.5k
      monthlyRent:     850,
      monthlyOtherExpenses: 1000,
    },
  },
  {
    id:            "dublin-55k",
    locationLabel: "€55k in Dublin",
    hook:          "Dublin rent vs. a Dublin salary — who wins?",
    flag:          "🇮🇪",
    citySlug:      "dublin",
    input: {
      countrySlug:     "ie",
      incomeBandSlug:  "band-3", // €45–62k, mid €53.5k
      monthlyRent:     2100,
      monthlyOtherExpenses: 2100,
    },
  },
  {
    id:            "sydney-78k",
    locationLabel: "A$78k in Sydney",
    hook:          "Big rent. Not much left.",
    flag:          "🇦🇺",
    citySlug:      "sydney",
    input: {
      countrySlug:     "au",
      incomeBandSlug:  "band-3", // A$70–95k, mid A$82.5k
      monthlyRent:     2800,
      monthlyOtherExpenses: 3850,
    },
  },
  {
    id:            "berlin-58k",
    locationLabel: "€58k in Berlin",
    hook:          "Berlin is still cheap. Are you using that?",
    flag:          "🇩🇪",
    citySlug:      "berlin",
    input: {
      countrySlug:     "de",
      incomeBandSlug:  "band-4", // €50–70k, mid €60k
      monthlyRent:     1050,
      monthlyOtherExpenses: 1000,
      invests:         "yes",
    },
  },
  {
    id:            "toronto-47k",
    locationLabel: "C$47k in Toronto",
    hook:          "Toronto on C$47k — keeping pace, barely.",
    flag:          "🇨🇦",
    citySlug:      "toronto",
    input: {
      countrySlug:     "ca",
      incomeBandSlug:  "band-2", // C$40–55k, mid C$47.5k
      monthlyRent:     2200,
      monthlyOtherExpenses: 1750,
    },
  },
  {
    id:            "auckland-69k",
    locationLabel: "NZ$69k in Auckland",
    hook:          "Auckland prices on one Auckland salary.",
    flag:          "🇳🇿",
    citySlug:      "auckland",
    input: {
      countrySlug:     "nz",
      incomeBandSlug:  "band-3", // NZ$58–80k, mid NZ$69k
      monthlyRent:     2400,
      monthlyOtherExpenses: 2800,
    },
  },
  {
    id:            "stockholm-720k",
    locationLabel: "720k kr in Stockholm",
    hook:          "Swedish income. Swedish discipline.",
    flag:          "🇸🇪",
    citySlug:      "stockholm",
    input: {
      countrySlug:     "se",
      incomeBandSlug:  "band-4", // 600–800k kr, mid 700k
      monthlyRent:     9500,
      monthlyOtherExpenses: 10500,
      invests:         "yes",
    },
  },
];

// ─── Pre-compute results at module level ──────────────────────────────────────

export const POPULAR_CHECKS: PopularCheck[] = SCENARIOS.map((s) => {
  const result      = calculatePath(s.input);
  const identityCard = buildIdentityCard(result);
  return { ...s, result, identityCard };
});
