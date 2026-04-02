"use client";

import Link from "next/link";
import { useState } from "react";

const SITE_LINKS = [
  { href: "/",            label: "Financial health check" },
  { href: "/blog",        label: "Blog" },
  { href: "/city-guide",  label: "City guide" },
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy",     label: "Privacy policy" },
];

const CITY_LINKS = [
  { href: "/financial-position/new-york",   label: "New York" },
  { href: "/financial-position/london",     label: "London" },
  { href: "/financial-position/sydney",     label: "Sydney" },
  { href: "/financial-position/toronto",    label: "Toronto" },
  { href: "/financial-position/berlin",     label: "Berlin" },
  { href: "/financial-position/dublin",     label: "Dublin" },
  { href: "/financial-position/amsterdam",  label: "Amsterdam" },
  { href: "/financial-position/stockholm",  label: "Stockholm" },
];

const COUNTRY_LINKS = [
  { href: "/financial-position/country/united-states",  label: "🇺🇸 United States" },
  { href: "/financial-position/country/united-kingdom", label: "🇬🇧 United Kingdom" },
  { href: "/financial-position/country/australia",      label: "🇦🇺 Australia" },
  { href: "/financial-position/country/canada",         label: "🇨🇦 Canada" },
  { href: "/financial-position/country/germany",        label: "🇩🇪 Germany" },
  { href: "/financial-position/country/france",         label: "🇫🇷 France" },
  { href: "/financial-position/country/ireland",        label: "🇮🇪 Ireland" },
  { href: "/financial-position/country/netherlands",    label: "🇳🇱 Netherlands" },
  { href: "/financial-position/country/spain",          label: "🇪🇸 Spain" },
  { href: "/financial-position/country/sweden",         label: "🇸🇪 Sweden" },
  { href: "/financial-position/country/new-zealand",   label: "🇳🇿 New Zealand" },
];

const TRUST_LOGOS = [
  { src: "/logos/ons.png",      alt: "ONS" },
  { src: "/logos/destatis.png", alt: "Destatis" },
  { src: "/logos/bls.svg",      alt: "BLS" },
  { src: "/logos/abs.png",      alt: "ABS" },
  { src: "/logos/statscan.png", alt: "StatsCan" },
  { src: "/logos/cbs.png",      alt: "CBS" },
  { src: "/logos/ine.png",      alt: "INE" },
  { src: "/logos/scb.png",      alt: "SCB" },
];

const VERDICT_NETWORK = [
  { href: "https://www.compverdict.com",   label: "Comp",   accent: "text-blue-500",   suffix: "Verdict" },
  { href: "https://www.salaryverdict.com", label: "Salary", accent: "text-orange-500", suffix: "Verdict" },
  { href: "https://www.spendverdict.com",  label: "Spend",  accent: "text-violet-500", suffix: "Verdict" },
];

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

        {/* Top grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="space-y-3 lg:col-span-1">
            <div className="font-bold text-gray-900 text-base">
              Path<span className="text-teal-600">Verdict</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              A fast, benchmarked verdict on your financial position. Income, spending, and savings — combined into one clear signal.
            </p>
            <p className="text-xs text-gray-400">
              BLS CEX · ONS LCF · Destatis EVS · ABS HES · StatsCan SHS · CBS · INE · SCB · Stats NZ
            </p>
          </div>

          {/* Site */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Site</p>
            <ul className="space-y-1.5">
              {SITE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top cities */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top cities</p>
            <ul className="space-y-1.5">
              {CITY_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Countries */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">By country</p>
            <ul className="space-y-1.5">
              {COUNTRY_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Email capture */}
        <div className="border-t border-gray-200 pt-6 pb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Get savings insights</p>
          {submitted ? (
            <p className="text-sm text-teal-600 font-medium">You&apos;re on the list.</p>
          ) : (
            <>
              <form
                name="path-leads"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit}
                className="flex gap-3 max-w-lg"
              >
                <input type="hidden" name="form-name" value="path-leads" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-0 text-sm px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 bg-white"
                />
                <button
                  type="submit"
                  className="text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">Monthly savings benchmarks. No spam, unsubscribe anytime.</p>
            </>
          )}
        </div>

        {/* Trust logos */}
        <div className="border-t border-gray-200 pt-5 pb-4">
          <p className="text-xs text-gray-400 mb-3">Built using official household expenditure surveys</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {TRUST_LOGOS.map(({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={alt}
                style={{ height: "27px", width: "auto", filter: "grayscale(1)", opacity: 0.5, mixBlendMode: "multiply", flexShrink: 0 }}
              />
            ))}
          </div>
        </div>

        {/* Verdict network */}
        <div className="border-t border-gray-200 pt-5 pb-4 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">The Verdict network:</span>
          {VERDICT_NETWORK.map(({ href, label, accent, suffix }, i) => (
            <span key={href} className="flex items-center gap-3">
              {i > 0 && <span className="text-gray-300 text-sm">·</span>}
              <a href={href} className="text-sm font-semibold text-gray-700 hover:opacity-80 transition-opacity">
                {label}<span className={accent}>{suffix}</span>
              </a>
            </span>
          ))}
          <span className="text-gray-300 text-sm">·</span>
          <span className="text-sm font-semibold text-gray-700">
            Path<span className="text-teal-600">Verdict</span>
          </span>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {year} PathVerdict — Benchmarks are modelled from public data and do not constitute financial advice.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/methodology" className="hover:text-teal-600 transition-colors">Methodology</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
