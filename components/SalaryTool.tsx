"use client";

import { useState, useEffect } from "react";
import { ROLES, LOCATIONS, calculateSalary, getConfidenceLevel, type SalaryResult, type RoleSlug, type ConfidenceLevel } from "@/lib/salary-data";
import SalaryResultComponent from "./SalaryResult";
import { track } from "@/lib/analytics";
import { getSkillsForRole, type SkillSlug } from "@/lib/skills-data";

interface Props {
  defaultRole?: string;
  defaultLocation?: string;
}

interface SavedResult {
  verdict: string;
  roleSlug?: string;
  locationSlug?: string;
  roleLabel?: string;
  locationLabel?: string;
  savedAt?: string;
}

const SAVE_KEY = "salary_verdict_saved";

export default function SalaryTool({ defaultRole = "", defaultLocation = "" }: Props) {
  const [role, setRole] = useState(defaultRole);
  const [location, setLocation] = useState(defaultLocation);
  const [years, setYears] = useState(5);
  const [currentSalary, setCurrentSalary] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<SkillSlug[]>([]);
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [meta, setMeta] = useState<{ roleLabel?: string; locationLabel?: string; confidence?: ConfidenceLevel }>({});
  const [error, setError] = useState("");
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);

  useEffect(() => {
    try {
      const item = localStorage.getItem(SAVE_KEY);
      if (item) {
        const parsed = JSON.parse(item) as SavedResult;
        if (parsed.verdict && parsed.roleSlug && parsed.locationSlug) {
          setSavedResult(parsed);
          track("return_visit_banner_shown");
        }
      }
    } catch {}
  }, []);

  const selectedLocation = LOCATIONS.find((l) => l.slug === location);
  const currencySymbol = selectedLocation ? selectedLocation.currency.trim() : "";
  const availableSkills = role ? getSkillsForRole(role as RoleSlug) : [];

  const toggleSkill = (slug: SkillSlug) => {
    setSelectedSkills((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!role) return setError("Please select a job title.");
    if (!location) return setError("Please select a location.");
    const salary = parseInt(currentSalary.replace(/[^0-9]/g, ""), 10);
    if (!salary || salary < 10000 || salary > 2000000) return setError("Please enter a valid annual salary.");
    const res = calculateSalary(role, location, years, salary);
    const rl = ROLES.find(r => r.slug === role)?.label;
    const ll = LOCATIONS.find(l => l.slug === location)?.label;
    setMeta({ roleLabel: rl, locationLabel: ll, confidence: getConfidenceLevel(role, location) });
    setResult(res);
    track("salary_calculated", { verdict: res.verdict, percentile: res.percentile, role, location, years });
  };

  const handleReset = () => {
    setResult(null);
    setCurrentSalary("");
    setError("");
    setMeta({});
    setSelectedSkills([]);
    track("check_another");
  };

  // Edit mode: keeps all form state, just clears the result
  const handleEdit = () => {
    setResult(null);
    setError("");
    track("edit_inputs");
  };

  const handleRecheckSaved = () => {
    if (!savedResult) return;
    setRole(savedResult.roleSlug ?? "");
    setLocation(savedResult.locationSlug ?? "");
    setSavedResult(null);
    track("return_visit_recheck");
  };

  if (result) {
    return (
      <SalaryResultComponent
        result={result}
        yearsOfExp={years}
        onReset={handleReset}
        onEdit={handleEdit}
        roleLabel={meta.roleLabel}
        locationLabel={meta.locationLabel}
        confidenceLevel={meta.confidence}
        selectedSkills={selectedSkills}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Return-visit banner */}
      {savedResult && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-orange-700">Welcome back</p>
            <p className="text-xs text-orange-600 truncate">
              Last checked: {savedResult.roleLabel ?? savedResult.roleSlug} in {savedResult.locationLabel ?? savedResult.locationSlug}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRecheckSaved}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap flex-shrink-0 transition-colors"
          >
            Recheck →
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Job title</label>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setSelectedSkills([]); }}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Select your role...</option>
          {Array.from(new Set(ROLES.map((r) => r.category))).map((cat) => (
            <optgroup key={cat} label={cat}>
              {ROLES.filter((r) => r.category === cat).map((r) => (
                <option key={r.slug} value={r.slug}>{r.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Select your location...</option>
          {Array.from(new Set(LOCATIONS.map((l) => l.country))).map((country) => (
            <optgroup key={country || "Other"} label={country || "Europe"}>
              {LOCATIONS.filter((l) => l.country === country).map((l) => (
                <option key={l.slug} value={l.slug}>{l.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-gray-700">Years of experience</label>
          <span className="text-sm font-bold text-orange-500">
            {years === 0 ? "< 1 year" : years === 15 ? "15+ years" : `${years} years`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={15}
          step={1}
          value={years}
          onChange={(e) => setYears(parseInt(e.target.value))}
          className="w-full accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0 yrs</span><span>5 yrs</span><span>10 yrs</span><span>15+ yrs</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Current salary (annual, gross)</label>
        <div className="relative">
          {currencySymbol && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none select-none">
              {currencySymbol}
            </span>
          )}
          <input
            type="text"
            inputMode="numeric"
            placeholder={currencySymbol ? "65000" : "e.g. 65000"}
            value={currentSalary}
            onChange={(e) => setCurrentSalary(e.target.value)}
            className={`w-full border border-gray-200 rounded-xl py-3 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${currencySymbol ? "pl-9" : "pl-4"}`}
          />
        </div>
        <p className="text-xs text-gray-400">Gross annual base salary, before bonus or equity</p>
      </div>

      {availableSkills.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Key skills <span className="text-gray-400 font-normal">(optional, up to 3)</span>
            </label>
            {selectedSkills.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSkills([])}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.slug);
              const isDisabled = !isSelected && selectedSkills.length >= 3;
              return (
                <button
                  key={skill.slug}
                  type="button"
                  onClick={() => toggleSkill(skill.slug)}
                  disabled={isDisabled}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-orange-500 border-orange-500 text-white"
                      : isDisabled
                      ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                      : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {skill.label}
                </button>
              );
            })}
          </div>
          {selectedSkills.length === 3 && (
            <p className="text-xs text-gray-400">Maximum 3 skills selected.</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-base shadow-sm shadow-orange-200"
      >
        Get my verdict →
      </button>

      <p className="text-xs text-gray-400 text-center">No signup required. Results are instant and private.</p>
    </form>
  );
}
