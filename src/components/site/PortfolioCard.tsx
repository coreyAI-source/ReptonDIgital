import Image from "next/image";
import Link from "next/link";

/**
 * Fresh New Look Renovations, the one real project in the portfolio.
 * Only verified facts are shown. Status and scope come from the project's
 * BUILD_REPORT (complete for client review, not yet launched). No results,
 * testimonials or live links are claimed.
 */
export function PortfolioCard() {
  return (
    <article className="glass overflow-hidden rounded-3xl">
      <div className="grid md:grid-cols-[1.25fr_0.75fr]">
        <div className="relative aspect-[16/10] bg-ink-2 md:aspect-auto md:min-h-80">
          <Image
            src="/work/fresh-new-look-desktop.jpg"
            alt="Desktop view of the Fresh New Look Renovations website build, showing the homepage hero"
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover object-top"
          />
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-9">
          <p className="inline-flex w-fit items-center rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs font-semibold text-electric-soft">
            Build complete, in client review
          </p>
          <h3 className="font-display mt-5 text-2xl font-extrabold tracking-[-0.015em] text-paper sm:text-3xl">
            Fresh New Look Renovations
          </h3>
          <p className="mt-3 leading-relaxed text-mist">
            A website for a bathroom and laundry renovation business: service pages, a photo gallery and a quote
            enquiry form, built with Next.js and TypeScript.
          </p>
          <Link
            href="/work"
            className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-electric-soft transition-colors hover:text-paper"
          >
            View the project details <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
