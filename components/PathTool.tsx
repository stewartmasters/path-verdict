"use client";

import { useState } from "react";
import {
  INCOME_BANDS,
  EXPENSE_BANDS,
  AGE_BANDS,
  calculatePath,
  type PathResult,
  type InvestsOption,
} from "@/lib/savings-data";
import PathResultComponent from "./PathResult";
import { track } from "@/lib/analytics";

const INVEST_OPTIONS: { value: InvestsOption; label: string }[] = [
  { value: "yes",       label: "Yes — consistently" },
  { value: "sometimes", label: "Sometimes" },
  { value: "no",        label: "No" },
];

export default function PathTool() {
  const [incomeBand, setIncomeBand]   = useState("");
  const [monthlyRent, setMonthlyRent] = useState(1500);
  const [expenseBand, setExpenseBand] = useState("");
  const [ageBand, setAgeBand]         = useState("");
  const [invests, setInvests]         = useState<InvestsOption | "">("");
  const [result, setResult]           = useState<PathResult | null>(null);
  const [error, setError]             = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!incomeBand) return setError("Please select your income range.");
    if (!expenseBand) return setError("Please select your monthly expenses.");

    const res = calculatePath({
      incomeBandSlug: incomeBand,
      monthlyRent,
      expenseBandSlug: expenseBand,
      ageBandSlug: ageBand || undefined,
      invests: (invests as InvestsOption) || undefined,
    });

    setResult(res);
    track("salary_calculated", { verdict: res.verdict, percentile: res.percentile });
  };

  const handleReset = () => {
    setResult(null);
    setIncomeBand("");
    setMonthlyRent(1500);
    setExpenseBand("");
    setAgeBand("");
    setInvests("");
    setError("");
    track("check_another");
  };

  const handleEdit = () => {
    setResult(null);
    setError("");
    track("edit_inputs");
  };

  if (result) {
    return <PathResultComponent result={result} onReset={handleReset} onEdit={handleEdit} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Income */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Annual income (gross)
        </label>
        <select
          value={incomeBand}
          onChange={(e) => setIncomeBand(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Select your income range...</option>
          {INCOME_BANDS.map((b) => (
            <option key={b.slug} value={b.slug}>{b.label}</option>
          ))}
        </select>
      </div>

      {/* Rent slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-gray-700">
            Monthly rent or mortgage
          </label>
          <span className="text-sm font-bold text-teal-600">
            {monthlyRent >= 5000 ? "$5,000+" : `$${monthlyRent.toLocaleString()}/mo`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={monthlyRent}
          onChange={(e) => setMonthlyRent(parseInt(e.target.value))}
          className="w-full accent-teal-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>$0</span><span>$1,000</span><span>$2,500</span><span>$5,000+</span>
        </div>
      </div>

      {/* Other expenses */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Other monthly expenses
        </label>
        <p className="text-xs text-gray-400 -mt-0.5">
          Food, transport, subscriptions, going out — everything except rent
        </p>
        <select
          value={expenseBand}
          onChange={(e) => setExpenseBand(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Select your expense range...</option>
          {EXPENSE_BANDS.map((b) => (
            <option key={b.slug} value={b.slug}>{b.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400">Use the honest number, not the ideal one.</p>
      </div>

      {/* Age — optional */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Age <span className="text-gray-400 font-normal">(optional — improves benchmark)</span>
          </label>
          {ageBand && (
            <button
              type="button"
              onClick={() => setAgeBand("")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {AGE_BANDS.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => setAgeBand(ageBand === b.slug ? "" : b.slug)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                ageBand === b.slug
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invest — optional */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Do you invest regularly? <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INVEST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInvests(invests === opt.value ? "" : opt.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                invests === opt.value
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-colors text-base shadow-sm shadow-teal-100"
      >
        Get my verdict →
      </button>

      <p className="text-xs text-gray-400 text-center">No signup required. Results are instant and private.</p>
    </form>
  );
}
