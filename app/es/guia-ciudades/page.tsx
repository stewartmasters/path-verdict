import type { Metadata } from "next";
import Link from "next/link";
import { getAllCityGuides, getAllEsCityGuideSlugs } from "@/lib/cityGuide";
import { getEsCityGuidePost } from "@/lib/cityGuide";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const metadata: Metadata = {
  title: "Guía de ciudades — PathVerdict",
  description:
    "Guías de ahorro y situación financiera por ciudad. Descubre qué tasa de ahorro es normal en tu ciudad con datos reales.",
  alternates: {
    canonical: `${BASE_URL}/es/guia-ciudades`,
    languages: {
      "en": `${BASE_URL}/city-guide`,
      "es": `${BASE_URL}/es/guia-ciudades`,
      "x-default": `${BASE_URL}/city-guide`,
    },
  },
};

export default function EsGuiaCiudadesIndex() {
  const slugs = getAllEsCityGuideSlugs();
  const posts = slugs
    .map(({ slug }) => getEsCityGuidePost(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof getEsCityGuidePost>>[];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Guía de ciudades</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
          Situación financiera por ciudad
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Tasas de ahorro, coste de vida y benchmarks financieros para las principales ciudades del mundo.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">Próximamente — vuelve pronto.</p>
      ) : (
        <div className="space-y-px">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/es/guia-ciudades/${post.slug}`}
              className="group block py-5 border-b border-gray-100 hover:border-teal-200 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2 text-xs text-gray-400">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                </time>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-1">
                {post.title}
              </h2>
              {post.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{post.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-14 bg-gray-900 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">¿Dónde estás financieramente?</h2>
        <p className="text-gray-400 text-sm">Introduce tus ingresos, alquiler y gastos. Veredicto en 30 segundos.</p>
        <Link
          href="/"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Obtener mi veredicto →
        </Link>
      </div>
    </div>
  );
}
