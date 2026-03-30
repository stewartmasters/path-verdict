"use client";

import { useState } from "react";
import {
  type PathResult,
  VERDICT_CONFIG,
  INCOME_BANDS,
  AGE_BANDS,
  getInsightLine,
} from "@/lib/savings-data";
import { track } from "@/lib/analytics";

interface Props {
  result: PathResult;
  onReset: () => void;
  onEdit?: () => void;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function buildShareText(result: PathResult): string {
  const incomeBand = INCOME_BANDS.find((b) => b.slug === result.incomeBandSlug);
  const pctLine =
    result.percentile >= 50
      ? `Top ${100 - result.percentile}% of savers`
      : `Bottom ${result.percentile}% of savers`;

  const verdictLine: Record<string, string> = {
    "critical":       "My expenses exceed my income.",
    "falling-behind": "I'm falling behind financially.",
    "stable":         "I'm stable but not building.",
    "on-track":       "I'm financially on track.",
    "ahead":          "I'm ahead of my peers financially.",
  };

  const lines = [
    `I checked my financial position on PathVerdict.`,
    verdictLine[result.verdict] ?? "",
    `Savings rate: ${result.savingsRate}% (expected: ${result.expectedRate}%)`,
    pctLine,
    incomeBand ? `Income: ${incomeBand.label}` : "",
    "Check yours → pathverdict.com",
  ].filter(Boolean);

  return lines.join("\n");
}

export default function PathResultComponent({ result, onReset, onEdit }: Props) {
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const config = VERDICT_CONFIG[result.verdict];
  const insightLine = getInsightLine(result);
  const shareText = buildShareText(result);
  const incomeBandLabel = INCOME_BANDS.find((b) => b.slug === result.incomeBandSlug)?.label;
  const ageBandLabel = result.ageBandSlug ? AGE_BANDS.find((b) => b.slug === result.ageBandSlug)?.label : null;

  const barPos = Math.max(4, Math.min(94, result.percentile));
  const isNegative = result.verdict === "critical";
  const isBelow = result.verdict === "critical" || result.verdict === "falling-behind";

  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://pathverdict.com";

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedCard(true);
      track("share_text_copied");
      setTimeout(() => setCopiedCard(false), 2500);
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      track("share_link_copied");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + "\n\n")}&url=${encodeURIComponent(pageUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + pageUrl)}`;

  const MONTH_YEAR = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">

      {/* ─── STATUS ROW ─── */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.badge}`}>
            {config.badgeLabel}
          </span>
          {ageBandLabel && (
            <span className="text-xs text-gray-400">Age {ageBandLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{MONTH_YEAR}</span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs font-medium text-gray-400 hover:text-teal-600 transition-colors underline underline-offset-2"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* ─── HERO VERDICT ─── */}
      <div className={`px-5 pt-5 pb-5 ${config.heroBg}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          Verdict:{" "}
          <span className="text-gray-700 normal-case tracking-normal font-semibold">
            {config.shortAnswer}
          </span>
        </p>
        <div className="space-y-1 mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
            {config.headline}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{config.heroSub}</p>
        </div>

        {/* 3-stat row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">Your rate</div>
            <div className={`font-bold text-sm sm:text-base leading-tight ${isNegative ? "text-red-600" : "text-gray-900"}`}>
              {result.savingsRate}%
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center ring-1 ring-gray-200 shadow-sm">
            <div className="text-xs text-gray-400 font-medium mb-1">Expected</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
              {result.expectedRate}%
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">Gap</div>
            <div className={`font-bold text-sm sm:text-base leading-tight ${config.gapColor}`}>
              {result.gap > 0 ? `+${result.gap}` : result.gap}pp
            </div>
          </div>
        </div>

        {/* Above-fold action */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/5">
          <button
            onClick={handleCopyCard}
            className="flex-1 text-xs font-semibold text-center py-2 px-3 rounded-lg bg-white/80 hover:bg-white text-gray-700 transition-colors"
          >
            {copiedCard ? "✓ Copied!" : "Share result →"}
          </button>
          <a
            href="/methodology"
            className="text-xs text-gray-400 hover:text-teal-600 transition-colors whitespace-nowrap"
          >
            How we calculate →
          </a>
        </div>
      </div>

      <div className="divide-y divide-gray-100">

        {/* ─── SAVINGS RATE BREAKDOWN ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="font-bold text-gray-900 text-base">Your financial picture</h3>
          <div className="space-y-2">
            {[
              { label: "Monthly income",  value: `$${result.monthlyIncome.toLocaleString()}`,              color: "text-gray-900" },
              { label: "Rent / mortgage", value: `-$${result.monthlyRent.toLocaleString()}`,               color: "text-gray-600" },
              { label: "Other expenses",  value: `-$${result.monthlyOtherExpenses.toLocaleString()}`,      color: "text-gray-600" },
              { label: "Monthly surplus", value: result.monthlySurplus >= 0
                  ? `$${result.monthlySurplus.toLocaleString()}`
                  : `-$${Math.abs(result.monthlySurplus).toLocaleString()}`,
                color: result.monthlySurplus >= 0 ? "text-teal-600" : "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className={`font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">Savings rate</span>
            <span className={`font-extrabold text-base ${isNegative ? "text-red-600" : result.savingsRate >= result.expectedRate ? "text-teal-600" : "text-gray-900"}`}>
              {result.savingsRate}%
            </span>
          </div>
        </div>

        {/* ─── PERCENTILE BLOCK ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="font-bold text-gray-900 text-base">
            {result.percentile >= 50
              ? `Top ${100 - result.percentile}% of savers`
              : `Bottom ${result.percentile}% of savers`}
          </h3>
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
              <span>Bottom savers</span>
              <span className="text-gray-700 font-bold">{ordinal(result.percentile)} percentile</span>
              <span>Top savers</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {isBelow
              ? `You save less than roughly ${100 - result.percentile}% of people across income levels.`
              : `You save more than roughly ${result.percentile}% of people across income levels.`}
          </p>
        </div>

        {/* ─── BENCHMARKS ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Savings benchmarks for your income
          </h3>
          {incomeBandLabel && (
            <p className="text-xs text-gray-400">Income range: {incomeBandLabel}</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Minimum", value: `${Math.max(0, result.expectedRate - 5)}%`, sub: "floor" },
              { label: "Expected", value: `${result.expectedRate}%`, sub: "benchmark", hl: true },
              { label: "Strong", value: `${result.expectedRate + 7}%`, sub: "top tier" },
            ].map(({ label, value, sub, hl }) => (
              <div key={label} className={`rounded-xl p-3 text-center ${hl ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                <div className="text-xs font-medium mb-1 text-gray-400">{label}</div>
                <div className={`font-bold text-sm sm:text-base ${hl ? "text-white" : "text-gray-700"}`}>{value}</div>
                <div className={`text-xs mt-0.5 ${hl ? "text-gray-500" : "text-gray-400"}`}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── INSIGHT ─── */}
        <div className="px-5 py-5 space-y-2">
          <h3 className="font-bold text-gray-900 text-base">What this means</h3>
          <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-teal-200 pl-3">
            {insightLine}
          </p>
          {result.invests === "no" && (result.verdict === "on-track" || result.verdict === "ahead") && (
            <p className="text-xs text-gray-400 pl-3">
              You're saving well. Adding regular investment would compound your advantage.
            </p>
          )}
        </div>

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
            {shareText}
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

        {/* ─── RESET ─── */}
        <div className="px-5 py-4 bg-gray-50 space-y-3">
          <button
            onClick={onReset}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors text-sm"
          >
            Check again →
          </button>
        </div>

        {/* ─── DISCLAIMER ─── */}
        <div className="px-5 py-3 bg-gray-50">
          <p className="text-xs text-gray-400">
            Benchmarks derived from BLS Consumer Expenditure Survey and Fed Survey of Consumer Finances. This is a position, not financial advice.{" "}
            <a href="/methodology" className="text-teal-600 hover:underline">Methodology →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
