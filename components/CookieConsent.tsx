"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "sv_cookie_consent";

function updateGtagConsent(granted: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
  });
  if (granted) {
    // Fire the page view that was held pending consent
    window.gtag("event", "page_view");
  }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "accepted") {
      updateGtagConsent(true);
    } else if (!consent) {
      setShow(true);
    }
    // "declined" → default denied state is already set in layout, no action needed
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    updateGtagConsent(true);
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-600 flex-1 leading-relaxed">
          We use analytics cookies to understand how people use this site. No personal data is
          collected without consent.{" "}
          <Link href="/privacy" className="text-orange-500 hover:underline font-medium">
            Privacy policy
          </Link>
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="bg-orange-500 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
