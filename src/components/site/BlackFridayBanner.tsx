"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { blackFridayOffer, isBlackFridayOfferActive } from "@/config/promotion";

// The offer depends on the visitor's clock, so it is read on the client only.
// The server renders nothing, which keeps static pages correct after the end date.
const subscribeToNothing = () => () => {};
const clientOfferState = () => isBlackFridayOfferActive();
const serverOfferState = () => false;

export function BlackFridayBanner() {
  const active = useSyncExternalStore(subscribeToNothing, clientOfferState, serverOfferState);
  const [dismissed, setDismissed] = useState(false);

  if (!active || dismissed) return null;

  return (
    <section aria-label="Black Friday offer" className="promo-bar relative z-[60] text-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <p className="leading-snug">
          <span className="font-display font-extrabold uppercase tracking-wide">Black Friday:</span>{" "}
          {blackFridayOffer.headline}, subject to agreed scope.{" "}
          <span className="hidden sm:inline">{blackFridayOffer.detail} </span>
          Offer ends {blackFridayOffer.endsOnLabel}.
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/websites" className="font-semibold underline underline-offset-4 hover:no-underline">
            See the starter package
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss the Black Friday offer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full font-bold hover:bg-ink/10"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </section>
  );
}
