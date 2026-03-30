/**
 * Lightweight analytics module.
 * Works with Plausible (recommended), GA4, or just logs in dev.
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN or NEXT_PUBLIC_GA_ID to enable.
 */

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string | number> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "salary_calculated"
  | "result_shared"
  | "result_saved"
  | "share_link_copied"
  | "share_text_copied"
  | "share_twitter"
  | "share_linkedin"
  | "share_whatsapp"
  | "check_another"
  | "cta_hero_click"
  | "scroll_to_tool"
  | "email_captured"
  | "edit_inputs"
  | "return_visit_banner_shown"
  | "return_visit_recheck"
  | "path_calculated";

export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  // Plausible
  if (window.plausible) {
    window.plausible(event, { props });
  }

  // GA4
  if (window.gtag) {
    window.gtag("event", event, props);
  }

  // Dev logging
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, props ?? "");
  }
}
