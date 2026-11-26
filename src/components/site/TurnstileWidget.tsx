"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile challenge (shown only when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set). Explicit rendering keeps it working across client-side navigation.
 * The token is passed to the form, which sends it for server-side verification.
 */
export function TurnstileWidget({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    function tryRender(): boolean {
      const api = window.turnstile;
      if (!api || !containerRef.current || widgetIdRef.current) return false;
      widgetIdRef.current = api.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
      return true;
    }

    if (!tryRender()) {
      // The API script loads asynchronously, so poll briefly until it is ready.
      interval = setInterval(() => {
        if (tryRender() && interval) clearInterval(interval);
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div ref={containerRef} className="min-h-16" />
    </>
  );
}
