import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blog-posts-path";
import { getAllMarkdownPosts } from "@/lib/markdown";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const metadata: Metadata = {
  title: "Blog — PathVerdict",
  description: "Data-driven articles on savings rates, financial position, and building wealth. Based on household expenditure survey data from 11 countries.",
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: "Blog — PathVerdict",
    description: "Data-driven articles on savings rates, financial position, and building wealth.",
    url: `${BASE_URL}/blog`,
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
};

export default function BlogIndex() {
  // Static posts take priority; markdown posts fill in anything not already covered
  const staticSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
  const markdownPosts = getAllMarkdownPosts().filter((p) => !staticSlugs.has(p.slug));
  const allPosts = [...BLOG_POSTS, ...markdownPosts];
  const sorted = allPosts.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">Blog</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          The PathVerdict blog
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          Data-driven takes on savings rates, financial position, and how income actually translates into wealth — or doesn&apos;t.
        </p>
      </div>

      <div className="space-y-6">
        {sorted.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400">{post.readTime}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-2 leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {post.description}
            </p>
            <span className="inline-block mt-3 text-xs font-semibold text-teal-600 group-hover:text-teal-700">
              Read article →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="bg-gray-900 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Check your own position</h2>
          <p className="text-gray-400 text-sm">Enter your income, rent, and expenses. Get a benchmarked verdict in 30 seconds.</p>
          <Link
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Get my verdict →
          </Link>
        </div>
      </div>
    </div>
  );
}
