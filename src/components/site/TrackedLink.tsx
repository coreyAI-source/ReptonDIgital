"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackServiceSelected } from "@/lib/analytics";

/** A link that records a service selection (GA4 and Meta) when clicked. */
export function TrackedLink({
  href,
  service,
  source,
  className,
  children,
}: {
  href: string;
  service: string;
  source: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackServiceSelected(service, source)}>
      {children}
    </Link>
  );
}
