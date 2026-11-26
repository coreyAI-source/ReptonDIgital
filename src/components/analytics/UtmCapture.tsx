"use client";

import { useEffect } from "react";
import { storeUtmParams } from "@/lib/utm";

/** Keeps UTM values from the landing URL for the rest of the visit. Renders nothing. */
export function UtmCapture() {
  useEffect(() => {
    storeUtmParams(new URLSearchParams(window.location.search));
  }, []);

  return null;
}
