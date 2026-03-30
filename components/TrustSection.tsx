import Link from "next/link";
import Image from "next/image";
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

  // Shared logo element — fixed 28px height, max 76px wide, grayscale
  const LogoList = () => (
    <>
      {TRUST_SOURCES.map(({ src, alt }) => (
        <div key={alt} className="h-[28px] w-[76px] flex items-center justify-center flex-shrink-0">
          <Image
            src={src}
            alt={alt}
            width={76}
            height={28}
            className="opacity-40 grayscale hover:opacity-60 transition-opacity"
            style={{ maxHeight: "100%", maxWidth: "100%", width: "auto", objectFit: "contain" }}
          />
        </div>
      ))}
    </>
  );

  if (variant === "minimal") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LogoList />
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-3">
        Built using official public salary datasets and verified market benchmarks
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
        <LogoList />
        <span className="text-xs text-gray-400 font-medium">+ national statistical offices</span>
      </div>
      <p className="text-xs text-gray-400 mb-2.5">Coverage varies by role and location.</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-300">
          Updated {MONTH_YEAR} · Based on public benchmarks &amp; structured modelling
        </p>
        <Link href="/methodology" className="text-xs text-orange-500 hover:underline font-medium whitespace-nowrap ml-3">
          How we calculate →
        </Link>
      </div>
    </div>
  );
}
