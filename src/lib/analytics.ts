/**
 * Browser analytics helpers for GA4 and the Meta Pixel. Each call is a no-op
 * when that tracker is not configured. Events carry no personal information.
 *
 * Events:
 *   page_view / PageView            every page load and client-side navigation
 *   service_selected / ServiceSelected  a visitor picks a service (card or form)
 *   generate_lead / Lead            ONLY after the server confirms an enquiry was sent
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean>;

function sendGa4(eventName: string, params: EventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

function sendMetaPixel(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(...args);
}

export function trackPageView(pathname: string): void {
  sendGa4("page_view", {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
  sendMetaPixel("track", "PageView");
}

export function trackServiceSelected(service: string, source: string): void {
  sendGa4("service_selected", { service, source });
  sendMetaPixel("trackCustom", "ServiceSelected", { service, source });
}

/** Call only after the enquiry API has returned success. */
export function trackLeadConfirmed(service: string, pathname: string): void {
  sendGa4("generate_lead", { service, form_location: pathname });
  sendMetaPixel("track", "Lead", { content_name: service, content_category: "enquiry" });
}
