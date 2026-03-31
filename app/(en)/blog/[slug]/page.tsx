import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blog-posts-path";
import { getAllMarkdownSlugs, getMarkdownPost } from "@/lib/markdown";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export async function generateStaticParams() {
  const staticParams = BLOG_POSTS.map((p) => ({ slug: p.slug }));
  const staticSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
  const markdownParams = getAllMarkdownSlugs()
    .filter((slug) => !staticSlugs.has(slug))
    .map((slug) => ({ slug }));
  return [...staticParams, ...markdownParams];
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug) ?? getMarkdownPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // Static posts take priority over markdown posts
  const post = BLOG_POSTS.find((p) => p.slug === slug) ?? getMarkdownPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    publisher: {
      "@type": "Organization",
      name: "PathVerdict",
      url: BASE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-teal-600 transition-colors">Blog</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Header */}
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

        {/* Body */}
        <div
          className="prose prose-gray max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-li:text-gray-600 prose-li:mb-1.5 prose-ul:space-y-1 prose-ol:space-y-1 prose-strong:text-gray-800 prose-strong:font-semibold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
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

        {/* Related posts — static posts only */}
        {(post.relatedPages ?? []).filter((p) => p.startsWith("/blog/")).length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Related articles</p>
            <div className="space-y-3">
              {(post.relatedPages ?? [])
                .filter((href) => href.startsWith("/blog/"))
                .map((href) => {
                  const related = BLOG_POSTS.find((p) => `/blog/${p.slug}` === href);
                  if (!related) return null;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-teal-200 transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{related.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{related.readTime}</p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
