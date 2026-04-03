"use client";

import { useState } from "react";
import {
  type PathResult,
  VERDICT_CONFIG,
  AGE_BANDS,
  getInsightLine,
  getVerdictCopy,
  buildIdentityCard,
  formatAmount,
} from "@/lib/savings-data";
import { getCountry } from "@/lib/countries";
import { track } from "@/lib/analytics";
import ShareCard from "./ShareCard";
import { t, type Locale } from "@/lib/i18n";

interface Props {
  result: PathResult;
  onReset: () => void;
  onEdit?: () => void;
  resetLabel?: string;
  locale?: Locale;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}


export default function PathResultComponent({ result, onReset, onEdit, resetLabel, locale = "en" }: Props) {
  const tr = t(locale);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const config = VERDICT_CONFIG[result.verdict];
  const verdictCopy = getVerdictCopy(result);
  const insightLine = getInsightLine(result);
  const identityCard = buildIdentityCard(result);
  const country = getCountry(result.countrySlug);
  const incomeBandLabel = result.incomeBandLabel;
  const ageBandLabel = result.ageBandSlug ? AGE_BANDS.find((b) => b.slug === result.ageBandSlug)?.label : null;
  const fmt = (n: number) => formatAmount(n, result.currencySymbol, result.currencyPosition);

  const barPos = Math.max(4, Math.min(94, result.percentile));
  const isNegative = result.verdict === "critical";
  const isBelow = result.verdict === "critical" || result.verdict === "falling-behind";

  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://pathverdict.com";

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(identityCard.shareText);
      setCopiedCard(true);
      track("share_text_copied", { identity: identityCard.identity });
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

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(identityCard.shareText + "\n\n")}&url=${encodeURIComponent(pageUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(identityCard.shareText + "\n\n" + pageUrl)}`;

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
              {tr.edit}
            </button>
          )}
        </div>
      </div>

      {/* ─── HERO VERDICT ─── */}
      <div className={`px-5 pt-5 pb-5 ${config.heroBg}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          {tr.verdictLabel}{" "}
          <span className="text-gray-700 normal-case tracking-normal font-semibold">
            {verdictCopy.shortAnswer}
          </span>
        </p>
        <div className="space-y-1 mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
            {verdictCopy.headline}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{verdictCopy.heroSub}</p>
        </div>

        {/* 3-stat row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">{tr.yourRate}</div>
            <div className={`font-bold text-sm sm:text-base leading-tight ${isNegative ? "text-red-600" : "text-gray-900"}`}>
              ~{result.savingsRate}%
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center ring-1 ring-gray-200 shadow-sm">
            <div className="text-xs text-gray-400 font-medium mb-1">{tr.expected}</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
              ~{result.expectedRate}%
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">{tr.gap}</div>
            <div className={`font-bold text-sm sm:text-base leading-tight ${config.gapColor}`}>
              {result.gap > 0 ? `+${result.gap}` : result.gap} pts
            </div>
          </div>
        </div>

        {/* Above-fold action */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/5">
          <button
            onClick={handleCopyCard}
            className="flex-1 text-xs font-semibold text-center py-2 px-3 rounded-lg bg-white/80 hover:bg-white text-gray-700 transition-colors"
          >
            {copiedCard ? tr.shareCopied : tr.shareCta(identityCard.label)}
          </button>
          <a
            href="/methodology"
            className="text-xs text-gray-400 hover:text-teal-600 transition-colors whitespace-nowrap"
          >
            {tr.howWeCalculate}
          </a>
        </div>
      </div>

      <div className="divide-y divide-gray-100">

        {/* ─── SAVINGS RATE BREAKDOWN ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="font-bold text-gray-900 text-base">{tr.theNumbers}</h3>
          <div className="space-y-2">
            {/* Gross income */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{tr.grossMonthlyIncome}</span>
              <span className="font-semibold text-gray-900">{fmt(result.monthlyIncome)}</span>
            </div>
            {/* Tax deduction — shown if we have a profile */}
            {result.monthlyTaxDeduction > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {tr.taxContributions}
                  <span className="ml-1 text-xs text-gray-300">
                    (~{Math.round(result.taxEffectiveRate * 100)}% effective)
                  </span>
                </span>
                <span className="font-semibold text-gray-400">−{fmt(result.monthlyTaxDeduction)}</span>
              </div>
            )}
            {/* Net income */}
            <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-2">
              <span className="font-medium text-gray-700">{tr.netMonthlyIncome}</span>
              <span className="font-bold text-gray-900">{fmt(result.netMonthlyIncome)}</span>
            </div>
            {/* Expenses */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{tr.rentMortgage}</span>
              <span className="font-semibold text-gray-600">−{fmt(result.monthlyRent)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{tr.otherExpensesResult}</span>
              <span className="font-semibold text-gray-600">−{fmt(result.monthlyOtherExpenses)}</span>
            </div>
            {/* Surplus */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{tr.monthlySurplus}</span>
              <span className={`font-semibold ${result.monthlySurplus >= 0 ? "text-teal-600" : "text-red-600"}`}>
                {result.monthlySurplus >= 0 ? fmt(result.monthlySurplus) : `−${fmt(Math.abs(result.monthlySurplus))}`}
              </span>
            </div>
          </div>
          <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold text-gray-700">{tr.estSavingsRate}</span>
              {result.monthlyTaxDeduction > 0 && (
                <span className="ml-1 text-xs text-gray-400">{tr.ofNetIncome}</span>
              )}
            </div>
            <span className={`font-extrabold text-base ${isNegative ? "text-red-600" : result.savingsRate >= result.expectedRate ? "text-teal-600" : "text-gray-900"}`}>
              ~{result.savingsRate}%
            </span>
          </div>
          {/* Tax source note */}
          {result.taxNote && (
            <p className="text-xs text-gray-400 leading-relaxed">
              Tax estimate: {result.taxNote}. OECD Taxing Wages 2023.
            </p>
          )}
        </div>

        {/* ─── PERCENTILE BLOCK ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="font-bold text-gray-900 text-base">
            {result.percentile >= 50
              ? tr.topPercent(result.percentile)
              : tr.bottomPercent(result.percentile)}
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
              <span>{tr.bottomSavers}</span>
              <span className="text-gray-700 font-bold">{ordinal(result.percentile)} {tr.percentile}</span>
              <span>{tr.topSavers}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {isBelow
              ? tr.savesLessThan(result.percentile)
              : tr.savesMoreThan(result.percentile)}
          </p>
        </div>

        {/* ─── BENCHMARKS ─── */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {tr.savingsBenchmarks}
          </h3>
          {incomeBandLabel && (
            <p className="text-xs text-gray-400">{tr.incomeRange} {incomeBandLabel}</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: tr.minimum, value: `${Math.max(0, result.expectedRate - 5)}%`, sub: tr.floor },
              { label: tr.expectedBench, value: `${result.expectedRate}%`, sub: tr.benchmark, hl: true },
              { label: tr.strong, value: `${result.expectedRate + 7}%`, sub: tr.topTier },
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
          <h3 className="font-bold text-gray-900 text-base">{tr.whatThisMeans}</h3>
          <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-teal-200 pl-3">
            {insightLine}
          </p>
          {result.invests === "no" && (result.verdict === "on-track" || result.verdict === "ahead") && (
            <p className="text-xs text-gray-400 pl-3">
              {tr.investingNote}
            </p>
          )}
        </div>

        {/* ─── SHARE BLOCK ─── */}
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">{tr.yourFinancialIdentity}</h3>
            <span className="text-xs text-gray-400">{tr.shareToCompare}</span>
          </div>

          {/* Identity card — tap to copy */}
          <ShareCard card={identityCard} onClick={handleCopyCard} copied={copiedCard} />

          {/* Primary CTA */}
          <button
            onClick={handleCopyCard}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors"
          >
            {copiedCard ? tr.copiedToClipboard : tr.copyAndShare}
          </button>

          {/* Social row */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("share_whatsapp", { identity: identityCard.identity })}
              className="flex items-center justify-center text-xs font-semibold bg-green-500 text-white py-2.5 px-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("share_linkedin", { identity: identityCard.identity })}
              className="flex items-center justify-center text-xs font-semibold bg-blue-600 text-white py-2.5 px-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("share_twitter", { identity: identityCard.identity })}
              className="flex items-center justify-center text-xs font-semibold bg-black text-white py-2.5 px-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              X
            </a>
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors text-center"
          >
            {copiedLink ? tr.linkCopied : tr.orCopyLink}
          </button>
        </div>

        {/* ─── EMAIL CAPTURE ─── */}
        {!emailSent && (
          <div className="px-5 py-5 space-y-3">
            <h3 className="font-bold text-gray-900 text-base">{tr.getReminder}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {tr.reminderSub}
            </p>
            <form
              name="path-leads"
              method="POST"
              data-netlify="true"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                const fd = new FormData();
                fd.append("form-name", "path-leads");
                fd.append("email", email);
                fd.append("verdict", result.verdict);
                fd.append("income_band", result.incomeBandLabel);
                fetch("/", { method: "POST", body: fd }).catch(() => {});
                track("email_captured", { verdict: result.verdict });
                setEmailSent(true);
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input type="hidden" name="form-name" value="path-leads" />
              <input type="hidden" name="verdict" value={result.verdict} />
              <input type="hidden" name="income_band" value={result.incomeBandLabel} />
              <input
                type="email"
                name="email"
                placeholder={tr.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap sm:flex-shrink-0"
              >
                {tr.remindMe}
              </button>
            </form>
          </div>
        )}
        {emailSent && (
          <div className="px-5 py-4 text-center">
            <p className="text-sm text-teal-600 font-semibold">{tr.reminderConfirm}</p>
          </div>
        )}

        {/* ─── RESET ─── */}
        <div className="px-5 py-4 bg-gray-50 space-y-3">
          <button
            onClick={onReset}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors text-sm"
          >
            {resetLabel ?? tr.checkAgain}
          </button>
        </div>

        {/* ─── DISCLAIMER ─── */}
        <div className="px-5 py-3 bg-gray-50">
          <p className="text-xs text-gray-400">
            {tr.disclaimer} {result.dataSource}. {tr.disclaimerSuffix}{" "}
            <a href="/methodology" className="text-teal-600 hover:underline">{tr.methodology}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
