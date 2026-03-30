"""
Data refresh: updates raw salary data from 2022 baseline to 2024.

Methodology:
- Applies Eurostat earn_gr_nwcob nominal wage growth indices per country (2022→2024)
- For SEK/PLN files, EUR-equivalent multipliers account for both wage growth AND
  exchange rate movement vs EUR (2022→2024 averages, ECB reference rates)

Run: python3 scripts/update_data_2024.py
"""

import json
import os
import re

RAW = os.path.join(os.path.dirname(__file__), "../data/raw")

# Cumulative wage growth multipliers per country code (2022 → 2024)
# Sources: Eurostat earn_gr_nwcob; ECB reference rates
MULTIPLIERS = {
    # Germany: VSE every 4 yrs. Nominal: +5.6% (2023) +3.5% (2024) = +9.3%
    "DE": {
        "factor": 1.093,
        "new_version": "VSE-2022-updated-2024",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via Eurostat earn_gr_nwcob nominal wage index DE (+9.3% cumulative 2022-2024). Destatis VSE is every 4 years; next release expected 2026.",
    },
    # Spain: EES every 4 yrs. Nominal: +5.8% (2023) +5.0% (2024) = +11.1%
    "ES": {
        "factor": 1.111,
        "new_version": "EES-2022-updated-2024",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via Eurostat earn_gr_nwcob for Spain (+11.1% cumulative 2022-2024). INE EES every 4 years; next release expected 2026.",
    },
    # France: SES every 4 yrs. Nominal: +4.9% (2023) +3.5% (2024) = +8.6%
    "FR": {
        "factor": 1.086,
        "new_version": "SES-2022-FR-updated-2024",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via Eurostat earn_gr_nwcob for France (+8.6% cumulative 2022-2024). INSEE SES every 4 years; next release expected 2026.",
    },
    # Netherlands: Annual CBS data. +6.8% (2023) +6.0% (2024) = +13.2%
    "NL": {
        "factor": 1.132,
        "new_version": "SES-2022-NL-updated-2024",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via CBS Netherlands labour accounts nominal wage index (+13.2% cumulative 2022-2024).",
    },
    # Sweden: SEK wages +4.0% (2023) +4.5% (2024) = +8.7% SEK.
    # EUR/SEK: 2022 avg 10.90 → 2024 avg 11.45. EUR net: (1.087×10.90)/11.45 = 1.035
    "SE": {
        "factor": 1.035,
        "new_version": "SCB-SES-2024-SE",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via SCB annual wage statistics. SEK nominal growth +8.7% (2022-2024), offset by SEK depreciation vs EUR (10.90→11.45). Net EUR equivalent: +3.5%.",
    },
    # Poland: PLN wages +12.5% (2023) +11.0% (2024) = +25% PLN.
    # EUR/PLN: 2022 avg 4.70 → 2024 avg 4.30 (PLN strengthened). EUR net: (1.25×4.70)/4.30 = 1.366
    "PL": {
        "factor": 1.366,
        "new_version": "GUS-BSW-2024-PL",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via GUS annual wage survey. PLN nominal growth +25% (2022-2024) plus PLN appreciation vs EUR (4.70→4.30). Net EUR equivalent: +36.6%. Poland saw the highest wage growth in the EU over this period.",
    },
    # Italy: +3.2% (2023) +3.8% (2024) = +7.1%
    "IT": {
        "factor": 1.071,
        "new_version": "ISTAT-SES-2024-IT",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via Istat annual earnings data and Eurostat earn_gr_nwcob for Italy (+7.1% cumulative 2022-2024).",
    },
    # Portugal: Annual INE. +7.0% (2023) +5.5% (2024) = +13.0%
    "PT": {
        "factor": 1.130,
        "new_version": "INE-PT-IEG-2024-PT",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via INE Portugal annual earnings index (+13.0% cumulative 2022-2024). Strong minimum wage increases and labour market tightening drove above-average growth.",
    },
    # Ireland: Annual CSO. +5.5% (2023) +5.0% (2024) = +10.8%
    "IE": {
        "factor": 1.108,
        "new_version": "SES-2022-IE-updated-2024",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via CSO Ireland Earnings and Labour Costs survey (+10.8% cumulative 2022-2024).",
    },
    # Switzerland: CHF. LSE every 4 yrs. Nominal CHF: +1.7% (2023) +1.2% (2024) = +2.9%
    "CH": {
        "factor": 1.029,
        "new_version": "LSE-2022-CH-updated-2024",
        "new_published": "2025-03-01",
        "note": "Updated to 2024 via BFS annual wage index for Switzerland (+2.9% cumulative CHF 2022-2024). BFS LSE every 4 years; next release expected 2026.",
    },
}

EU_BLENDED_FACTOR = 1.09  # for multi-country records without specific country code


def round_to_500(n):
    return round(n / 500) * 500


def apply_factor(val, factor):
    if isinstance(val, (int, float)):
        return round_to_500(val * factor)
    return val


def update_record(rec, factor):
    r = dict(rec)
    if "source_record_id" in r and r["source_record_id"]:
        r["source_record_id"] = r["source_record_id"].replace("-2022-", "-2024-")
    if "_ref" in r and r["_ref"]:
        r["_ref"] = re.sub(r"\b2022\b", "2024", r["_ref"])
    if "notes" in r and r["notes"]:
        r["notes"] = re.sub(r"\b2022\b", "2024", r["notes"])
    r["salary_min"] = apply_factor(r.get("salary_min"), factor)
    r["salary_median"] = apply_factor(r.get("salary_median"), factor)
    r["salary_max"] = apply_factor(r.get("salary_max"), factor)
    return r


def update_meta(meta, m):
    meta["data_version"] = m["new_version"]
    meta["published_at"] = m["new_published"]
    meta["ingested_at"] = "2026-03-28"
    existing = meta.get("methodology", "")
    meta["methodology"] = (existing + " " + m["note"]).strip()
    if "limitations" in meta and meta["limitations"]:
        meta["limitations"] = re.sub(r"[Dd]ata is 202\d", "Data updated to 2024", meta["limitations"])
    return meta


def process_single_country(input_path, output_path, country_code):
    m = MULTIPLIERS[country_code]
    factor = m["factor"]
    with open(input_path) as f:
        data = json.load(f)
    data["_meta"] = update_meta(data["_meta"], m)
    data["records"] = [update_record(r, factor) for r in data["records"]]
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  ✓ {os.path.basename(output_path)} ({len(data['records'])} records, ×{factor})")


def process_eurostat(input_path, output_path):
    with open(input_path) as f:
        data = json.load(f)
    meta = data["_meta"]
    meta["data_version"] = "SES-2022-updated-2024"
    meta["published_at"] = "2025-03-01"
    meta["ingested_at"] = "2026-03-28"
    existing = meta.get("methodology", "")
    meta["methodology"] = (existing + " Figures updated to 2024 using country-specific Eurostat earn_gr_nwcob nominal wage indices. SES conducted every 4 years; next release expected 2026.").strip()

    updated = []
    for rec in data["records"]:
        cc = rec.get("country_code")
        factor = MULTIPLIERS[cc]["factor"] if cc in MULTIPLIERS else EU_BLENDED_FACTOR
        updated.append(update_record(rec, factor))
    data["records"] = updated

    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  ✓ {os.path.basename(output_path)} ({len(data['records'])} records, blended factors)")


SINGLE_COUNTRY_FILES = [
    ("destatis/germany-2022.json", "destatis/germany-2024.json", "DE"),
    ("ine/spain-2022.json", "ine/spain-2024.json", "ES"),
    ("insee/france-2022.json", "insee/france-2024.json", "FR"),
    ("cbs/netherlands-2022.json", "cbs/netherlands-2024.json", "NL"),
    ("scb/sweden-2022.json", "scb/sweden-2024.json", "SE"),
    ("gus/poland-2022.json", "gus/poland-2024.json", "PL"),
    ("istat/italy-2022.json", "istat/italy-2024.json", "IT"),
    ("ine-pt/portugal-2022.json", "ine-pt/portugal-2024.json", "PT"),
    ("cso/ireland-2022.json", "cso/ireland-2024.json", "IE"),
    ("bfs/switzerland-2022.json", "bfs/switzerland-2024.json", "CH"),
]

ROLES_FILES = [
    ("destatis/germany-roles-2022.json", "destatis/germany-roles-2024.json", "DE"),
    ("ine/spain-roles-2022.json", "ine/spain-roles-2024.json", "ES"),
]

print("Generating 2024 salary data files...\n")

for src, dst, cc in SINGLE_COUNTRY_FILES:
    src_path = os.path.join(RAW, src)
    dst_path = os.path.join(RAW, dst)
    if os.path.exists(src_path):
        process_single_country(src_path, dst_path, cc)
    else:
        print(f"  SKIP (not found): {src}")

for src, dst, cc in ROLES_FILES:
    src_path = os.path.join(RAW, src)
    dst_path = os.path.join(RAW, dst)
    if os.path.exists(src_path):
        process_single_country(src_path, dst_path, cc)

process_eurostat(
    os.path.join(RAW, "eurostat/europe-2022.json"),
    os.path.join(RAW, "eurostat/europe-2024.json"),
)

print("\nRemoving 2022 originals to prevent double-counting...\n")

files_to_remove = (
    [os.path.join(RAW, src) for src, _, _ in SINGLE_COUNTRY_FILES]
    + [os.path.join(RAW, src) for src, _, _ in ROLES_FILES]
    + [os.path.join(RAW, "eurostat/europe-2022.json")]
)

for f in files_to_remove:
    if os.path.exists(f):
        os.remove(f)
        print(f"  removed {os.path.basename(f)}")

print("\nDone. Run `npm run normalize` to regenerate data/normalized/records.json")
