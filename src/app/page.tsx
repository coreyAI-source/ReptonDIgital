import type { Metadata } from "next";
import Image from "next/image";
import { ServiceCard } from "@/components/site/Cards";
import { Faq } from "@/components/site/Faq";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ButtonLink, Container, Eyebrow, Section, SectionHeading } from "@/components/site/ui";
import { business } from "@/config/business";
import { OG_IMAGE } from "@/lib/metadata";

const title = "Repton Digital: Websites, AI Automation and Software in Perth";
const description =
  "Custom websites, AI automation and custom software for Perth businesses. Built from scratch, with clear scope and no templates. Get a quote.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_AU", siteName: business.name, title, description, url: "/", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
};

const trustPoints = [
  "Based in Perth, Western Australia",
  "Custom designed, not templated",
  "Founder-led: you work directly with the builder",
  "Website starter package from A$699",
];

const processSteps = [
  {
    title: "We scope your project",
    body: "We learn about your business, your goals and what needs building, then agree the scope before any build starts.",
  },
  {
    title: "We design and build",
    body: "A custom website or software product scoped to your exact needs. Nothing generic, nothing you do not need.",
  },
  {
    title: "You launch and keep improving",
    body: "We hand over a working product and stay available to support and refine it after launch.",
  },
];

const homeFaq = [
  {
    question: "Do you guarantee leads or sales?",
    answer:
      "No. We build websites and systems that make it easier to win and manage enquiries. Results depend on your offer, your marketing and how quickly you follow up.",
  },
  {
    question: "Do you use templates?",
    answer:
      "No. Every website is designed for your business. We do not start from a template, and we do not use stock photography.",
  },
  {
    question: "Where are you based?",
    answer: "We are based in Perth, Western Australia. Get in touch to talk through your project.",
  },
  {
    question: "How do I get a quote?",
    answer:
      "Send the enquiry form with a short description of your project. We reply with next steps and, where it makes sense, a quote.",
  },
];

function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[5/4] w-full max-w-md">
      <div className="absolute inset-12 rounded-full bg-electric/30 blur-3xl" />
      <div className="glass relative flex h-full flex-col justify-between rounded-[2rem] p-7">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Perth, WA</span>
          <span className="h-2 w-2 rounded-full bg-electric-soft shadow-[0_0_12px_var(--color-electric-soft)]" />
        </div>
        <Image
          src="/brand/repton-mark.png"
          alt=""
          width={380}
          height={380}
          sizes="(min-width: 1024px) 160px, 40vw"
          className="mx-auto w-28 mix-blend-screen sm:w-36"
        />
        <div className="space-y-3">
          <div className="h-2 w-3/4 rounded-full bg-white/15" />
          <div className="h-2 w-1/2 rounded-full bg-white/10" />
          <div className="h-10 rounded-xl border border-electric/40 bg-electric/15" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[min(760px,150vw)] -translate-x-1/2 rounded-full bg-electric/20 blur-3xl"
        />
        <Container className="relative">
          <div className="animate-rise">
            <Eyebrow>Perth web development and AI automation</Eyebrow>
            <h1 className="font-display mt-6 text-[clamp(2.5rem,6vw,5.2rem)] font-extrabold leading-[1.04] tracking-[-0.015em] text-paper">
              Custom websites. <span className="text-electric-soft lg:whitespace-nowrap">Powerful software.</span> <span className="lg:whitespace-nowrap">Built for Perth.</span>
            </h1>
          </div>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="max-w-xl text-lg leading-relaxed text-mist">
                Repton Digital designs and builds websites, AI automation and custom software for Perth businesses. From a
                custom-designed site built to turn visitors into enquiries, to the admin tools that run your day, we build
                around how you work.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/contact" size="lg">
                  Get a Quote
                </ButtonLink>
                <ButtonLink href="/work" variant="secondary" size="lg">
                  See Our Work
                </ButtonLink>
              </div>
              <p className="mt-6 text-sm text-smoke">Website starter package from A$699, subject to agreed scope.</p>
            </div>
            <HeroVisual />
          </div>
        </Container>
      </section>

      <section aria-label="Why choose Repton Digital" className="border-y border-line bg-ink-2/60">
        <Container className="grid grid-cols-1 gap-5 py-8 text-sm sm:grid-cols-2 md:grid-cols-4">
          {trustPoints.map((point) => (
            <p key={point} className="flex items-center gap-3 text-mist">
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
              {point}
            </p>
          ))}
        </Container>
      </section>

      <Section id="services" labelledBy="services-title">
        <SectionHeading
          eyebrow="What we build"
          title="Three ways we build your business online."
          titleId="services-title"
          lead="Choose one service or combine them. Every project is scoped around your customers, your team and your goals."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <ServiceCard
            number="01"
            title="Websites"
            body="Custom-designed, fast and mobile-first websites with clear calls to action, enquiry forms and the basics for local search."
            href="/websites"
            cta="See website packages"
            service="websites"
          />
          <ServiceCard
            number="02"
            title="AI automation"
            body="Lead follow-up, admin automation, quoting workflows and integrations that take repetitive work off your team's desk."
            href="/ai-automation"
            cta="Explore automation"
            service="ai-automation"
          />
          <ServiceCard
            number="03"
            title="Custom software"
            body="Client portals, internal dashboards and business tools built around your workflow, not the other way round."
            href="/software"
            cta="Explore software"
            service="software"
          />
        </div>
      </Section>

      <Section id="work" labelledBy="work-title" className="pt-0">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Recent work"
            title="A real project, shown with verified details."
            titleId="work-title"
            lead="The Fresh New Look Renovations website is our current portfolio project. Its status and scope are stated plainly."
          />
          <ButtonLink href="/work" variant="secondary">
            See Our Work
          </ButtonLink>
        </div>
        <div className="mt-12">
          <PortfolioCard />
        </div>
      </Section>

      <Section id="process" labelledBy="process-title">
        <SectionHeading
          eyebrow="How it works"
          title="Simple process. Clear next steps."
          titleId="process-title"
          lead="You always know what happens next, from the first enquiry to launch."
        />
        <div className="mt-14">
          <ProcessSteps steps={processSteps} />
        </div>
      </Section>

      <Section labelledBy="offer-title" className="pt-0">
        <div className="glass relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-electric/25 blur-3xl"
          />
          <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <Eyebrow>Website starter package</Eyebrow>
              <h2 id="offer-title" className="font-display mt-4 text-3xl font-extrabold tracking-[-0.015em] sm:text-4xl">
                Starter websites from A$699.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-mist">
                A custom-designed, mobile-first website with an enquiry form and the basics for local search. Subject to
                agreed scope. Domain, hosting and maintenance are optional and quoted separately.
              </p>
            </div>
            <div className="md:justify-self-end">
              <ButtonLink href="/websites" size="lg">
                See the starter package
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section id="faq" labelledBy="faq-title" className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Questions people ask before they get in touch." titleId="faq-title" />
        <div className="mt-12 max-w-3xl">
          <Faq items={homeFaq.map((item) => ({ question: item.question, answer: item.answer }))} />
        </div>
      </Section>

      <Section labelledBy="cta-title" className="pt-0">
        <div className="glass relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-56 w-[min(560px,100%)] -translate-x-1/2 rounded-full bg-electric/20 blur-3xl"
          />
          <div className="relative">
            <h2 id="cta-title" className="font-display text-3xl font-extrabold tracking-[-0.015em] sm:text-5xl">
              Ready to build something?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-mist">
              Tell us what you need. We will reply with clear next steps, no jargon and no pressure.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <ButtonLink href="/contact" size="lg">
                Get a Quote
              </ButtonLink>
              <a
                href={`tel:${business.phoneInternational}`}
                className="text-sm font-semibold text-mist transition-colors hover:text-paper"
              >
                Or call {business.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
