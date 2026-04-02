import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import RouteTracker from "@/components/RouteTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pathverdict.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PathVerdict — Are You Financially On Track?",
    template: "%s — PathVerdict",
  },
  description:
    "Find out if you're building wealth or falling behind. Enter your income, rent, and expenses. Get your financial position benchmarked in 30 seconds. No signup.",
  keywords: [
    "am i on track financially",
    "savings rate calculator",
    "financial health check",
    "am i saving enough",
    "financial position",
    "savings benchmark",
    "path verdict",
    "financial trajectory",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "PathVerdict",
    title: "PathVerdict — Are You Financially On Track?",
    description:
      "Find out if you're building wealth or falling behind. Benchmarked against real income and savings data. 30 seconds, no signup.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "PathVerdict — Are You Financially On Track?",
    description: "Find out if you're financially on track in 30 seconds. Free, no signup.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: "PathVerdict",
        url: BASE_URL,
        description: "Free financial health check. Find out instantly if you're on track.",
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "PathVerdict",
        url: BASE_URL,
        description: "PathVerdict benchmarks your income, spending, and savings behavior to tell you where you stand financially — instantly.",
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
        <link rel="icon" href="/logos/logo-a1.png" />
        <link rel="apple-touch-icon" href="/logos/logo-a1.png" />
      </head>
      <body className="bg-white text-gray-900 min-h-screen font-sans">
        {children}
        <RouteTracker />
        <CookieConsent />
        <form name="path-leads" data-netlify="true" hidden aria-hidden="true">
          <input type="email" name="email" />
          <input type="hidden" name="verdict" />
          <input type="hidden" name="income_band" />
        </form>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="beforeInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                wait_for_update: 2000
              });
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: false });
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
