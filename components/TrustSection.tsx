import Link from "next/link";
import { TRUST_SOURCES } from "@/data/trustSources";

interface Props {
  /** "full" shows copy, logos, footnotes, and update date (default).
   *  "minimal" shows logos only with a single footnote line. */
  variant?: "full" | "minimal";
}

export default function TrustSection({ variant = "full" }: Props) {
  const MONTH_YEAR = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const LogoList = () => (
    <>
      {TRUST_SOURCES.map(({ src, alt }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={alt}
          src={src}
          alt={alt}
          className="opacity-50 grayscale hover:opacity-70 transition-opacity flex-shrink-0"
          style={{ height: "27px", width: "auto", mixBlendMode: "multiply" }}
        />
      ))}
    </>
  );

  if (variant === "minimal") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LogoList />
        <span className="text-xs text-gray-400 font-medium">+ INE · SCB</span>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-3">
        Benchmarks from official household expenditure and savings surveys
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
        <LogoList />
        <span className="text-xs text-gray-400 font-medium">+ INE · SCB · CSO · Stats NZ</span>
      </div>
      <p className="text-xs text-gray-400 mb-2.5">Coverage varies by country and income band.</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-300">
          Updated {MONTH_YEAR} · Based on public household expenditure data
        </p>
        <Link href="/methodology" className="text-xs text-teal-600 hover:underline font-medium whitespace-nowrap ml-3">
          How we calculate →
        </Link>
      </div>
    </div>
  );
}
