import type { ReactNode } from "react";
import { TrackedLink } from "@/components/site/TrackedLink";
import { cx } from "@/lib/classes";

export function ServiceCard({
  number,
  title,
  body,
  href,
  cta,
  service,
}: {
  number: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  service: string;
}) {
  return (
    <article className="glass flex h-full flex-col rounded-3xl p-7 transition-colors hover:border-electric/50">
      <p className="font-display text-sm font-bold text-electric-soft">{number}</p>
      <h3 className="font-display mt-4 text-2xl font-extrabold tracking-tight text-paper">{title}</h3>
      <p className="mt-3 flex-1 leading-relaxed text-mist">{body}</p>
      <TrackedLink
        href={href}
        service={service}
        source="service_card"
        className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-electric-soft transition-colors hover:text-paper"
      >
        {cta} <span aria-hidden="true">→</span>
      </TrackedLink>
    </article>
  );
}

export function CapabilityCard({
  title,
  body,
  className,
  children,
}: {
  title: string;
  body: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <article className={cx("glass h-full rounded-3xl p-7", className)}>
      <h3 className="font-display text-xl font-bold tracking-tight text-paper">{title}</h3>
      <p className="mt-3 leading-relaxed text-mist">{body}</p>
      {children}
    </article>
  );
}
