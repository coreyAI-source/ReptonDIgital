import type { Metadata } from "next";
import { CapabilityCard } from "@/components/site/Cards";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Faq } from "@/components/site/Faq";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ButtonLink, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "AI Automation for Perth Businesses",
  description:
    "AI automation for Perth businesses: lead follow-up, admin automation, quoting workflows and integrations. Custom pricing after a scoping conversation.",
  path: "/ai-automation",
});

const capabilities = [
  {
    title: "Lead follow-up",
    body: "Instant acknowledgement of new enquiries, reminders for unanswered leads and routing to the right person.",
  },
  {
    title: "Admin automation",
    body: "Move information between forms, spreadsheets, inboxes and your CRM, and generate routine reports without copy-and-paste.",
  },
  {
    title: "Quoting workflows",
    body: "Turn a standard enquiry into a structured quote request, with the details in one place and a clear approval step.",
  },
  {
    title: "Integrations",
    body: "Connect your website, email, calendar, accounting and CRM tools through their APIs or webhooks, where each platform allows it.",
  },
];

const steps = [
  {
    title: "Map your process",
    body: "We walk through how work moves today and where the time goes.",
  },
  {
    title: "Choose what to automate",
    body: "We start with repetitive, high-volume tasks and flag anything that needs a human decision.",
  },
  {
    title: "Build, test and hand over",
    body: "We build the workflow, test it with real examples and document how it works.",
  },
];

const faq = [
  {
    question: "Do I need to change my software?",
    answer:
      "No. We work with the tools you already use where they offer an API or webhooks. We check what is possible before we quote.",
  },
  {
    question: "Will automation replace my staff?",
    answer:
      "Our automations are designed to take repetitive tasks off your team's plate, so people can focus on judgement calls and customers.",
  },
  {
    question: "Do you guarantee time or cost savings?",
    answer:
      "No. We do not guarantee specific savings. We map the process first, so you can decide what is worth automating and see the estimated effort before you commit.",
  },
  {
    question: "How is pricing set?",
    answer:
      "Custom pricing, after a scoping conversation. We explain what is included, what the price depends on and whether there are ongoing costs.",
  },
];

export default function AiAutomationPage() {
  return (
    <>
      <PageHero
        eyebrow="AI automation"
        title="Automate the admin that slows your business down."
        lead="We build lead follow-up, admin automation, quoting workflows and integrations that connect the tools you already use. Pricing is custom and based on your process."
      >
        <ButtonLink href="#enquiry" size="lg">
          Get a Quote
        </ButtonLink>
        <ButtonLink href="#process" variant="secondary" size="lg">
          How we scope it
        </ButtonLink>
      </PageHero>

      <Section labelledBy="capabilities-title">
        <SectionHeading
          eyebrow="What we automate"
          title="Four areas where automation pays off."
          titleId="capabilities-title"
          lead="Each one is scoped to your process. We do not sell a generic bot."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {capabilities.map((item) => (
            <CapabilityCard key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </Section>

      <Section id="process" labelledBy="process-title" className="pt-0">
        <SectionHeading eyebrow="How we scope it" title="From process map to working automation." titleId="process-title" />
        <div className="mt-12">
          <ProcessSteps steps={steps} />
        </div>
      </Section>

      <Section labelledBy="responsible-title" className="pt-0">
        <div className="glass rounded-[2rem] p-8 sm:p-12">
          <h2 id="responsible-title" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Where AI is part of the workflow.
          </h2>
          <div className="mt-5 grid gap-6 leading-relaxed text-mist md:grid-cols-2">
            <p>
              We agree which data goes to third-party AI services before we build. Anything that could cost you money or
              a customer keeps a human review step.
            </p>
            <p>
              We do not promise savings or results. We map the process first, so you can see where the time goes and
              decide what is worth doing.
            </p>
          </div>
        </div>
      </Section>

      <Section id="enquiry" labelledBy="enquiry-title" className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Get a quote"
              title="Tell us which process slows you down."
              titleId="enquiry-title"
              lead="Pricing is custom. We scope your workflow first, then quote."
            />
            <p className="mt-8 font-semibold text-paper">Helpful to include</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-mist">
              <li>The tools you already use</li>
              <li>The task that takes the most time each week</li>
              <li>Roughly how many enquiries or documents you handle</li>
              <li>Your budget range, or &ldquo;not sure yet&rdquo;</li>
            </ul>
          </div>
          <EnquiryForm defaultService="ai-automation" ariaLabel="AI automation enquiry form" />
        </div>
      </Section>

      <Section labelledBy="faq-title" className="pt-0">
        <SectionHeading eyebrow="FAQ" title="Automation questions, answered." titleId="faq-title" />
        <div className="mt-12 max-w-3xl">
          <Faq items={faq} />
        </div>
      </Section>
    </>
  );
}
