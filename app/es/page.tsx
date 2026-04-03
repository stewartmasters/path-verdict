import type { Metadata } from "next";
import Link from "next/link";
import { getAllEsCityGuideSlugs, getAllCityGuides } from "@/lib/cityGuide";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const metadata: Metadata = {
  title: "PathVerdict — ¿Estás en el camino financiero correcto?",
  description:
    "Comprueba si estás ahorrando lo suficiente con tu sueldo en tu ciudad. Datos reales, 30 segundos, sin registro.",
  alternates: {
    canonical: `${BASE_URL}/es`,
    languages: {
      "en": `${BASE_URL}`,
      "es": `${BASE_URL}/es`,
      "x-default": `${BASE_URL}`,
    },
  },
};

export default function EsHomePage() {
  const esSlugs = getAllEsCityGuideSlugs();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-10 space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
          ¿Estás en el camino financiero correcto?
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Compara tus ahorros con datos reales de tu ciudad. Sin registro, resultado en 30 segundos.
        </p>
        <Link
          href="/"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Usar la calculadora →
        </Link>
      </div>

      {esSlugs.length > 0 && (
        <div className="mt-12">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Guías de ciudades</p>
          <div className="space-y-1">
            {esSlugs.map(({ slug }) => (
              <Link
                key={slug}
                href={`/es/guia-ciudades/${slug}`}
                className="block py-3 border-b border-gray-100 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                {slug.replace(/-/g, " ")} →
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
