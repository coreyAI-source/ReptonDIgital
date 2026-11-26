/**
 * Black Friday promotion. Edit `endsOn` to change when the banner stops showing.
 * The banner shows until the end of that day in Perth time (AWST, UTC+8).
 * Offer terms are a draft: the scope must be approved before the offer is advertised.
 */
export const blackFridayOffer = {
  title: "Black Friday website starter",
  headline: "Website starter package: A$699",
  detail: "Domain, hosting and maintenance are optional and quoted separately.",
  /** Last day of the offer, YYYY-MM-DD, Perth time. */
  endsOn: "2026-11-30",
  endsOnLabel: "30 November 2026",
} as const;

/** True until the end of `endsOn` in Perth time. */
export function isBlackFridayOfferActive(now: Date = new Date()): boolean {
  const endOfDayInPerth = new Date(`${blackFridayOffer.endsOn}T23:59:59+08:00`);
  return now.getTime() <= endOfDayInPerth.getTime();
}
