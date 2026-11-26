import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero, Section, SectionHeading, ButtonLink } from "@/components/site/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio: Fresh New Look Renovations Website",
  description:
    "Portfolio: the Fresh New Look Renovations website built by Repton Digital, with verified scope and status. Currently in client review, not yet launched.",
  path: "/work",
});

const built = [
  "A single scrolling site with Bathrooms and Laundries sections, an About section and a contact section",
  "A photo gallery with filters and a keyboard-accessible lightbox",
  "A quote enquiry form with server-side validation and spam protection. Email delivery is configured through environment variables and is not yet live",
  "A privacy policy page, marked as a draft for client review",
  "Page titles and descriptions, Open Graph tags, a sitemap and robots.txt",
  "A skip link, visible focus styles, keyboard-operable navigation and reduced-motion support",
];

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Our work, with verified details only."
        lead="We publish only project details we can verify. Each project states its real status, so you know exactly what has been built and what is still to come."
      >
        <ButtonLink href="/contact" size="lg">
          Get a Quote
        </ButtonLink>
      </PageHero>

      <Section labelledBy="project-title">
        <article className="glass overflow-hidden rounded-[2rem]">
          <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
            <div className="p-8 sm:p-10">
              <p className="inline-flex w-fit items-center rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs font-semibold text-electric-soft">
                Build complete, in client review. Not yet launched.
              </p>
              <h2 id="project-title" className="font-display mt-6 text-3xl font-extrabold tracking-[-0.015em] sm:text-4xl">
                Fresh New Look Renovations website
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-mist">
                A website for a bathroom and laundry renovation business. It was designed and built by Repton Digital to
                present the business&apos;s services, photos and a quote enquiry form.
              </p>

              <h3 className="font-display mt-10 text-xl font-bold tracking-[-0.015em]">What we built</h3>
              <ul className="mt-5 space-y-3 text-mist">
                {built.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-0.5 font-bold text-electric-soft">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-6 border-t border-line bg-ink/50 p-8 sm:p-10 lg:border-l lg:border-t-0">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Client</dt>
                <dd className="mt-2 text-paper">Fresh New Look Renovations, bathroom and laundry renovations</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Status</dt>
                <dd className="mt-2 text-paper">Build complete, in client review. Not yet launched.</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Built with</dt>
                <dd className="mt-2 text-paper">Next.js (App Router), TypeScript, Tailwind CSS and Zod for form validation</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Testing</dt>
                <dd className="mt-2 text-paper">
                  Automated browser tests at phone and desktop widths, and automated accessibility checks on the homepage
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Before launch</dt>
                <dd className="mt-2 text-paper">
                  Client confirmation of business details and final content, plus a privacy policy review
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Results</dt>
                <dd className="mt-2 text-mist">
                  None are shown. We do not publish results or testimonials that we cannot verify.
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </Section>

      <Section labelledBy="screens-title" className="pt-0">
        <SectionHeading
          eyebrow="Screens"
          title="The build, on desktop and phone."
          titleId="screens-title"
          lead="Screenshots of the client review build, taken from the production build before launch."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_0.8fr] lg:items-start">
          <figure className="glass overflow-hidden rounded-3xl">
            <Image
              src="/work/fresh-new-look-desktop.jpg"
              alt="Desktop screenshot of the Fresh New Look Renovations website build, showing the homepage hero"
              width={1440}
              height={900}
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="px-6 py-4 text-sm text-smoke">Desktop, homepage (client review build)</figcaption>
          </figure>
          <figure className="glass mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl">
            <Image
              src="/work/fresh-new-look-mobile.jpg"
              alt="Phone screenshot of the Fresh New Look Renovations website build, showing the mobile homepage"
              width={390}
              height={844}
              sizes="320px"
              className="h-auto w-full"
            />
            <figcaption className="px-6 py-4 text-sm text-smoke">Phone, homepage (client review build)</figcaption>
          </figure>
        </div>
      </Section>

      <Section labelledBy="next-title" className="pt-0">
        <div className="glass rounded-[2rem] p-8 text-center sm:p-12">
          <h2 id="next-title" className="font-display text-2xl font-extrabold tracking-[-0.015em] sm:text-3xl">
            Have a project like this?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-mist">
            Tell us about your business and what you need. We will reply with next steps.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/contact">Get a Quote</ButtonLink>
            <Link href="/websites" className="text-sm font-semibold text-mist transition-colors hover:text-paper">
              See the website starter package
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
