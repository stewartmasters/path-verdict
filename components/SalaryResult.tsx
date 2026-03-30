"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  type SalaryResult,
  formatSalary,
  getSeniorityLabel,
  getSeniorityBands,
  ROLES,
  type ConfidenceLevel,
  CONFIDENCE_LABELS,
} from "@/lib/salary-data";
import { getCompanyTypeComparison } from "@/lib/company-type-data";
import { calculateSkillsPremium, type SkillSlug } from "@/lib/skills-data";
import { getGenderPayGap } from "@/lib/gender-pay-gap";
import { track } from "@/lib/analytics";

const SAVE_KEY = "salary_verdict_saved";

interface Props {
  result: SalaryResult;
  yearsOfExp?: number;
  onReset: () => void;
  onEdit?: () => void;
  roleLabel?: string;
  locationLabel?: string;
  confidenceLevel?: ConfidenceLevel;
  selectedSkills?: SkillSlug[];
}

interface VerdictConfig {
  emoji: string;
  shortAnswer: string;
  headline: string;
  heroSub: string;
  nextStep: string;
  heroBg: string;
  badge: string;
  badgeLabel: string;
  barColor: string;
  gapColor: string;
}

const VERDICT_CONFIG: Record<SalaryResult["verdict"], VerdictConfig> = {
  "well-below": {
    emoji: "😬",
    shortAnswer: "You're likely underpaid.",
    headline: "You're earning less than most people doing your job.",
    heroSub: "Your salary sits well below the market midpoint for your role and location.",
    nextStep: "This is worth raising in your next compensation conversation.",
    heroBg: "bg-red-50 border-b border-red-100",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Well below market",
    barColor: "bg-red-400",
    gapColor: "text-red-600",
  },
  "slightly-below": {
    emoji: "😐",
    shortAnswer: "You may be slightly underpaid.",
    headline: "Your salary is a little below what the market pays.",
    heroSub: "You're below the midpoint, though the gap is modest.",
    nextStep: "Worth keeping in mind for your next salary review or offer negotiation.",
    heroBg: "bg-orange-50 border-b border-orange-100",
    badge: "bg-orange-100 text-orange-700",
    badgeLabel: "Slightly below market",
    barColor: "bg-orange-400",
    gapColor: "text-orange-600",
  },
  "fair": {
    emoji: "🙂",
    shortAnswer: "You're paid around market rate.",
    headline: "You're roughly where the market expects you to be.",
    heroSub: "Your salary looks broadly in line with similar roles in your location.",
    nextStep: "You're roughly where the market expects you to be.",
    heroBg: "bg-amber-50 border-b border-amber-100",
    badge: "bg-amber-100 text-amber-700",
    badgeLabel: "Around market",
    barColor: "bg-amber-400",
    gapColor: "text-gray-600",
  },
  "above": {
    emoji: "😎",
    shortAnswer: "You're paid above market.",
    headline: "You earn more than most people in your role.",
    heroSub: "You're ahead of the market midpoint. Well negotiated.",
    nextStep: "Use this as leverage — you're in a strong position in any future negotiation.",
    heroBg: "bg-emerald-50 border-b border-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
    badgeLabel: "Above market",
    barColor: "bg-emerald-500",
    gapColor: "text-emerald-600",
  },
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function buildShareCard(
  verdict: SalaryResult["verdict"],
  percentile: number,
  deltaStr: string,
  roleLabel?: string,
  locationLabel?: string
): string {
  const ctx =
    roleLabel && locationLabel
      ? `${roleLabel} · ${locationLabel}`
      : roleLabel ?? locationLabel ?? "";
  const pctLine =
    percentile <= 50
      ? `Bottom ${100 - percentile}% for my role`
      : `Top ${100 - percentile}% for my role`;

  const lines: string[] = [];
  if (verdict === "well-below") {
    lines.push(`😬 I checked my salary — I'm underpaid by ~${deltaStr}`);
  } else if (verdict === "slightly-below") {
    lines.push(`😐 I checked my salary — I'm slightly below market`);
  } else if (verdict === "above") {
    lines.push(`😎 I checked my salary — I'm above market`);
  } else {
    lines.push(`🙂 I checked my salary — I'm roughly at market rate`);
  }
  lines.push(pctLine);
  if (ctx) lines.push(ctx);
  lines.push("Check yours → salaryverdict.com");
  return lines.join("\n");
}

export default function SalaryResult({
  result,
  yearsOfExp,
  onReset,
  onEdit,
  roleLabel,
  locationLabel,
  confidenceLevel,
  selectedSkills = [],
}: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    try {
      const item = localStorage.getItem(SAVE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (
          parsed.verdict === result.verdict &&
          parsed.roleSlug === result.roleSlug &&
          parsed.locationSlug === result.locationSlug
        ) {
          setSaved(true);
        }
      }
    } catch {}
  }, [result]);

  const handleSave = () => {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          verdict: result.verdict,
          percentile: result.percentile,
          median: result.median,
          low: result.low,
          high: result.high,
          delta: result.delta,
          currency: result.currency,
          roleSlug: result.roleSlug,
          locationSlug: result.locationSlug,
          roleLabel,
          locationLabel,
          savedAt: new Date().toISOString(),
        })
      );
      setSaved(true);
      track("result_saved" as Parameters<typeof track>[0]);
    } catch {}
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "salary-leads",
          email,
          verdict: result.verdict,
          role: result.roleSlug ?? "",
          location: result.locationSlug ?? "",
        }).toString(),
      });
      setEmailSubmitted(true);
      track("email_captured", { verdict: result.verdict });
    } catch {
      setEmailError("Something went wrong. Please try again.");
    }
  };

  const config = VERDICT_CONFIG[result.verdict];
  const { currency, low, median, high, percentile, delta, recordCount, sourceCount } = result;

  const currentSalary = median + delta;
  const deltaAbs = Math.abs(delta);
  const deltaStr = formatSalary(Math.round(deltaAbs / 500) * 500, currency);
  const gapDisplay =
    Math.round(deltaAbs / 500) * 500 === 0
      ? "—"
      : `${delta > 0 ? "+" : "-"}${deltaStr}`;

  const barPos = Math.max(4, Math.min(94, percentile));
  const seniorityLabel = yearsOfExp !== undefined ? getSeniorityLabel(yearsOfExp) : null;
  const confidence = confidenceLevel ? CONFIDENCE_LABELS[confidenceLevel] : null;
  const isBelow =
    result.verdict === "well-below" || result.verdict === "slightly-below";

  // Show "why this matters" for any below verdict with a meaningful gap (≥€1k)
  const showWhyItMatters = isBelow && deltaAbs >= 1000;
  const fiveYearStr = showWhyItMatters
    ? formatSalary(Math.round((deltaAbs * 5) / 1000) * 1000, currency)
    : null;

  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "https://salaryverdict.com";

  const shareCard = buildShareCard(
    result.verdict,
    percentile,
    deltaStr,
    roleLabel,
    locationLabel
  );

  const pctBelow = 100 - percentile;
  const percentileHeadline = (() => {
    const roleCtx = roleLabel ? `${roleLabel}s` : "this role";
    const locCtx = locationLabel ? ` in ${locationLabel}` : "";
    if (percentile <= 50) return `Bottom ${pctBelow}% for ${roleCtx}${locCtx}`;
    return `Top ${100 - percentile}% for ${roleCtx}${locCtx}`;
  })();

  const percentileMicrocopy = (() => {
    if (isBelow)
      return `You earn less than roughly ${pctBelow}% of people in similar roles.`;
    if (result.verdict === "above")
      return `You earn more than roughly ${percentile}% of people in similar roles.`;
    return "You earn roughly what most people in your role make.";
  })();

  const MONTH_YEAR = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      track("share_link_copied");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(shareCard);
      setCopiedCard(true);
      track("share_text_copied");
      setTimeout(() => setCopiedCard(false), 2500);
    } catch {}
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareCard + "\n\n"
  )}&url=${encodeURIComponent(pageUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareCard + "\n\n" + pageUrl)}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">

      {/* ─── TRUST / STATUS ROW ─── */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.badge}`}>
            {config.badgeLabel}
          </span>
          {seniorityLabel && (
            <span className="text-xs text-gray-400">{seniorityLabel} level</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {confidence && (
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${confidence.color}`}
              title={confidence.description}
            >
              {confidence.label}
            </span>
          )}
          <span className="text-xs text-gray-400">{MONTH_YEAR}</span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors underline underline-offset-2"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      {recordCount != null && recordCount > 0 && (
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-xs text-gray-400">
            {sourceCount != null && sourceCount > 0
              ? `Based on ${sourceCount} data source${sourceCount !== 1 ? "s" : ""} · `
              : ""}
            {recordCount} matching salary records
          </p>
        </div>
      )}

      {/* ─── HERO VERDICT ─── */}
      <div className={`px-5 pt-5 pb-5 ${config.heroBg}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          Short answer:{" "}
          <span className="text-gray-700 normal-case tracking-normal font-semibold">
            {config.shortAnswer}
          </span>
        </p>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 flex-shrink-0" role="img" aria-hidden="true">
            {config.emoji}
          </span>
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
              {config.headline}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{config.heroSub}</p>
          </div>
        </div>

        {/* 3-stat row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">Your salary</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
              {formatSalary(currentSalary, currency)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center ring-1 ring-gray-200 shadow-sm">
            <div className="text-xs text-gray-400 font-medium mb-1">Market midpoint</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
              {formatSalary(median, currency)}
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">Gap</div>
            <div className={`font-bold text-sm sm:text-base leading-tight ${delta > 0 ? "text-emerald-600" : delta < 0 ? config.gapColor : "text-gray-500"}`}>
              {gapDisplay}
            </div>
          </div>
        </div>

        {/* Above-fold actions */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/5">
          <button
            onClick={handleCopyCard}
            className="flex-1 text-xs font-semibold text-center py-2 px-3 rounded-lg bg-white/80 hover:bg-white text-gray-700 transition-colors"
          >
            {copiedCard ? "✓ Copied!" : "Share result →"}
          </button>
          <Link
            href="/methodology"
            className="text-xs text-gray-400 hover:text-orange-500 transition-colors whitespace-nowrap"
          >
            How we calculate →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">

        {/* ─── PERCENTILE BLOCK ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="font-bold text-gray-900 text-base">{percentileHeadline}</h3>
          <div className="space-y-2">
            <div className="relative h-2.5 bg-gray-200 rounded-full overflow-visible">
              <div
                className={`absolute left-0 top-0 h-full ${config.barColor} rounded-full transition-all duration-700`}
                style={{ width: `${barPos}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md"
                style={{ left: `calc(${barPos}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>Bottom</span>
              <span className="text-gray-700 font-bold">{ordinal(percentile)} percentile</span>
              <span>Top</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{percentileMicrocopy}</p>
        </div>

        {/* ─── MARKET RANGE ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Typical market range
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Low", value: formatSalary(low, currency), sub: "25th percentile" },
              { label: "Median", value: formatSalary(median, currency), sub: "50th percentile", hl: true },
              { label: "High", value: formatSalary(high, currency), sub: "75th percentile" },
            ].map(({ label, value, sub, hl }) => (
              <div
                key={label}
                className={`rounded-xl p-3 text-center ${hl ? "bg-gray-900 text-white" : "bg-gray-50"}`}
              >
                <div className={`text-xs font-medium mb-1 ${hl ? "text-gray-400" : "text-gray-400"}`}>
                  {label}
                </div>
                <div className={`font-bold text-sm sm:text-base ${hl ? "text-white" : "text-gray-700"}`}>
                  {value}
                </div>
                <div className={`text-xs mt-0.5 ${hl ? "text-gray-500" : "text-gray-400"}`}>
                  {sub}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Base salary only. Bonus, equity, and benefits not included.
          </p>
        </div>

        {/* ─── CAREER TRAJECTORY ─── */}
        {result.roleSlug && result.locationSlug && (() => {
          const bands = getSeniorityBands(result.roleSlug, result.locationSlug);
          const levels = [
            { key: "junior", label: "Junior",    data: bands.junior, years: "0–2 yrs" },
            { key: "mid",    label: "Mid-level", data: bands.mid,    years: "3–6 yrs" },
            { key: "senior", label: "Senior",    data: bands.senior, years: "7+ yrs"  },
          ] as const;
          const currentLevel = yearsOfExp !== undefined ? getSeniorityLabel(yearsOfExp).toLowerCase().replace("-level", "") : null;
          const maxMedian = bands.senior.median;
          const currentBandIndex = levels.findIndex((l) => l.key === currentLevel);
          const nextBand = currentBandIndex >= 0 && currentBandIndex < levels.length - 1
            ? levels[currentBandIndex + 1]
            : null;
          const nextPct = nextBand
            ? Math.round(((nextBand.data.median - levels[currentBandIndex].data.median) / levels[currentBandIndex].data.median) * 100)
            : null;

          return (
            <div className="px-5 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">Career trajectory</h3>
                {roleLabel && locationLabel && (
                  <span className="text-xs text-gray-400">{roleLabel} · {locationLabel}</span>
                )}
              </div>
              <div className="space-y-2.5">
                {levels.map(({ key, label, data, years }) => {
                  const isCurrentLevel = key === currentLevel;
                  const barPct = Math.round((data.median / maxMedian) * 100);
                  return (
                    <div key={key} className={`rounded-xl p-3 ${isCurrentLevel ? "bg-orange-50 ring-1 ring-orange-200" : "bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrentLevel ? "text-orange-700" : "text-gray-700"}`}>
                            {label}
                          </span>
                          <span className="text-xs text-gray-400">{years}</span>
                          {isCurrentLevel && (
                            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                              you
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-bold ${isCurrentLevel ? "text-orange-700" : "text-gray-600"}`}>
                          {formatSalary(data.median, bands.currency)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isCurrentLevel ? "bg-orange-400" : "bg-gray-300"}`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {nextBand && nextPct !== null && (
                <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-orange-200 pl-3">
                  {nextBand.label} market midpoint is{" "}
                  <strong className="text-gray-700">{formatSalary(nextBand.data.median, bands.currency)}</strong>
                  {" "}— roughly <strong className="text-gray-700">+{nextPct}%</strong> above today&apos;s {levels[currentBandIndex]?.label.toLowerCase()} midpoint.
                </p>
              )}
              {!nextBand && currentLevel === "senior" && (
                <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-orange-200 pl-3">
                  You&apos;re at senior level — the top of the standard market progression for this role.
                </p>
              )}
            </div>
          );
        })()}

        {/* ─── COMPANY TYPE COMPARISON ─── */}
        {result.roleSlug && result.locationSlug && (() => {
          const roleCategory = ROLES.find((r) => r.slug === result.roleSlug)?.category ?? "Engineering";
          const comparisons = getCompanyTypeComparison(result.median, roleCategory, result.currency);
          const maxSalary = comparisons[0].salary;

          return (
            <div className="px-5 py-5 space-y-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">What different employers pay</h3>
                {roleLabel && locationLabel && (
                  <span className="text-xs text-gray-400">{roleLabel} · {locationLabel}</span>
                )}
              </div>
              <div className="space-y-2">
                {comparisons.map(({ type, label, description, salary, isBaseline, equity, equityNote }) => {
                  const barPct = Math.round((salary / maxSalary) * 100);
                  return (
                    <div key={type} className={`rounded-xl p-3 ${isBaseline ? "bg-orange-50 ring-1 ring-orange-200" : "bg-gray-50"}`}>
                      <div className="flex items-start justify-between mb-1.5 gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm font-bold ${isBaseline ? "text-orange-700" : "text-gray-700"}`}>
                              {label}
                            </span>
                            {isBaseline && (
                              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                                market median
                              </span>
                            )}
                            {equity && (
                              <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                                + equity
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${isBaseline ? "text-orange-700" : "text-gray-600"}`}>
                          {formatSalary(salary, result.currency)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isBaseline ? "bg-orange-400" : "bg-gray-300"}`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Base salary estimates only. Equity, bonuses, and benefits vary significantly by company and stage.
              </p>
            </div>
          );
        })()}

        {/* ─── SKILLS PREMIUM ─── */}
        {selectedSkills.length > 0 && result.roleSlug && result.locationSlug && (() => {
          const { totalPremium, additionalSalary, breakdown } = calculateSkillsPremium(
            selectedSkills,
            result.roleSlug as Parameters<typeof calculateSkillsPremium>[1],
            result.locationSlug as Parameters<typeof calculateSkillsPremium>[2],
            median,
          );
          if (breakdown.length === 0) return null;
          const pctDisplay = Math.round(totalPremium * 100);
          const adjustedSalary = median + additionalSalary;

          return (
            <div className="px-5 py-5 space-y-3 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Your skills premium</h3>
              <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm text-gray-600">
                      {breakdown.map((b) => b.skill.label).join(" + ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      Skills premium estimate for your role and location
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-orange-600">+{pctDisplay}%</p>
                    <p className="text-xs text-gray-400">+{formatSalary(additionalSalary, result.currency)}</p>
                  </div>
                </div>
                <div className="border-t border-orange-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Skills-adjusted market rate</span>
                  <span className="text-sm font-bold text-gray-900">{formatSalary(adjustedSalary, result.currency)}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {breakdown.map(({ skill, premium }) => (
                  <div key={skill.slug} className="flex items-center justify-between text-xs text-gray-500">
                    <span>{skill.label}</span>
                    <span className="font-semibold text-gray-700">+{Math.round(premium * 100)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Estimates based on Levels.fyi Europe 2024 and LinkedIn Salary Insights. Premiums vary by company and market conditions.
              </p>
            </div>
          );
        })()}

        {/* ─── GENDER PAY GAP ─── */}
        {result.roleSlug && result.locationSlug && (() => {
          const roleCategory = ROLES.find((r) => r.slug === result.roleSlug)?.category ?? "";
          const gpg = getGenderPayGap(result.locationSlug, roleCategory);
          if (!gpg) return null;
          return (
            <div className="px-5 py-4 border-t border-gray-100 flex items-start gap-3">
              <span className="text-base mt-0.5 flex-shrink-0" aria-hidden="true">⚖️</span>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">
                  Gender pay gap — {gpg.countryName}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Women in {gpg.categoryLabel} earn roughly{" "}
                  <strong className="text-gray-700">{gpg.gapPct}% less</strong> than men
                  on average in {gpg.countryName}. The market median above reflects
                  all genders combined.
                </p>
                <p className="text-xs text-gray-400">Source: {gpg.sourceLabel}</p>
              </div>
            </div>
          );
        })()}

        {/* ─── WHY THIS MATTERS (all below verdicts with gap ≥ €1k) ─── */}
        {showWhyItMatters ? (
          <div className="px-5 py-5 space-y-2">
            <h3 className="font-bold text-gray-900 text-base">Why this matters</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A {deltaStr} gap today compounds over time. Over 5 years,
              that&apos;s roughly{" "}
              <strong className="text-gray-800">{fiveYearStr}</strong> in missed
              gross pay — before any additional raises or promotions.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-orange-200 pl-3">
              {config.nextStep}
            </p>
          </div>
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">
              {config.nextStep}
            </p>
          </div>
        )}

        {/* ─── ABOVE MARKET: ACTIONS ─── */}
        {result.verdict === "above" && (
          <div className="px-5 py-5 bg-emerald-50 border-b border-emerald-100 space-y-4">
            <div>
              <p className="text-sm font-semibold text-emerald-800 mb-0.5">You&apos;re ahead — use it.</p>
              <p className="text-xs text-emerald-700">
                Top {100 - percentile}% for your role. That&apos;s leverage in your next negotiation, promotion case,
                or job offer. Here&apos;s how to make it count.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={handleCopyCard}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-emerald-700 text-white py-2.5 px-4 rounded-xl hover:bg-emerald-800 transition-colors"
              >
                {copiedCard ? "✓ Copied!" : "Share your result with a friend →"}
              </button>
              <Link
                href="/blog/salary-negotiation-tips"
                className="flex items-center justify-center text-xs font-medium border border-emerald-200 bg-white text-emerald-700 py-2.5 px-3 rounded-lg hover:bg-emerald-50 transition-colors text-center"
              >
                How to negotiate from a position of strength →
              </Link>
              {result.roleSlug && (
                <Link
                  href={`/salary/${result.roleSlug}`}
                  className="flex items-center justify-center text-xs font-medium border border-gray-200 bg-white text-gray-600 py-2.5 px-3 rounded-lg hover:border-emerald-200 hover:text-emerald-700 transition-colors text-center"
                >
                  {roleLabel ? `See what the top 25% of ${roleLabel}s earn →` : "See what top earners in your role make →"}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ─── EMAIL CAPTURE ─── */}
        {!emailSubmitted ? (
          <div className="px-5 py-5 bg-orange-50">
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Get salary tips by email</p>
            <p className="text-xs text-gray-500 mb-3">
              Monthly salary insights and negotiation tactics. One email a month. Unsubscribe any time.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
              <button
                type="submit"
                className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
            {emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
          </div>
        ) : (
          <div className="px-5 py-4 bg-orange-50">
            <p className="text-sm font-semibold text-emerald-700">✓ You&apos;re on the list</p>
            <p className="text-xs text-gray-500 mt-0.5">We&apos;ll send you salary insights once a month.</p>
          </div>
        )}

        {/* ─── SHARE BLOCK ─── */}
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">Share your result</h3>
            <span className="text-xs text-gray-400">Compare with a friend →</span>
          </div>

          <div
            className="bg-gray-900 rounded-xl px-4 py-3.5 font-mono text-xs text-gray-200 whitespace-pre-wrap break-words leading-relaxed select-all cursor-pointer overflow-hidden"
            onClick={handleCopyCard}
          >
            {shareCard}
          </div>

          <button
            onClick={handleCopyCard}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors"
          >
            {copiedCard ? "✓ Copied to clipboard!" : "Copy and share"}
          </button>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("share_whatsapp")}
              className="flex items-center justify-center text-xs font-semibold bg-green-500 text-white py-2.5 px-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("share_linkedin")}
              className="flex items-center justify-center text-xs font-semibold bg-blue-600 text-white py-2.5 px-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("share_twitter")}
              className="flex items-center justify-center text-xs font-semibold bg-black text-white py-2.5 px-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              X
            </a>
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors text-center"
          >
            {copiedLink ? "✓ Link copied" : "or copy link"}
          </button>
        </div>

        {/* ─── EXPLORE MORE ─── */}
        <div className="px-5 py-4 bg-gray-50 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explore more</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onReset}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors text-sm"
            >
              Check another salary →
            </button>
            {result.roleSlug && (
              <Link
                href={`/salary/${result.roleSlug}`}
                className="flex items-center justify-center text-xs font-medium border border-gray-200 bg-white text-gray-700 py-2.5 px-3 rounded-lg hover:border-orange-200 hover:text-orange-600 transition-colors text-center"
              >
                {roleLabel ? `See ${roleLabel} salaries across all cities` : "Same role in other cities"}
              </Link>
            )}
            {result.locationSlug && (
              <Link
                href={`/salary/${result.locationSlug}`}
                className="flex items-center justify-center text-xs font-medium border border-gray-200 bg-white text-gray-700 py-2.5 px-3 rounded-lg hover:border-orange-200 hover:text-orange-600 transition-colors text-center"
              >
                {locationLabel ? `All salaries in ${locationLabel}` : "All roles in this city"}
              </Link>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saved}
            className="w-full text-xs font-medium text-gray-400 hover:text-gray-600 py-1 transition-colors disabled:cursor-default text-center"
          >
            {saved ? "✓ Saved to this browser" : "Save result to re-check later"}
          </button>
        </div>

        {/* ─── FOOTER DISCLAIMER ─── */}
        <div className="px-5 py-3 bg-gray-50">
          <p className="text-xs text-gray-400">
            Based on official government earnings surveys (ONS, Eurostat, Destatis, INE) and
            verified market benchmarks.{" "}
            <Link href="/methodology" className="text-orange-500 hover:underline">
              Methodology →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
