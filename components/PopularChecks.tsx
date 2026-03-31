"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { POPULAR_CHECKS, type PopularCheck } from "@/lib/popular-checks";
import { VERDICT_CONFIG } from "@/lib/savings-data";
import PathResultComponent from "./PathResult";

function CheckCard({
  check,
  selected,
  onSelect,
}: {
  check: PopularCheck;
  selected: boolean;
  onSelect: () => void;
}) {
  const config = VERDICT_CONFIG[check.result.verdict];

  return (
    <button
      onClick={onSelect}
      className={`
        flex-none w-[210px] text-left rounded-xl border transition-all duration-150
        ${selected
          ? "border-gray-900 bg-gray-900 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
        }
      `}
    >
      <div className="px-4 py-3.5 space-y-2">
        {/* Top row: badge + flag */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${selected ? "bg-white/10 text-white" : config.badge}`}>
            {config.badgeLabel}
          </span>
          <span className="text-base leading-none">{check.flag}</span>
        </div>

        {/* Location label */}
        <p className={`text-sm font-extrabold leading-snug tracking-tight ${selected ? "text-white" : "text-gray-900"}`}>
          {check.locationLabel}
        </p>

        {/* Identity label */}
        <p className={`text-[11px] font-semibold ${selected ? "text-gray-300" : "text-gray-500"}`}>
          {check.identityCard.label}
        </p>

        {/* Hook */}
        <p className={`text-[11px] leading-snug ${selected ? "text-gray-400" : "text-gray-400"}`}>
          {check.hook}
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-between pt-0.5">
          <p className={`text-[10px] font-semibold uppercase tracking-widest ${selected ? "text-teal-400" : "text-teal-600"}`}>
            {selected ? "Showing result ↓" : "See result →"}
          </p>
          {check.citySlug && !selected && (
            <Link
              href={`/financial-position/${check.citySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              City →
            </Link>
          )}
        </div>
      </div>
    </button>
  );
}

export default function PopularChecks() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const selectedCheck = POPULAR_CHECKS.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    const next = selectedId === id ? null : id;
    setSelectedId(next);
    if (next) {
      // scroll result into view after state settles
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    // scroll back to the cards row
    document.getElementById("popular-checks")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckMine = () => {
    setSelectedId(null);
    document.getElementById("path-tool")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="popular-checks" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Popular checks</h2>
          <p className="text-sm text-gray-400 mt-0.5">Tap a scenario to see the verdict.</p>
        </div>
        <button
          onClick={handleCheckMine}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors whitespace-nowrap"
        >
          Check mine →
        </button>
      </div>

      {/* Card scroll row */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
        {POPULAR_CHECKS.map((check) => (
          <CheckCard
            key={check.id}
            check={check}
            selected={check.id === selectedId}
            onSelect={() => handleSelect(check.id)}
          />
        ))}
      </div>

      {/* Inline result */}
      {selectedCheck && (
        <div ref={resultRef} className="mt-6 scroll-mt-6">
          {/* Context strip */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-base">{selectedCheck.flag}</span>
            <span className="text-sm font-semibold text-gray-700">{selectedCheck.locationLabel}</span>
            <span className="text-xs text-gray-400">— {selectedCheck.hook}</span>
            {selectedCheck.citySlug && (
              <Link
                href={`/financial-position/${selectedCheck.citySlug}`}
                className="ml-auto text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors whitespace-nowrap"
              >
                See {selectedCheck.citySlug.replace(/-/g, " ")} city page →
              </Link>
            )}
          </div>

          <PathResultComponent
            result={selectedCheck.result}
            onReset={handleReset}
            resetLabel="Check mine →"
          />
        </div>
      )}
    </section>
  );
}
