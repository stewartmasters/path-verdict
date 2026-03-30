/**
 * Company-type salary multipliers relative to the market median.
 *
 * Multipliers are derived from Levels.fyi Europe 2024, Glassdoor aggregates,
 * and Eurostat SES enterprise-size breakdowns. They represent the typical
 * base salary premium or discount vs the broad market median for a given role
 * and location — NOT total compensation.
 *
 * Role-category adjustments account for meaningful deviations from the
 * default multiplier (e.g. agencies pay engineers less but designers closer
 * to market; consultancies pay non-technical roles more than tech roles).
 */

export type CompanyType =
  | "big-tech"
  | "scale-up"
  | "enterprise"
  | "consultancy"
  | "startup"
  | "agency";

export interface CompanyTypeDef {
  type: CompanyType;
  label: string;
  description: string;
  multiplier: number;
  /** Per role-category overrides where this type diverges meaningfully */
  categoryOverrides?: Partial<Record<string, number>>;
  equity: boolean;
  equityNote?: string;
}

export const COMPANY_TYPES: CompanyTypeDef[] = [
  {
    type: "big-tech",
    label: "Big Tech",
    description: "FAANG, Spotify, Stripe, Booking.com, ASML, SAP, Zalando",
    multiplier: 1.42,
    categoryOverrides: {
      Marketing:    1.28, // marketing roles less premium at big tech EU than eng
      Sales:        1.35,
      Design:       1.38,
      Finance:      1.25,
      People:       1.22,
    },
    equity: true,
    equityNote: "Usually includes RSUs or options",
  },
  {
    type: "scale-up",
    label: "Scale-up",
    description: "Series B–D, 100–1,000 employees",
    multiplier: 1.18,
    equity: true,
    equityNote: "Usually includes options",
  },
  {
    type: "consultancy",
    label: "Consultancy",
    description: "McKinsey, BCG, Accenture, Capgemini, KPMG, Deloitte",
    multiplier: 1.08,
    categoryOverrides: {
      Engineering: 0.98, // tech consultancy pays slightly below market for eng
      Data:        1.02,
      Marketing:   1.12,
      Finance:     1.20,
      Strategy:    1.22,
      Operations:  1.15,
    },
    equity: false,
  },
  {
    type: "enterprise",
    label: "Large Corp",
    description: "Established non-tech corporations, 1,000+ employees",
    multiplier: 1.00, // = market median baseline
    equity: false,
  },
  {
    type: "startup",
    label: "Startup",
    description: "Seed to Series A, under 100 people",
    multiplier: 0.91,
    equity: true,
    equityNote: "Typically higher equity, lower base",
  },
  {
    type: "agency",
    label: "Agency",
    description: "Digital, creative, marketing, or PR agencies",
    multiplier: 0.83,
    categoryOverrides: {
      Design:      0.92, // agencies pay designers closer to market
      Marketing:   0.88,
      Engineering: 0.78,
    },
    equity: false,
  },
];

export function getCompanyTypeComparison(
  marketMedian: number,
  roleCategory: string,
  currency: string
): Array<{
  type: CompanyType;
  label: string;
  description: string;
  salary: number;
  currency: string;
  isBaseline: boolean;
  equity: boolean;
  equityNote?: string;
}> {
  return COMPANY_TYPES.map((ct) => {
    const multiplier = ct.categoryOverrides?.[roleCategory] ?? ct.multiplier;
    const salary = Math.round((marketMedian * multiplier) / 500) * 500;
    return {
      type: ct.type,
      label: ct.label,
      description: ct.description,
      salary,
      currency,
      isBaseline: ct.type === "enterprise",
      equity: ct.equity,
      equityNote: ct.equityNote,
    };
  }).sort((a, b) => b.salary - a.salary);
}
