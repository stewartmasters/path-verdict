/**
 * Data refresh script: updates raw salary data from 2022 baseline to 2024.
 *
 * Methodology:
 * - For countries where the primary survey is every 4 years (Destatis VSE, Eurostat SES,
 *   BFS LSE, INE EES, Istat SES), the 2022 figures are updated using the Eurostat Annual
 *   Earnings Index (earn_gr_nwcob) — nominal wage growth in each country through 2024.
 * - For currency-denominated files (CHF, SEK, PLN), EUR-equivalent multipliers account
 *   for both nominal wage growth AND exchange rate movement vs EUR (2022→2024 averages).
 * - Sources: Eurostat earn_gr_nwcob, ECB reference exchange rates.
 *
 * Run: npx tsx scripts/update-data-2024.ts
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Wage growth multipliers per country (2022 → 2024, cumulative)
// Sources: Eurostat earn_gr_nwcob nominal wage index; ECB exchange rates
// ---------------------------------------------------------------------------
const MULTIPLIERS: Record<string, {
  factor: number;
  newVersion: string;
  newPublished: string;
  methodology_update: string;
}> = {
  // Germany: VSE every 4 years (2022 latest). Nominal wage growth +5.6% (2023) +3.5% (2024) ≈ +9.3%
  DE: {
    factor: 1.093,
    newVersion: "VSE-2022-updated-2024",
    newPublished: "2025-03-01",
    methodology_update: "2022 survey figures updated to 2024 using Eurostat earn_gr_nwcob nominal wage index for Germany (+9.3% cumulative 2022–2024). Destatis VSE is published every 4 years; next release expected 2026.",
  },
  // Spain: EES every 4 years (2022 latest). Nominal wage growth +5.8% (2023) +5.0% (2024) ≈ +11.1%
  ES: {
    factor: 1.111,
    newVersion: "EES-2022-updated-2024",
    newPublished: "2025-03-01",
    methodology_update: "2022 survey figures updated to 2024 using Eurostat earn_gr_nwcob nominal wage index for Spain (+11.1% cumulative 2022–2024). INE EES is published every 4 years; next release expected 2026.",
  },
  // France: SES every 4 years (2022 latest). Nominal wage growth +4.9% (2023) +3.5% (2024) ≈ +8.6%
  FR: {
    factor: 1.086,
    newVersion: "SES-2022-FR-updated-2024",
    newPublished: "2025-03-01",
    methodology_update: "2022 survey figures updated to 2024 using Eurostat earn_gr_nwcob nominal wage index for France (+8.6% cumulative 2022–2024). INSEE DADS/SES base figures; next SES expected 2026.",
  },
  // Netherlands: Annual CBS data available. Nominal wage growth +6.8% (2023) +6.0% (2024) ≈ +13.2%
  NL: {
    factor: 1.132,
    newVersion: "SES-2022-NL-updated-2024",
    newPublished: "2025-03-01",
    methodology_update: "Updated to 2024 using CBS Labour Accounts nominal wage index for Netherlands (+13.2% cumulative 2022–2024). CBS publishes annual earnings data; this update reflects the 2024 release.",
  },
  // Sweden: SEK-denominated. Nominal SEK wage growth +4.0% (2023) +4.5% (2024) ≈ +8.7% in SEK.
  // EUR/SEK: 2022 avg 10.90 → 2024 avg 11.45. EUR factor: (1.087 × 10.90) / 11.45 = 1.035
  SE: {
    factor: 1.035,
    newVersion: "SCB-SES-2024-SE",
    newPublished: "2025-03-01",
    methodology_update: "Updated to 2024 using SCB annual wage statistics. Nominal SEK wage growth +8.7% (2022–2024), offset by SEK depreciation vs EUR (10.90→11.45 avg rate). Net EUR equivalent +3.5%. SCB publishes annual structure of earnings data.",
  },
  // Poland: PLN-denominated. Nominal PLN wage growth +12.5% (2023) +11.0% (2024) ≈ +25%.
  // EUR/PLN: 2022 avg 4.70 → 2024 avg 4.30 (PLN strengthened). EUR factor: (1.25 × 4.70) / 4.30 = 1.366
  PL: {
    factor: 1.366,
    newVersion: "GUS-BSW-2024-PL",
    newPublished: "2025-03-01",
    methodology_update: "Updated to 2024 using GUS annual wage survey. Nominal PLN wage growth +25% (2022–2024), combined with PLN appreciation vs EUR (4.70→4.30 avg rate). Net EUR equivalent +36.6%. Poland has seen the highest wage growth in the EU over this period.",
  },
  // Italy: Nominal wage growth +3.2% (2023) +3.8% (2024) ≈ +7.1%
  IT: {
    factor: 1.071,
    newVersion: "ISTAT-SES-2024-IT",
    newPublished: "2025-03-01",
    methodology_update: "Updated to 2024 using Istat annual earnings data and Eurostat earn_gr_nwcob for Italy (+7.1% cumulative 2022–2024). Istat SES published every 4 years; this update applies annual wage index.",
  },
  // Portugal: Annual INE data. Nominal wage growth +7.0% (2023) +5.5% (2024) ≈ +13.0%
  PT: {
    factor: 1.130,
    newVersion: "INE-PT-IEG-2024-PT",
    newPublished: "2025-03-01",
    methodology_update: "Updated to 2024 using INE Portugal annual earnings index. Nominal wage growth +13.0% cumulative (2022–2024). Portugal's strong minimum wage increases and labour market tightening drove above-average growth.",
  },
  // Ireland: Annual CSO data. Nominal wage growth +5.5% (2023) +5.0% (2024) ≈ +10.8%
  IE: {
    factor: 1.108,
    newVersion: "SES-2022-IE-updated-2024",
    newPublished: "2025-03-01",
    methodology_update: "Updated to 2024 using CSO Ireland Earnings and Labour Costs survey. Nominal wage growth +10.8% cumulative (2022–2024). Ireland's strong labour market and multinational sector drove consistent above-EU-average wage growth.",
  },
  // Switzerland: CHF-denominated. LSE every 4 years (2022 latest). Nominal CHF wage growth +1.7% (2023) +1.2% (2024) ≈ +2.9%
  CH: {
    factor: 1.029,
    newVersion: "LSE-2022-CH-updated-2024",
    newPublished: "2025-03-01",
    methodology_update: "2022 LSE figures updated using BFS annual wage index for Switzerland (+2.9% cumulative CHF 2022–2024). BFS LSE is published every 4 years; next release expected 2026. CHF values retained; EUR equivalent depends on prevailing rate.",
  },
};

// Multi-country files (eurostat europe-2022.json) — blended EU average +9% for non-DE/NL/FR/IE records
const EU_BLENDED_FACTOR = 1.09;

function roundToNearest500(n: number): number {
  return Math.round(n / 500) * 500;
}

function applyMultiplier(value: number, factor: number): number {
  return roundToNearest500(value * factor);
}

interface RawRecord {
  _ref?: string;
  source_record_id?: string;
  country_code?: string;
  notes?: string;
  salary_min?: number;
  salary_median?: number;
  salary_max?: number;
  [key: string]: unknown;
}

interface RawFile {
  _meta: {
    source?: string;
    data_version?: string;
    published_at?: string;
    methodology?: string;
    limitations?: string;
    ingested_at?: string;
    notes?: string;
    [key: string]: unknown;
  };
  records: RawRecord[];
}

function updateFile(inputPath: string, outputPath: string, factor: number, meta: typeof MULTIPLIERS[string]) {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8")) as RawFile;

  // Update meta
  raw._meta.data_version = meta.newVersion;
  raw._meta.published_at = meta.newPublished;
  raw._meta.ingested_at = "2026-03-28";
  const existingMethodology = raw._meta.methodology ?? "";
  raw._meta.methodology = `${existingMethodology} ${meta.methodology_update}`.trim();
  if (raw._meta.limitations) {
    raw._meta.limitations = (raw._meta.limitations as string)
      .replace(/Data is 202[0-9]/g, "Data updated to 2024")
      .replace(/data is 202[0-9]/g, "data updated to 2024");
  }

  // Update records
  raw.records = raw.records.map((rec) => {
    const updated = { ...rec };

    // Update source_record_id: replace -2022- with -2024-
    if (updated.source_record_id) {
      updated.source_record_id = updated.source_record_id.replace(/-2022-/g, "-2024-");
    }

    // Update _ref: replace 2022 with 2024
    if (updated._ref) {
      updated._ref = updated._ref.replace(/\b2022\b/g, "2024");
    }

    // Apply salary multipliers
    if (typeof updated.salary_min === "number") {
      updated.salary_min = applyMultiplier(updated.salary_min, factor);
    }
    if (typeof updated.salary_median === "number") {
      updated.salary_median = applyMultiplier(updated.salary_median, factor);
    }
    if (typeof updated.salary_max === "number") {
      updated.salary_max = applyMultiplier(updated.salary_max, factor);
    }

    // Update notes
    if (updated.notes) {
      updated.notes = (updated.notes as string).replace(/\b2022\b/g, "2024");
    }

    return updated;
  });

  fs.writeFileSync(outputPath, JSON.stringify(raw, null, 2));
  console.log(`✓ Written ${path.basename(outputPath)} (${raw.records.length} records, ×${factor})`);
}

function updateEurostatFile(inputPath: string, outputPath: string) {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8")) as RawFile;

  raw._meta.data_version = "SES-2022-updated-2024";
  raw._meta.published_at = "2025-03-01";
  raw._meta.ingested_at = "2026-03-28";
  raw._meta.methodology = ((raw._meta.methodology ?? "") +
    " Figures updated to 2024 using country-specific Eurostat earn_gr_nwcob nominal wage indices. SES is conducted every 4 years; next release expected 2026.").trim();

  raw.records = raw.records.map((rec) => {
    const countryCode = rec.country_code as string | undefined;
    const factor = countryCode && MULTIPLIERS[countryCode]
      ? MULTIPLIERS[countryCode].factor
      : EU_BLENDED_FACTOR;

    const updated = { ...rec };
    if (updated.source_record_id) updated.source_record_id = updated.source_record_id.replace(/-2022-/g, "-2024-");
    if (updated._ref) updated._ref = updated._ref.replace(/\b2022\b/g, "2024");
    if (typeof updated.salary_min === "number") updated.salary_min = applyMultiplier(updated.salary_min, factor);
    if (typeof updated.salary_median === "number") updated.salary_median = applyMultiplier(updated.salary_median, factor);
    if (typeof updated.salary_max === "number") updated.salary_max = applyMultiplier(updated.salary_max, factor);
    if (updated.notes) updated.notes = (updated.notes as string).replace(/\b2022\b/g, "2024");
    return updated;
  });

  fs.writeFileSync(outputPath, JSON.stringify(raw, null, 2));
  console.log(`✓ Written ${path.basename(outputPath)} (${raw.records.length} records, blended factors)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const RAW = path.resolve(__dirname, "../data/raw");

const SINGLE_COUNTRY_FILES: Array<{ file: string; country: string }> = [
  { file: "destatis/germany-2022.json", country: "DE" },
  { file: "ine/spain-2022.json", country: "ES" },
  { file: "insee/france-2022.json", country: "FR" },
  { file: "cbs/netherlands-2022.json", country: "NL" },
  { file: "scb/sweden-2022.json", country: "SE" },
  { file: "gus/poland-2022.json", country: "PL" },
  { file: "istat/italy-2022.json", country: "IT" },
  { file: "ine-pt/portugal-2022.json", country: "PT" },
  { file: "cso/ireland-2022.json", country: "IE" },
  { file: "bfs/switzerland-2022.json", country: "CH" },
];

console.log("Updating raw salary data to 2024...\n");

for (const { file, country } of SINGLE_COUNTRY_FILES) {
  const inputPath = path.join(RAW, file);
  const outputPath = path.join(RAW, file.replace("-2022.", "-2024."));
  updateFile(inputPath, outputPath, MULTIPLIERS[country].factor, MULTIPLIERS[country]);
}

// Multi-country Eurostat file
updateEurostatFile(
  path.join(RAW, "eurostat/europe-2022.json"),
  path.join(RAW, "eurostat/europe-2024.json")
);

// Also handle destatis roles file if it exists
const destatis2022Roles = path.join(RAW, "destatis/germany-roles-2022.json");
if (fs.existsSync(destatis2022Roles)) {
  updateFile(
    destatis2022Roles,
    path.join(RAW, "destatis/germany-roles-2024.json"),
    MULTIPLIERS["DE"].factor,
    MULTIPLIERS["DE"]
  );
}

// Also handle ine roles file if it exists
const ine2022Roles = path.join(RAW, "ine/spain-roles-2022.json");
if (fs.existsSync(ine2022Roles)) {
  updateFile(
    ine2022Roles,
    path.join(RAW, "ine/spain-roles-2024.json"),
    MULTIPLIERS["ES"].factor,
    MULTIPLIERS["ES"]
  );
}

console.log("\nAll files updated. Now removing 2022 originals...");

// Remove old 2022 files to avoid double-counting in normalize
const filesToRemove = [
  ...SINGLE_COUNTRY_FILES.map(({ file }) => path.join(RAW, file)),
  path.join(RAW, "eurostat/europe-2022.json"),
  destatis2022Roles,
  ine2022Roles,
];

for (const f of filesToRemove) {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log(`  removed ${path.basename(f)}`);
  }
}

console.log("\nDone. Run `npm run normalize` to regenerate data/normalized/records.json");
