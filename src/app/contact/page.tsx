import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PageHero, Section } from "@/components/site/ui";
import { business } from "@/config/business";
import { SERVICE_VALUES, type ServiceValue } from "@/lib/enquiry";
import { CONTACT_EMAIL } from "@/lib/env";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Get a Quote for Your Perth Project",
  description:
    "Tell us about your website, AI automation or software project. Send an enquiry or call Repton Digital in Perth. We reply with clear next steps.",
  path: "/contact",
});

type ContactPageProps = {
  searchParams: Promise<{ service?: string | string[] }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { service } = await searchParams;
  const requested = Array.isArray(service) ? service[0] : service;
  const defaultService: ServiceValue = SERVICE_VALUES.find((value) => value === requested) ?? "not-sure";

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get a quote for your project."
        lead="Tell us what you need. We will reply with clear next steps and, where it makes sense, a quote."
      />

      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-10">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.015em]">Prefer to talk first?</h2>
              <ul className="mt-5 space-y-3 text-mist">
                <li>
                  Call{" "}
                  <a
                    href={`tel:${business.phoneInternational}`}
                    className="font-semibold text-paper underline underline-offset-4 hover:text-electric-soft"
                  >
                    {business.phoneDisplay}
                  </a>
                </li>
                {CONTACT_EMAIL ? (
                  <li>
                    Email{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="break-all font-semibold text-paper underline underline-offset-4 hover:text-electric-soft"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </li>
                ) : null}
                <li>Based in {business.location}</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.015em]">What helps us reply faster</h2>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-mist">
                <li>What your business does and who your customers are</li>
                <li>What you need built: a website, automation or software</li>
                <li>Your timeline and any must-have features</li>
                <li>Your budget range, or &ldquo;not sure yet&rdquo;</li>
              </ul>
            </div>
          </div>

          <EnquiryForm defaultService={defaultService} ariaLabel="Project enquiry form" />
        </div>
      </Section>
    </>
  );
}
