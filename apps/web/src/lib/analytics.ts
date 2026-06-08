/**
 * Analytics utility for GA4 and PostHog event tracking.
 * Uses env vars: NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_POSTHOG_KEY
 */

type EventPayload = Record<string, string | number | boolean>;

/**
 * Track a page view via GA4 gtag.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return;

  try {
    // GA4
    if (
      typeof window.gtag === "function" &&
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      });
    }

    // PostHog
    if (
      typeof window.posthog === "object" &&
      window.posthog?.capture
    ) {
      window.posthog.capture("$pageview", {
        $current_url: window.location.href,
        $pathname: path,
      });
    }
  } catch {
    // Analytics failures are non-critical
  }
}

/**
 * Track a custom event.
 */
export function trackEvent(
  name: string,
  payload?: EventPayload
): void {
  if (typeof window === "undefined") return;

  try {
    // GA4
    if (
      typeof window.gtag === "function" &&
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ) {
      window.gtag("event", name, payload);
    }

    // PostHog
    if (
      typeof window.posthog === "object" &&
      window.posthog?.capture
    ) {
      window.posthog.capture(name, payload);
    }
  } catch {
    // Non-critical
  }
}

/**
 * Predefined custom events for the app.
 */
export const Events = {
  affiliateClick: (retailer: string, productSlug: string) =>
    trackEvent("affiliate_click", { retailer, product_slug: productSlug }),
  dealView: (dealId: string, category: string) =>
    trackEvent("deal_view", { deal_id: dealId, category }),
  search: (query: string, resultCount: number) =>
    trackEvent("search", { query, result_count: resultCount }),
  newsletterSignup: (source: string) =>
    trackEvent("newsletter_signup", { source }),
} as const;
