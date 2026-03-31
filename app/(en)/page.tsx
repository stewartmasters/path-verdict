import type { Metadata } from "next";
import PathTool from "@/components/PathTool";
import PopularChecks from "@/components/PopularChecks";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export const metadata: Metadata = {
  title: "PathVerdict — Are You Financially On Track?",
  description:
    "Find out if you're building wealth or falling behind. Benchmarked against real income and savings data. 30 seconds, no signup required.",
};

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-20 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Copy */}
          <div className="space-y-6">
            <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Free · No signup · Instant result
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Find out if you&apos;re building wealth —{" "}
              <span className="text-teal-600">or just surviving</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed">
              Most people assume they&apos;re on track. They&apos;re not. PathVerdict benchmarks your income, spending, and savings against real data — and delivers a verdict in under 30 seconds.
            </p>

            {/* Trust stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { value: "7",    label: "Income bands" },
                { value: "200+", label: "City datasets" },
                { value: "BLS",  label: "Data source" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Bullets */}
            <ul className="space-y-2 pt-1">
              {[
                "Your savings rate, benchmarked against people earning like you",
                "See exactly where you fall: Behind, Stable, On Track, or Ahead",
                "No spreadsheets. No guesswork. One clear financial position.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-teal-500 font-bold mt-0.5 flex-shrink-0">→</span>
                  {line}
                </li>
              ))}
            </ul>

            {/* Trust strip */}
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <p className="text-xs text-gray-500 font-medium">Built using public data:</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 font-medium">
                <span>BLS Consumer Expenditure Survey</span>
                <span>·</span>
                <span>Fed Survey of Consumer Finances</span>
                <span>·</span>
                <span>50,000+ financial profiles</span>
              </div>
            </div>

            {/* Suite links */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Also in the Verdict suite</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: "https://www.salaryverdict.com", label: "SalaryVerdict — Are you underpaid?" },
                  { href: "https://www.spendverdict.com",  label: "SpendVerdict — Is your rent too high?" },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Tool */}
          <div id="path-tool" className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-6 sm:p-8 min-w-0">
            <PathTool />
          </div>
        </div>
      </section>

      <PopularChecks />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-t border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Enter your numbers",
              desc: "Income, rent, and monthly expenses. Optional: your age and whether you invest.",
            },
            {
              step: "02",
              title: "We calculate your savings rate",
              desc: "We compare what you keep against income-adjusted benchmarks from real spending data.",
            },
            {
              step: "03",
              title: "Get a clear financial verdict",
              desc: "See your savings rate, your expected rate, the gap, and exactly where you stand.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="space-y-3">
              <div className="text-3xl font-black text-teal-100">{step}</div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verdict tiers */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">The four financial positions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tier: "Critical",         color: "bg-red-50 border-red-100",      text: "text-red-700",    desc: "Spending exceeds income. Structural problem." },
            { tier: "Falling Behind",   color: "bg-orange-50 border-orange-100", text: "text-orange-700", desc: "Savings well below benchmark for your income." },
            { tier: "Stable",           color: "bg-amber-50 border-amber-100",   text: "text-amber-700",  desc: "Covering expenses but not compounding." },
            { tier: "On Track / Ahead", color: "bg-teal-50 border-teal-100",     text: "text-teal-700",   desc: "Saving at or above expected for your income level." },
          ].map(({ tier, color, text, desc }) => (
            <div key={tier} className={`p-4 rounded-xl border ${color}`}>
              <div className={`text-sm font-bold mb-1 ${text}`}>{tier}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="bg-gray-900 rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Still not sure where you stand?
          </h2>
          <p className="text-gray-400">30 seconds. No email. No login.</p>
          <ScrollToTopButton />
        </div>
      </section>
    </>
  );
}
