import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEsCityGuideSlugs, getEsCityGuidePost } from "@/lib/cityGuide";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEsCityGuideSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getEsCityGuidePost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${BASE_URL}/es/guia-ciudades/${slug}`,
      languages: {
        "es": `${BASE_URL}/es/guia-ciudades/${slug}`,
        "x-default": `${BASE_URL}/es/guia-ciudades/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `${BASE_URL}/es/guia-ciudades/${slug}`,
      locale: "es_ES",
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function EsGuiaCiudadesPage({ params }: Props) {
  const { slug } = await params;
  const post = getEsCityGuidePost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `${BASE_URL}/es/guia-ciudades/${slug}`,
    inLanguage: "es",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/es/guia-ciudades/${slug}` },
    author: { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: "PathVerdict" },
    publisher: { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: "PathVerdict", url: BASE_URL },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE_URL}/es` },
      { "@type": "ListItem", position: 2, name: "Guía de ciudades", item: `${BASE_URL}/es/guia-ciudades` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/es/guia-ciudades/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
          <Link href="/es" className="hover:text-teal-600 transition-colors">Inicio</Link>
          <span>›</span>
          <Link href="/es/guia-ciudades" className="hover:text-teal-600 transition-colors">Guía de ciudades</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
            <span>
              {new Date(post.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            {post.description}
          </p>
        </header>

        <div
          className="prose prose-gray max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-li:text-gray-600 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-14 bg-gray-900 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">¿Dónde estás financieramente?</h2>
          <p className="text-gray-400 text-sm">Introduce tus ingresos, alquiler y gastos. Veredicto en 30 segundos.</p>
          <Link
            href="/es"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Obtener mi veredicto →
          </Link>
        </div>
      </div>
    </>
  );
}
