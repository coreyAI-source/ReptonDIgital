import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses, cx, type ButtonSize, type ButtonVariant } from "@/lib/classes";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Section({
  id,
  labelledBy,
  children,
  className,
}: {
  id?: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx("py-20 sm:py-28", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.22em] text-electric-soft">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  lead,
  className,
}: {
  eyebrow?: string;
  title: string;
  titleId?: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={cx("max-w-3xl", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        id={titleId}
        className="font-display mt-4 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.015em] text-paper"
      >
        {title}
      </h2>
      {lead ? <p className="mt-4 text-lg leading-relaxed text-mist">{lead}</p> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-16 sm:pb-20 sm:pt-24">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[min(640px,140vw)] -translate-x-1/2 rounded-full bg-electric/20 blur-3xl"
      />
      <Container className="relative">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display mt-5 max-w-5xl text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.015em] text-paper">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist">{lead}</p>
        {children ? <div className="mt-9 flex flex-wrap gap-3">{children}</div> : null}
      </Container>
    </section>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return <Link href={href} className={cx(buttonClasses(variant, size), className)}>{children}</Link>;
}
