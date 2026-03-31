"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString(),
    }).finally(() => setSubmitted(true));
  }

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="font-bold text-gray-900 text-base">
              Path<span className="text-teal-600">Verdict</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              A fast, benchmarked verdict on your financial position. Income, spending, and savings — combined into one clear signal.
            </p>
            <p className="text-xs text-gray-400">
              Benchmarks from BLS CEX, ONS LCF, Destatis EVS, ABS HES, StatsCan SHS, and six other national household expenditure surveys.
            </p>

            {/* Email capture */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 mb-2">Get new benchmarks by email</p>
              {submitted ? (
                <p className="text-xs text-teal-600 font-medium">You&apos;re on the list.</p>
              ) : (
                <form
                  name="path-leads"
                  method="POST"
                  data-netlify="true"
                  onSubmit={handleSubmit}
                  className="flex gap-2"
                >
                  <input type="hidden" name="form-name" value="path-leads" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 bg-white"
                  />
                  <button
                    type="submit"
                    className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Notify me
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Site links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Site</p>
            <ul className="space-y-1.5">
              {[
                { href: "/",             label: "Financial health check" },
                { href: "/blog",         label: "Blog" },
                { href: "/methodology",  label: "Methodology" },
                { href: "/privacy",      label: "Privacy policy" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Verdict suite */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">The Verdict suite</p>
            <ul className="space-y-1.5">
              {[
                { href: "https://www.salaryverdict.com", label: "SalaryVerdict", sub: "Are you paid fairly?" },
                { href: "https://www.spendverdict.com",  label: "SpendVerdict",  sub: "Is your rent too high?" },
                { href: "https://pathverdict.com",       label: "PathVerdict",   sub: "Are you on track?" },
              ].map(({ href, label, sub }) => (
                <li key={href}>
                  <a href={href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors">
                    {label} <span className="text-gray-400">— {sub}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {year} PathVerdict — Benchmarks are modelled from public data and do not constitute financial advice.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/methodology" className="hover:text-teal-600 transition-colors">Methodology</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
