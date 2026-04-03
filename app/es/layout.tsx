import type { Metadata } from "next";
import Link from "next/link";
import LanguageSelect from "@/components/LanguageSelect";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  alternates: {
    languages: {
      "en": "https://pathverdict.com",
      "es": "https://pathverdict.com/es",
      "x-default": "https://pathverdict.com",
    },
  },
};

function NavigationES() {
  return (
    <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/es" className="font-bold text-gray-900 text-lg tracking-tight flex-shrink-0">
          Path<span className="text-teal-600">Verdict</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6 text-sm">
          <Link
            href="/es/guia-ciudades"
            className="transition-colors hidden sm:block text-gray-500 hover:text-gray-900"
          >
            Ciudades
          </Link>
          <LanguageSelect />
          <Link
            href="/#path-tool"
            className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-colors flex-shrink-0 whitespace-nowrap"
          >
            Obtener mi veredicto
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationES />
      <main lang="es">{children}</main>
      <Footer />
    </>
  );
}
