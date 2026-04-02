import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllCityGuideSlugs, getCityGuidePost } from "@/lib/cityGuide";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCityGuideSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getCityGuidePost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${BASE_URL}/city-guide/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `${BASE_URL}/city-guide/${slug}`,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function CityGuidePage({ params }: Props) {
  const { slug } = await params;
  const post = getCityGuidePost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `${BASE_URL}/city-guide/${slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/city-guide/${slug}` },
    author: { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: "PathVerdict" },
    publisher: { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: "PathVerdict", url: BASE_URL },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "City Guides", item: `${BASE_URL}/city-guide` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/city-guide/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/city-guide" className="hover:text-teal-600 transition-colors">City Guides</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
            <span>{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
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
          <h2 className="text-xl font-bold text-white">Find out where you actually stand</h2>
          <p className="text-gray-400 text-sm">Enter your income, rent, and expenses. Get a benchmarked verdict in 30 seconds.</p>
          <Link
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Get my verdict →
          </Link>
        </div>
      </div>
    </>
  );
}
