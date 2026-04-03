import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      "en": "https://pathverdict.com",
      "es": "https://pathverdict.com/es",
      "x-default": "https://pathverdict.com",
    },
  },
};

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
