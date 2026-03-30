"use client";

import { useState } from "react";
import { LOCATIONS, calculateSalary, getConfidenceLevel, type SalaryResult, type ConfidenceLevel, type RoleSlug } from "@/lib/salary-data";
import { ES_ALL_ROLES, ES_CITIES } from "@/lib/es/config";
import SalaryResultES from "./SalaryResultES";
import { track } from "@/lib/analytics";
import { getSkillsForRole, type SkillSlug } from "@/lib/skills-data";

interface Props {
  defaultRoleDataSlug?: string;
  defaultCityDataSlug?: string;
}

export default function SalaryToolES({ defaultRoleDataSlug = "", defaultCityDataSlug = "" }: Props) {
  const [roleDataSlug, setRoleDataSlug] = useState(defaultRoleDataSlug);
  const [cityDataSlug, setCityDataSlug] = useState(defaultCityDataSlug);
  const [years, setYears] = useState(5);
  const [currentSalary, setCurrentSalary] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<SkillSlug[]>([]);
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [meta, setMeta] = useState<{ roleLabel?: string; cityLabel?: string; confidence?: ConfidenceLevel }>({});
  const [error, setError] = useState("");

  const availableSkills = roleDataSlug ? getSkillsForRole(roleDataSlug as RoleSlug) : [];

  const toggleSkill = (slug: SkillSlug) => {
    setSelectedSkills((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  };

  // Group ES roles by category for the dropdown
  const categories = Array.from(new Set(ES_ALL_ROLES.map((r) => r.category)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!roleDataSlug) return setError("Por favor, selecciona tu puesto de trabajo.");
    if (!cityDataSlug) return setError("Por favor, selecciona tu ubicación.");
    const salary = parseInt(currentSalary.replace(/[^0-9]/g, ""), 10);
    if (!salary || salary < 10000 || salary > 2000000)
      return setError("Por favor, introduce un salario anual válido.");

    const res = calculateSalary(roleDataSlug, cityDataSlug, years, salary);
    const role = ES_ALL_ROLES.find((r) => r.dataSlug === roleDataSlug);
    const city = ES_CITIES.find((c) => c.dataSlug === cityDataSlug)
      ?? LOCATIONS.find((l) => l.slug === cityDataSlug);

    setMeta({
      roleLabel: role?.label,
      cityLabel: "label" in (city ?? {}) ? (city as { label: string }).label : undefined,
      confidence: getConfidenceLevel(roleDataSlug, cityDataSlug),
    });
    setResult(res);
    track("salary_calculated", { verdict: res.verdict, percentile: res.percentile, role: roleDataSlug, location: cityDataSlug, years });
  };

  const handleReset = () => {
    setResult(null);
    setCurrentSalary("");
    setError("");
    setMeta({});
    setSelectedSkills([]);
    track("check_another");
  };

  const handleEdit = () => {
    setResult(null);
    setError("");
    track("edit_inputs");
  };

  if (result) {
    return (
      <SalaryResultES
        result={result}
        yearsOfExp={years}
        onReset={handleReset}
        onEdit={handleEdit}
        roleLabel={meta.roleLabel}
        cityLabel={meta.cityLabel}
        confidenceLevel={meta.confidence}
        selectedSkills={selectedSkills}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Puesto de trabajo</label>
        <select
          value={roleDataSlug}
          onChange={(e) => { setRoleDataSlug(e.target.value); setSelectedSkills([]); }}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Selecciona tu puesto...</option>
          {categories.map((cat) => (
            <optgroup key={cat} label={cat}>
              {ES_ALL_ROLES.filter((r) => r.category === cat).map((r) => (
                <option key={r.dataSlug} value={r.dataSlug}>{r.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Ciudad</label>
        <select
          value={cityDataSlug}
          onChange={(e) => setCityDataSlug(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Selecciona tu ciudad...</option>
          <optgroup label="España">
            {ES_CITIES.map((c) => (
              <option key={c.dataSlug} value={c.dataSlug}>{c.label}</option>
            ))}
          </optgroup>
          <optgroup label="Europa">
            {LOCATIONS.filter((l) => !ES_CITIES.find((ec) => ec.dataSlug === l.slug) && l.slug !== "europe").map((l) => (
              <option key={l.slug} value={l.slug}>{l.label}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-gray-700">Años de experiencia</label>
          <span className="text-sm font-bold text-orange-500">
            {years === 0 ? "< 1 año" : years === 15 ? "15+ años" : `${years} años`}
          </span>
        </div>
        <input
          type="range" min={0} max={15} step={1} value={years}
          onChange={(e) => setYears(parseInt(e.target.value))}
          className="w-full accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0 años</span><span>5 años</span><span>10 años</span><span>15+ años</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Salario actual (anual bruto)</label>
        <input
          type="text" inputMode="numeric" placeholder="p. ej. 45000"
          value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400">Salario bruto anual, sin bonus ni variables</p>
      </div>

      {availableSkills.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Habilidades clave <span className="text-gray-400 font-normal">(opcional, máx. 3)</span>
            </label>
            {selectedSkills.length > 0 && (
              <button type="button" onClick={() => setSelectedSkills([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Borrar
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
          {selectedSkills.length === 3 && <p className="text-xs text-gray-400">Máximo 3 habilidades seleccionadas.</p>}
        </div>
      )}

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-base shadow-sm shadow-orange-200"
      >
        Ver mi resultado →
      </button>

      <p className="text-xs text-gray-400 text-center">Sin registro. Resultado inmediato y privado.</p>
    </form>
  );
}
