import type { Metadata } from "next";
import { CapabilityCard } from "@/components/site/Cards";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Faq } from "@/components/site/Faq";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ButtonLink, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Custom Software and Dashboards",
  description:
    "Custom software for Perth businesses: client portals, internal dashboards, booking and job tools, and business software built around your workflow.",
  path: "/software",
});

const useCases = [
  {
    title: "Client portals",
    body: "Give customers a secure login to see their jobs, quotes, documents or bookings.",
  },
  {
    title: "Internal dashboards",
    body: "One screen for the numbers and status updates your team checks every day.",
  },
  {
    title: "Internal tools",
    body: "Replace spreadsheets and paper forms with a simple app built for how your team works.",
  },
  {
    title: "Business software",
    body: "Custom workflows, user roles, data and integrations, built around your processes.",
  },
];

const steps = [
  {
    title: "Scope first",
    body: "We define the users, the workflow and the must-have features, so the build stays focused.",
  },
  {
    title: "Prototype with you",
    body: "We show progress early, so you can check the workflow before the full build.",
  },
  {
    title: "Build, test and launch",
    body: "We build, test with realistic data and launch, with the documentation your team needs.",
  },
];

const faq = [
  {
    question: "Do you build SaaS products too?",
    answer:
      "Yes, if you have a product idea. Tell us about it in the enquiry and we will confirm whether it is a good fit.",
  },
  {
    question: "Can you connect to our existing systems?",
    answer:
      "Often, yes. We check the APIs, data access and any licence limits before we quote.",
  },
  {
    question: "How long does custom software take to build?",
    answer:
      "It depends on the scope. We give you a realistic timeline once we have scoped the work.",
  },
  {
    question: "Who owns the software?",
    answer: "Ownership, licensing and any ongoing support are agreed in writing before work starts.",
  },
];

export default function SoftwarePage() {
  return (
    <>
      <PageHero
        eyebrow="Custom software"
        title="Custom software built around how your business works."
        lead="Off-the-shelf tools make you adapt to them. We build tools that adapt to you: client portals, internal dashboards and business software for your exact workflow."
      >
        <ButtonLink href="#enquiry" size="lg">
          Get a Quote
        </ButtonLink>
        <ButtonLink href="#process" variant="secondary" size="lg">
          How we work
        </ButtonLink>
      </PageHero>

      <Section labelledBy="use-cases-title">
        <SectionHeading
          eyebrow="What we build"
          title="Portals, dashboards and tools for your team."
          titleId="use-cases-title"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {useCases.map((item) => (
            <CapabilityCard key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
        <div className="glass mt-8 rounded-3xl p-8">
          <h3 className="font-display text-xl font-bold tracking-tight">What is under the hood</h3>
          <p className="mt-3 leading-relaxed text-mist">
            Secure sign-in and user roles, database design, API integrations and hosting set-up. Ownership, licensing and
            any ongoing support are agreed in writing before work starts.
          </p>
        </div>
      </Section>

      <Section id="process" labelledBy="process-title" className="pt-0">
        <SectionHeading eyebrow="How we work" title="Scope, prototype, build." titleId="process-title" />
        <div className="mt-12">
          <ProcessSteps steps={steps} />
        </div>
      </Section>

      <Section id="enquiry" labelledBy="enquiry-title" className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Get a quote"
              title="Tell us what your team needs to do."
              titleId="enquiry-title"
              lead="Pricing is custom and quoted after a scoping conversation."
            />
            <p className="mt-8 font-semibold text-paper">Helpful to include</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-mist">
              <li>Who will use it: customers, staff or both</li>
              <li>The task or process you want to improve</li>
              <li>Existing systems it needs to connect to</li>
              <li>Your timeline and budget range</li>
            </ul>
          </div>
          <EnquiryForm defaultService="software" ariaLabel="Custom software enquiry form" />
        </div>
      </Section>

      <Section labelledBy="faq-title" className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Software questions, answered." titleId="faq-title" />
        <div className="mt-12 max-w-3xl">
          <Faq items={faq} />
        </div>
      </Section>
    </>
  );
}
