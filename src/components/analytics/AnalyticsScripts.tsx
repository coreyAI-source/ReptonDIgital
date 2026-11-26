import Script from "next/script";
import { GA4_MEASUREMENT_ID, META_PIXEL_ID } from "@/lib/env";

/**
 * Loads GA4 and the Meta Pixel only when their IDs are configured.
 *
 * The setup snippets are plain inline scripts in the server-rendered layout.
 * They run while the HTML is parsed, before the page hydrates, so events fired
 * during hydration are queued rather than lost. The GA4 library loads after
 * the page is interactive.
 */

function ga4Setup(id: string): string {
  return [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){window.dataLayer.push(arguments);}",
    "window.gtag = gtag;",
    "gtag('js', new Date());",
    // PageViewTracker sends page_view on every route change, so the automatic first page view is switched off.
    `gtag('config', ${JSON.stringify(id)}, { send_page_view: false });`,
  ].join("\n");
}

function metaPixelSetup(id: string): string {
  return [
    "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?",
    "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;",
    "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;",
    "t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}",
    "(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');",
    `fbq('init', ${JSON.stringify(id)});`,
  ].join("");
}

export function AnalyticsScripts() {
  return (
    <>
      {GA4_MEASUREMENT_ID ? (
        <>
          <script id="ga4-setup" dangerouslySetInnerHTML={{ __html: ga4Setup(GA4_MEASUREMENT_ID) }} />
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`}
          />
        </>
      ) : null}
      {META_PIXEL_ID ? (
        <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: metaPixelSetup(META_PIXEL_ID) }} />
      ) : null}
    </>
  );
}
