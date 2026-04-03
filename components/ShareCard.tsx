import { type IdentityCard } from "@/lib/savings-data";
import { t, type Locale } from "@/lib/i18n";

interface Props {
  card: IdentityCard;
  onClick?: () => void;
  copied?: boolean;
  locale?: Locale;
}

export default function ShareCard({ card, onClick, copied, locale = "en" }: Props) {
  const tr = t(locale);
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-[#fafafa] border border-gray-200 rounded-xl overflow-hidden
        cursor-pointer select-none transition-opacity hover:opacity-90
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.bgBarClass}`} />

      <div className="pl-5 pr-4 py-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            PathVerdict
          </span>
          {copied ? (
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{tr.cardCopied}</span>
          ) : (
            <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">{tr.tapToCopy}</span>
          )}
        </div>

        {/* Identity label — dominant */}
        <p className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight mb-2">
          {card.label}
        </p>

        {/* Stat line */}
        <p className="text-sm font-semibold text-gray-700 mb-1">
          {card.statLine}
        </p>

        {/* Comparison */}
        <p className="text-xs text-gray-400 mb-3">
          {card.comparison}
        </p>

        {/* Bottom strip */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
          <span className="text-[10px] text-gray-300 tracking-wide">pathverdict.com</span>
          <span className="text-[10px] font-semibold text-teal-600 tracking-wide">
            {tr.checkYours}
          </span>
        </div>
      </div>
    </div>
  );
}
