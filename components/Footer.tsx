import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
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
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Site</p>
            <ul className="space-y-1.5">
              {[
                { href: "/", label: "Financial health check" },
                { href: "/blog", label: "Blog" },
                { href: "/methodology", label: "Methodology" },
                { href: "/privacy", label: "Privacy policy" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">The Verdict suite</p>
            <ul className="space-y-1.5">
              {[
                { href: "https://www.salaryverdict.com", label: "SalaryVerdict", sub: "Are you paid fairly?" },
                { href: "https://www.spendverdict.com", label: "SpendVerdict", sub: "Is your rent too high?" },
                { href: "https://pathverdict.com", label: "PathVerdict", sub: "Are you on track?" },
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
