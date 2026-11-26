"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";

/** Sends one page view per route, including the first load and each client-side navigation. */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // The ref keeps React's development double-mount from counting a page twice.
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
