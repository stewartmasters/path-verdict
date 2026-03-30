"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type SalaryResult, formatSalary, type ConfidenceLevel, getSeniorityBands, getSeniorityLabel, ROLES } from "@/lib/salary-data";
import { ES_VERDICT, ES_CONFIDENCE_LABELS } from "@/lib/es/config";
import { track } from "@/lib/analytics";
import { getCompanyTypeComparison } from "@/lib/company-type-data";
import { calculateSkillsPremium, type SkillSlug } from "@/lib/skills-data";
import { getGenderPayGap } from "@/lib/gender-pay-gap";

const SAVE_KEY = "salary_verdict_saved_es";

interface Props {
  result: SalaryResult;
  yearsOfExp?: number;
  onReset: () => void;
  onEdit?: () => void;
  roleLabel?: string;
  cityLabel?: string;
  confidenceLevel?: ConfidenceLevel;
  selectedSkills?: SkillSlug[];
}

function ordinalEs(n: number): string {
  return `percentil ${n}`;
}

function buildShareCardEs(
  verdict: SalaryResult["verdict"],
  percentile: number,
  deltaStr: string,
  roleLabel?: string,
  cityLabel?: string
): string {
  const ctx = roleLabel && cityLabel ? `${roleLabel} · ${cityLabel}` : (roleLabel ?? cityLabel ?? "");
  const pctLine = percentile <= 50
    ? `En el ${100 - percentile}% más bajo para mi puesto`
    : `En el ${100 - percentile}% más alto para mi puesto`;
  const lines: string[] = [];
  if (verdict === "well-below") lines.push(`😬 Probablemente cobro ~${deltaStr} por debajo del mercado`);
  else if (verdict === "slightly-below") lines.push("😐 Mi salario puede estar algo por debajo del mercado");
  else if (verdict === "above") lines.push("😎 Estoy por encima del mercado");
  else lines.push("🙂 Estoy en línea con el mercado");
  lines.push(pctLine);
  if (ctx) lines.push(ctx);
  lines.push("salaryverdict.com/es");
  return lines.join("\n");
}

const ES_GAP_CATEGORY_LABELS: Record<string, string> = {
  "tech roles": "puestos tecnológicos",
  "creative & design roles": "puestos de diseño y creatividad",
  "management roles": "puestos de gestión",
  "sales & marketing roles": "puestos de ventas y marketing",
};

export default function SalaryResultES({ result, yearsOfExp, onReset, onEdit, roleLabel, cityLabel, confidenceLevel, selectedSkills = [] }: Props) {
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
        if (parsed.verdict === result.verdict && parsed.roleSlug === result.roleSlug && parsed.locationSlug === result.locationSlug) setSaved(true);
      }
    } catch { /* ignore */ }
  }, [result]);

  const handleSave = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        verdict: result.verdict, percentile: result.percentile, median: result.median,
        delta: result.delta, currency: result.currency, roleSlug: result.roleSlug,
        locationSlug: result.locationSlug, roleLabel, cityLabel, savedAt: new Date().toISOString(),
      }));
      setSaved(true);
      track("result_saved" as Parameters<typeof track>[0]);
    } catch { /* ignore */ }
  };

  const config = ES_VERDICT[result.verdict];
  const { currency, low, median, high, percentile, delta, recordCount, sourceCount } = result;
  const currentSalary = median + delta;
  const deltaAbs = Math.abs(delta);
  const deltaStr = formatSalary(Math.round(deltaAbs / 500) * 500, currency);
  const gapDisplay = Math.round(deltaAbs / 500) * 500 === 0 ? "—" : `${delta > 0 ? "+" : "-"}${deltaStr}`;
  const barPos = Math.max(4, Math.min(94, percentile));
  const isBelow = result.verdict === "well-below" || result.verdict === "slightly-below";
  const showWhyItMatters = isBelow && deltaAbs >= 1000;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!email || !email.includes("@")) { setEmailError("Por favor, introduce un email válido."); return; }
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ "form-name": "salary-leads", email, verdict: result.verdict, role: result.roleSlug ?? "", location: result.locationSlug ?? "" }).toString(),
      });
      setEmailSubmitted(true);
      track("email_captured", { verdict: result.verdict });
    } catch { setEmailError("Algo ha fallado. Por favor, inténtalo de nuevo."); }
  };
  const fiveYearStr = showWhyItMatters ? formatSalary(Math.round((deltaAbs * 5) / 1000) * 1000, currency) : null;
  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://salaryverdict.com/es";
  const shareCard = buildShareCardEs(result.verdict, percentile, deltaStr, roleLabel, cityLabel);
  const pctBelow = 100 - percentile;
  const roleCtx = roleLabel ? `${roleLabel}s` : "este puesto";
  const cityCtx = cityLabel ? ` en ${cityLabel}` : "";
  const percentileHeadline = percentile <= 50
    ? `${pctBelow}% más bajo para ${roleCtx}${cityCtx}`
    : `${100 - percentile}% más alto para ${roleCtx}${cityCtx}`;
  const percentileMicrocopy = isBelow
    ? `Cobras menos que aproximadamente el ${pctBelow}% de personas en roles similares.`
    : result.verdict === "above"
    ? `Cobras más que aproximadamente el ${percentile}% de personas en roles similares.`
    : "Cobras aproximadamente lo mismo que la mayoría de personas en tu puesto.";

  const MONTH_YEAR = new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const confidence = confidenceLevel ? ES_CONFIDENCE_LABELS[confidenceLevel as keyof typeof ES_CONFIDENCE_LABELS] : null;
  const seniorityLabel = yearsOfExp !== undefined
    ? (yearsOfExp <= 2 ? "Junior" : yearsOfExp <= 6 ? "Mid-level" : yearsOfExp <= 12 ? "Senior" : "Lead")
    : null;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareCard + "\n\n")}&url=${encodeURIComponent(pageUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareCard + "\n\n" + pageUrl)}`;

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); setCopiedLink(true); track("share_link_copied"); setTimeout(() => setCopiedLink(false), 2500); } catch { /* ignore */ }
  };
  const handleCopyCard = async () => {
    try { await navigator.clipboard.writeText(shareCard); setCopiedCard(true); track("share_text_copied"); setTimeout(() => setCopiedCard(false), 2500); } catch { /* ignore */ }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">

      {/* TRUST / STATUS ROW */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.badge}`}>
            {config.badgeLabel}
          </span>
          {seniorityLabel && <span className="text-xs text-gray-400">Nivel {seniorityLabel}</span>}
        </div>
        <div className="flex items-center gap-3">
          {confidence && (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${confidence.color}`}>
              {confidence.label}
            </span>
          )}
          <span className="text-xs text-gray-400 capitalize">{MONTH_YEAR}</span>
          {onEdit && (
            <button onClick={onEdit} className="text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors underline underline-offset-2">
              Editar
            </button>
          )}
        </div>
      </div>
      {recordCount != null && recordCount > 0 && (
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-xs text-gray-400">
            {sourceCount != null && sourceCount > 0 ? `Basado en ${sourceCount} fuente${sourceCount !== 1 ? "s" : ""} · ` : ""}
            {recordCount} registros salariales
          </p>
        </div>
      )}

      {/* HERO VERDICT */}
      <div className={`px-5 pt-5 pb-5 ${config.heroBg}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          Respuesta corta:{" "}
          <span className="text-gray-700 normal-case tracking-normal font-semibold">{config.shortAnswer}</span>
        </p>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 flex-shrink-0" role="img" aria-hidden="true">{config.emoji}</span>
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{config.headline}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{config.heroSub}</p>
          </div>
        </div>

        {/* 3-stat row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">Tu salario</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{formatSalary(currentSalary, currency)}</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center ring-1 ring-gray-200 shadow-sm">
            <div className="text-xs text-gray-400 font-medium mb-1">Mediana del mercado</div>
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{formatSalary(median, currency)}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 font-medium mb-1">Diferencia</div>
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
            {copiedCard ? "✓ ¡Copiado!" : "Compartir resultado →"}
          </button>
          <Link
            href="/methodology"
            className="text-xs text-gray-400 hover:text-orange-500 transition-colors whitespace-nowrap"
          >
            Metodología →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">

        {/* PERCENTILE */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="font-bold text-gray-900 text-base">{percentileHeadline}</h3>
          <div className="space-y-2">
            <div className="relative h-2.5 bg-gray-200 rounded-full overflow-visible">
              <div className={`absolute left-0 top-0 h-full ${config.barColor} rounded-full transition-all duration-700`} style={{ width: `${barPos}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md" style={{ left: `calc(${barPos}% - 8px)` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>Más bajo</span>
              <span className="text-gray-700 font-bold">{ordinalEs(percentile)}</span>
              <span>Más alto</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{percentileMicrocopy}</p>
        </div>

        {/* MARKET RANGE */}
        <div className="px-5 py-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Horquilla salarial del mercado</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Bajo", value: formatSalary(low, currency), sub: "Percentil 25" },
              { label: "Mediana", value: formatSalary(median, currency), sub: "Percentil 50", hl: true },
              { label: "Alto", value: formatSalary(high, currency), sub: "Percentil 75" },
            ].map(({ label, value, sub, hl }) => (
              <div key={label} className={`rounded-xl p-3 text-center ${hl ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                <div className={`text-xs font-medium mb-1 ${hl ? "text-gray-400" : "text-gray-400"}`}>{label}</div>
                <div className={`font-bold text-sm sm:text-base ${hl ? "text-white" : "text-gray-700"}`}>{value}</div>
                <div className={`text-xs mt-0.5 ${hl ? "text-gray-500" : "text-gray-400"}`}>{sub}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Solo salario base bruto. No incluye bonus, variable ni equity.</p>
        </div>

        {/* TRAYECTORIA PROFESIONAL */}
        {result.roleSlug && result.locationSlug && (() => {
          const bands = getSeniorityBands(result.roleSlug, result.locationSlug);
          const levels = [
            { key: "junior", label: "Junior",    data: bands.junior, years: "0–2 años" },
            { key: "mid",    label: "Mid-level", data: bands.mid,    years: "3–6 años" },
            { key: "senior", label: "Senior",    data: bands.senior, years: "7+ años"  },
          ] as const;
          const currentLevel = yearsOfExp !== undefined ? getSeniorityLabel(yearsOfExp).toLowerCase().replace("-level", "") : null;
          const maxMedian = bands.senior.median;
          const currentBandIndex = levels.findIndex((l) => l.key === currentLevel);
          const nextBand = currentBandIndex >= 0 && currentBandIndex < levels.length - 1 ? levels[currentBandIndex + 1] : null;
          const nextPct = nextBand ? Math.round(((nextBand.data.median - levels[currentBandIndex].data.median) / levels[currentBandIndex].data.median) * 100) : null;
          return (
            <div className="px-5 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">Trayectoria profesional</h3>
                {roleLabel && cityLabel && <span className="text-xs text-gray-400">{roleLabel} · {cityLabel}</span>}
              </div>
              <div className="space-y-2.5">
                {levels.map(({ key, label, data, years: yrs }) => {
                  const isCurrentLevel = key === currentLevel;
                  const barPct = Math.round((data.median / maxMedian) * 100);
                  return (
                    <div key={key} className={`rounded-xl p-3 ${isCurrentLevel ? "bg-orange-50 ring-1 ring-orange-200" : "bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrentLevel ? "text-orange-700" : "text-gray-700"}`}>{label}</span>
                          <span className="text-xs text-gray-400">{yrs}</span>
                          {isCurrentLevel && <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">tú</span>}
                        </div>
                        <span className={`text-sm font-bold ${isCurrentLevel ? "text-orange-700" : "text-gray-600"}`}>{formatSalary(data.median, bands.currency)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${isCurrentLevel ? "bg-orange-400" : "bg-gray-300"}`} style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {nextBand && nextPct !== null && (
                <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-orange-200 pl-3">
                  La mediana de mercado para {nextBand.label} es{" "}
                  <strong className="text-gray-700">{formatSalary(nextBand.data.median, bands.currency)}</strong>
                  {" "}— un <strong className="text-gray-700">+{nextPct}%</strong> sobre la mediana {levels[currentBandIndex]?.label.toLowerCase()} actual.
                </p>
              )}
              {!nextBand && currentLevel === "senior" && (
                <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-orange-200 pl-3">
                  Estás en nivel senior — el máximo de la progresión estándar para este puesto.
                </p>
              )}
            </div>
          );
        })()}

        {/* LO QUE PAGAN DISTINTOS EMPLEADORES */}
        {result.roleSlug && result.locationSlug && (() => {
          const roleCategory = ROLES.find((r) => r.slug === result.roleSlug)?.category ?? "Engineering";
          const comparisons = getCompanyTypeComparison(result.median, roleCategory, result.currency);
          const maxSalary = comparisons[0].salary;
          return (
            <div className="px-5 py-5 space-y-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">Lo que pagan distintos empleadores</h3>
                {roleLabel && cityLabel && <span className="text-xs text-gray-400">{roleLabel} · {cityLabel}</span>}
              </div>
              <div className="space-y-2">
                {comparisons.map(({ type, label, description, salary, isBaseline, equity }) => {
                  const barPct = Math.round((salary / maxSalary) * 100);
                  return (
                    <div key={type} className={`rounded-xl p-3 ${isBaseline ? "bg-orange-50 ring-1 ring-orange-200" : "bg-gray-50"}`}>
                      <div className="flex items-start justify-between mb-1.5 gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm font-bold ${isBaseline ? "text-orange-700" : "text-gray-700"}`}>{label}</span>
                            {isBaseline && <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">mediana de mercado</span>}
                            {equity && <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">+ equity</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${isBaseline ? "text-orange-700" : "text-gray-600"}`}>{formatSalary(salary, result.currency)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${isBaseline ? "bg-orange-400" : "bg-gray-300"}`} style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">Solo salario base estimado. Equity, bonus y beneficios varían significativamente según empresa y fase.</p>
            </div>
          );
        })()}

        {/* PRIMA POR HABILIDADES */}
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
              <h3 className="font-bold text-gray-900 text-base">Prima por tus habilidades</h3>
              <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm text-gray-600">{breakdown.map((b) => b.skill.label).join(" + ")}</p>
                    <p className="text-xs text-gray-400">Estimación de prima para tu puesto y ubicación</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-orange-600">+{pctDisplay}%</p>
                    <p className="text-xs text-gray-400">+{formatSalary(additionalSalary, result.currency)}</p>
                  </div>
                </div>
                <div className="border-t border-orange-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Tasa de mercado ajustada por habilidades</span>
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
              <p className="text-xs text-gray-400 leading-relaxed">Estimaciones basadas en Levels.fyi Europe 2024 y LinkedIn Salary Insights. Las primas varían según empresa y condiciones del mercado.</p>
            </div>
          );
        })()}

        {/* BRECHA SALARIAL DE GÉNERO */}
        {result.roleSlug && result.locationSlug && (() => {
          const roleCategory = ROLES.find((r) => r.slug === result.roleSlug)?.category ?? "";
          const gpg = getGenderPayGap(result.locationSlug, roleCategory);
          if (!gpg) return null;
          const catLabelEs = ES_GAP_CATEGORY_LABELS[gpg.categoryLabel] ?? gpg.categoryLabel;
          return (
            <div className="px-5 py-4 border-t border-gray-100 flex items-start gap-3">
              <span className="text-base mt-0.5 flex-shrink-0" aria-hidden="true">⚖️</span>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Brecha salarial de género — {gpg.countryName}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Las mujeres en {catLabelEs} ganan aproximadamente{" "}
                  <strong className="text-gray-700">{gpg.gapPct}% menos</strong> que los hombres
                  en {gpg.countryName}. La mediana de mercado anterior incluye todos los géneros.
                </p>
                <p className="text-xs text-gray-400">Fuente: {gpg.sourceLabel}</p>
              </div>
            </div>
          );
        })()}

        {/* WHY IT MATTERS */}
        {showWhyItMatters ? (
          <div className="px-5 py-5 space-y-2">
            <h3 className="font-bold text-gray-900 text-base">Por qué importa</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Una diferencia de {deltaStr} hoy suele acumularse con el tiempo. En 5 años, eso equivale a{" "}
              <strong className="text-gray-800">{fiveYearStr}</strong> en retribución bruta — antes de considerar futuras subidas.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-orange-200 pl-3">{config.nextStep}</p>
          </div>
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">{config.nextStep}</p>
          </div>
        )}

        {/* EMAIL CAPTURE */}
        {!emailSubmitted ? (
          <div className="px-5 py-5 bg-orange-50">
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Recibe consejos de salario por email</p>
            <p className="text-xs text-gray-500 mb-3">Información mensual sobre salarios y negociación. Sin spam. Baja cuando quieras.</p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com"
                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
              <button type="submit" className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap flex-shrink-0">
                Suscribirse
              </button>
            </form>
            {emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
          </div>
        ) : (
          <div className="px-5 py-4 bg-orange-50">
            <p className="text-sm font-semibold text-emerald-700">✓ ¡Apuntado!</p>
            <p className="text-xs text-gray-500 mt-0.5">Te enviaremos información salarial una vez al mes.</p>
          </div>
        )}

        {/* SHARE */}
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">Comparte tu resultado</h3>
            <span className="text-xs text-gray-400">Compara con un amigo →</span>
          </div>
          <div className="bg-gray-900 rounded-xl px-4 py-3.5 font-mono text-xs text-gray-200 whitespace-pre leading-relaxed select-all cursor-pointer" onClick={handleCopyCard}>
            {shareCard}
          </div>
          <button onClick={handleCopyCard} className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors">
            {copiedCard ? "✓ ¡Copiado!" : "Copiar y compartir"}
          </button>
          <div className="grid grid-cols-3 gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("share_whatsapp")} className="flex items-center justify-center text-xs font-semibold bg-green-500 text-white py-2.5 px-2 rounded-lg hover:bg-green-600 transition-colors">
              WhatsApp
            </a>
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("share_linkedin")} className="flex items-center justify-center text-xs font-semibold bg-blue-600 text-white py-2.5 px-2 rounded-lg hover:bg-blue-700 transition-colors">
              LinkedIn
            </a>
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("share_twitter")} className="flex items-center justify-center text-xs font-semibold bg-black text-white py-2.5 px-2 rounded-lg hover:bg-gray-900 transition-colors">
              X
            </a>
          </div>
          <button onClick={handleCopyLink} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors text-center">
            {copiedLink ? "✓ Enlace copiado" : "o copiar enlace"}
          </button>
        </div>

        {/* EXPLORAR MÁS */}
        <div className="px-5 py-4 bg-gray-50 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explorar más</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={onReset} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors text-sm">
              Comprobar otro salario →
            </button>
            <Link href="/es/" className="flex items-center justify-center text-xs font-medium border border-gray-200 bg-white text-gray-700 py-2.5 px-3 rounded-lg hover:border-orange-200 hover:text-orange-600 transition-colors text-center">
              Ver guías de salario en España
            </Link>
          </div>
          <button onClick={handleSave} disabled={saved} className="w-full text-xs font-medium text-gray-400 hover:text-gray-600 py-1 transition-colors disabled:cursor-default text-center">
            {saved ? "✓ Guardado en este navegador" : "Guardar resultado para revisarlo más tarde"}
          </button>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-gray-50">
          <p className="text-xs text-gray-400">
            Basado en datos oficiales de salarios (Eurostat, INE, Destatis) y benchmarks de mercado verificados.{" "}
            <Link href="/methodology" className="text-orange-500 hover:underline">Metodología →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
