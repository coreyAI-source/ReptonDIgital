import type { Metadata } from "next";
import { Faq } from "@/components/site/Faq";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ButtonLink, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { blackFridayOffer } from "@/config/promotion";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Website Design Perth from A$699",
  description:
    "Custom website design for Perth businesses. Starter website from A$699, subject to agreed scope. Domain, hosting and maintenance quoted separately.",
  path: "/websites",
});

const included = [
  "Up to five pages, for example Home, Services, About, Gallery and Contact",
  "Custom design for your business, not a template",
  "Mobile-responsive layout, checked at phone and desktop widths",
  "Enquiry form with spam protection and email delivery",
  "Basic on-page SEO: page titles, descriptions, sitemap and robots.txt",
  "Analytics set-up (GA4 and Meta Pixel) if you have the accounts",
  "Launch checklist and handover notes",
];

const steps = [
  {
    title: "Enquiry and scope",
    body: "Tell us about your business and what the website needs to do. We confirm the scope with you before any build starts.",
  },
  {
    title: "Design and build",
    body: "We design a custom layout for your brand and build it to be fast, readable and easy to use on a phone.",
  },
  {
    title: "Review and launch",
    body: "You review the site, we make the agreed changes, then launch with forms, search basics and analytics in place.",
  },
];

const faq = [
  {
    question: "Is A$699 the total price?",
    answer:
      "It covers the starter scope listed above. Domain, hosting and maintenance are optional and quoted separately. Anything beyond the agreed scope is quoted before work starts.",
  },
  {
    question: "Can I add booking, maps or other integrations?",
    answer:
      "Yes. Contact forms, Google Maps and booking tools can be scoped into the project. Some integrations may be quoted separately.",
  },
  {
    question: "Will the website be custom or built from a template?",
    answer:
      "Custom. We design the layout for your business rather than starting from a template.",
  },
  {
    question: "What do you need from me?",
    answer:
      "Your business details, a logo if you have one, photos you have the right to use, and the content you want on each page. We help shape the rest.",
  },
];

export default function WebsitesPage() {
  return (
    <>
      <PageHero
        eyebrow="Website design"
        title="Websites for Perth businesses, starting at A$699."
        lead="A custom-designed, mobile-first website with a clear message, an enquiry form and the basics for local search. Built for Perth tradies and local service businesses."
      >
        <ButtonLink href="#enquiry" size="lg">
          Get a Quote
        </ButtonLink>
        <ButtonLink href="/work" variant="secondary" size="lg">
          See Our Work
        </ButtonLink>
      </PageHero>

      <Section labelledBy="package-title">
        <SectionHeading
          eyebrow="Starter package"
          title="Starter website: A$699."
          titleId="package-title"
          lead={`Black Friday offer until ${blackFridayOffer.endsOnLabel}, subject to an agreed scope approved before work starts.`}
        />

        <div className="glass mt-12 grid gap-10 rounded-[2rem] p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-5xl font-extrabold tracking-tight text-paper">A$699</p>
            <h3 className="font-display mt-8 text-xl font-bold tracking-tight">Included in the starter package</h3>
            <ul className="mt-5 space-y-3 text-mist">
              {included.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-electric-soft">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-line bg-ink/60 p-7">
            <h3 className="font-display text-xl font-bold tracking-tight">Optional, quoted separately</h3>
            <p className="mt-3 text-sm leading-relaxed text-smoke">
              These costs are not included in the A$699 price. Choose only what you need.
            </p>
            <dl className="mt-7 space-y-6">
              <div>
                <dt className="font-semibold text-paper">Domain name</dt>
                <dd className="mt-1 text-sm text-mist">Optional. Quoted separately.</dd>
              </div>
              <div>
                <dt className="font-semibold text-paper">Web hosting</dt>
                <dd className="mt-1 text-sm text-mist">Optional. A$10 per month.</dd>
              </div>
              <div>
                <dt className="font-semibold text-paper">Ongoing maintenance</dt>
                <dd className="mt-1 text-sm text-mist">Optional. Quoted separately.</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section labelledBy="example-title" className="pt-0">
        <SectionHeading
          eyebrow="Example"
          title="A website build from our portfolio."
          titleId="example-title"
          lead="A real example of our website work. Its scope, status and features are described on the project page."
        />
        <div className="mt-12">
          <PortfolioCard />
        </div>
      </Section>

      <Section labelledBy="steps-title" className="pt-0">
        <SectionHeading eyebrow="How it works" title="How the starter package works." titleId="steps-title" />
        <div className="mt-12">
          <ProcessSteps steps={steps} />
        </div>
      </Section>

      <Section id="enquiry" labelledBy="enquiry-title" className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Get a quote"
              title="Request your starter website."
              titleId="enquiry-title"
              lead="Tell us about your business. We will reply with the next steps and a scope for you to approve."
            />
            <p className="mt-8 font-semibold text-paper">Helpful to include</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-mist">
              <li>Your business name and what you do</li>
              <li>The pages you think you need</li>
              <li>An existing website or logo you want to keep</li>
              <li>Your timeline and budget range</li>
            </ul>
          </div>
          <EnquiryForm defaultService="websites" ariaLabel="Website enquiry form" />
        </div>
      </Section>

      <Section labelledBy="faq-title" className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Website questions, answered." titleId="faq-title" />
        <div className="mt-12 max-w-3xl">
          <Faq items={faq} />
        </div>
      </Section>
    </>
  );
}
