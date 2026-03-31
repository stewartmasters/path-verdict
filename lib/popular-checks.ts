import { calculatePath, buildIdentityCard, type PathInput, type PathResult, type IdentityCard } from "./savings-data";

export interface PopularCheck {
  id:            string;
  locationLabel: string; // "$118k in New York"
  hook:          string; // punchy one-liner
  flag:          string; // emoji
  input:         PathInput;
  result:        PathResult;
  identityCard:  IdentityCard;
}

// ─── Raw scenario definitions ─────────────────────────────────────────────────
// Each input maps to real income/expense bands from countries.ts.
// Verdicts are computed — not hard-coded — so they always reflect the live calculator.

const SCENARIOS: Array<{ id: string; locationLabel: string; hook: string; flag: string; input: PathInput }> = [
  {
    id:            "denver-38k",
    locationLabel: "$38k in Denver",
    hook:          "Entry-level Denver. The rent won.",
    flag:          "🇺🇸",
    input: {
      countrySlug:     "us",
      incomeBandSlug:  "band-1", // $30–40k, mid $35k
      monthlyRent:     1600,
      expenseBandSlug: "exp-3",  // $1,500–2,000, mid $1,750
    },
  },
  {
    id:            "nyc-118k",
    locationLabel: "$118k in New York",
    hook:          "Six figures. Still not building.",
    flag:          "🇺🇸",
    input: {
      countrySlug:     "us",
      incomeBandSlug:  "band-5", // $100–140k, mid $120k
      monthlyRent:     4200,
      expenseBandSlug: "exp-6",  // $3,750+, mid $5,000
    },
  },
  {
    id:            "london-67k",
    locationLabel: "£67k in London",
    hook:          "London takes more than you give it.",
    flag:          "🇬🇧",
    input: {
      countrySlug:     "gb",
      incomeBandSlug:  "band-4", // £50–70k, mid £60k
      monthlyRent:     2200,
      expenseBandSlug: "exp-4",  // £1,600–2,200, mid £1,900
    },
  },
  {
    id:            "manchester-44k",
    locationLabel: "£44k in Manchester",
    hook:          "Northern salary. Quietly better off.",
    flag:          "🇬🇧",
    input: {
      countrySlug:     "gb",
      incomeBandSlug:  "band-3", // £35–50k, mid £42.5k
      monthlyRent:     850,
      expenseBandSlug: "exp-2",  // £800–1,200, mid £1,000
    },
  },
  {
    id:            "dublin-55k",
    locationLabel: "€55k in Dublin",
    hook:          "Dublin rent vs. a Dublin salary — who wins?",
    flag:          "🇮🇪",
    input: {
      countrySlug:     "ie",
      incomeBandSlug:  "band-3", // €45–62k, mid €53.5k
      monthlyRent:     2100,
      expenseBandSlug: "exp-4",  // €1,800–2,400, mid €2,100
    },
  },
  {
    id:            "sydney-78k",
    locationLabel: "A$78k in Sydney",
    hook:          "Big rent. Not much left.",
    flag:          "🇦🇺",
    input: {
      countrySlug:     "au",
      incomeBandSlug:  "band-3", // A$70–95k, mid A$82.5k
      monthlyRent:     2800,
      expenseBandSlug: "exp-5",  // A$3,200–4,500, mid A$3,850
    },
  },
  {
    id:            "berlin-58k",
    locationLabel: "€58k in Berlin",
    hook:          "Berlin is still cheap. Are you using that?",
    flag:          "🇩🇪",
    input: {
      countrySlug:     "de",
      incomeBandSlug:  "band-4", // €50–70k, mid €60k
      monthlyRent:     1050,
      expenseBandSlug: "exp-2",  // €800–1,200, mid €1,000
      invests:         "yes",
    },
  },
  {
    id:            "toronto-47k",
    locationLabel: "C$47k in Toronto",
    hook:          "Toronto on C$47k — keeping pace, barely.",
    flag:          "🇨🇦",
    input: {
      countrySlug:     "ca",
      incomeBandSlug:  "band-2", // C$40–55k, mid C$47.5k
      monthlyRent:     2200,
      expenseBandSlug: "exp-3",  // C$1,500–2,000, mid C$1,750
    },
  },
  {
    id:            "auckland-69k",
    locationLabel: "NZ$69k in Auckland",
    hook:          "Auckland prices on one Auckland salary.",
    flag:          "🇳🇿",
    input: {
      countrySlug:     "nz",
      incomeBandSlug:  "band-3", // NZ$58–80k, mid NZ$69k
      monthlyRent:     2400,
      expenseBandSlug: "exp-4",  // NZ$2,400–3,200, mid NZ$2,800
    },
  },
  {
    id:            "stockholm-720k",
    locationLabel: "720k kr in Stockholm",
    hook:          "Swedish income. Swedish discipline.",
    flag:          "🇸🇪",
    input: {
      countrySlug:     "se",
      incomeBandSlug:  "band-4", // 600–800k kr, mid 700k
      monthlyRent:     9500,
      expenseBandSlug: "exp-3",  // 9,000–12,000 kr, mid 10,500
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
