"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight flex-shrink-0">
          Path<span className="text-teal-600">Verdict</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6 text-sm">
          <Link
            href="/methodology"
            className="transition-colors hidden md:block text-gray-500 hover:text-gray-900"
          >
            Methodology
          </Link>
          <a
            href="https://www.salaryverdict.com"
            className="transition-colors hidden sm:block text-gray-500 hover:text-gray-900 text-xs"
            target="_blank"
            rel="noopener noreferrer"
          >
            SalaryVerdict
          </a>
          <a
            href="https://www.spendverdict.com"
            className="transition-colors hidden sm:block text-gray-500 hover:text-gray-900 text-xs"
            target="_blank"
            rel="noopener noreferrer"
          >
            SpendVerdict
          </a>
          <Link
            href="/#path-tool"
            className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-colors flex-shrink-0 whitespace-nowrap"
          >
            Get my verdict
          </Link>
        </div>
      </div>
    </nav>
  );
}
