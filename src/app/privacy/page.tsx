import type { Metadata } from "next";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Repton Digital collects, uses and protects personal information submitted through this website, including enquiry and analytics data.",
  path: "/privacy",
});

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id} className="font-display text-xl font-extrabold tracking-[-0.015em] text-paper">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-electric-soft">Legal</p>
      <h1 className="font-display mt-5 text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-tight tracking-[-0.015em] text-paper">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-smoke">Last updated: {business.privacyPolicyUpdated}</p>

      {business.privacyPolicyIsDraft ? (
        <div role="note" className="mt-8 rounded-2xl border border-dashed border-electric/50 bg-electric/5 p-5 text-sm leading-relaxed text-mist">
          <strong className="text-paper">Draft for review.</strong> Items in [square brackets] must be confirmed, and the
          policy checked against the Australian Privacy Principles, before the site is published.
        </div>
      ) : null}

      <div className="mt-12 space-y-12 text-base leading-relaxed text-mist">
        <Section id="who" title="Who we are">
          <p>
            This policy explains how {business.legalName} (trading as {business.name}), based in {business.location},
            handles personal information collected through this website. In this policy, &ldquo;we&rdquo; and
            &ldquo;us&rdquo; mean {business.name}.
          </p>
          <p>
            For privacy questions or requests, contact us at{" "}
            <span className="font-semibold text-paper">[privacy contact email: to confirm]</span> or call{" "}
            {business.phoneDisplay}.
          </p>
        </Section>

        <Section id="collect" title="What we collect">
          <p>When you send an enquiry, we collect the details you choose to give us:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>your name, business name, email address and phone number (if you give them);</li>
            <li>your preferred contact method, the service you are interested in and any budget range you choose;</li>
            <li>your project description;</li>
            <li>the time you submitted the form, the page you submitted it from, and your consent to be contacted.</li>
          </ul>
          <p>
            If you arrived from an advertising link, we also record the campaign details in that link (UTM values such
            as source, medium and campaign). These are kept in your browser for the current visit and sent with your
            enquiry.
          </p>
          <p>
            Our hosting provider and, where spam protection is enabled, our spam protection provider process technical
            information such as your IP address, browser type and device details. We also receive analytics data from
            Google Analytics and the Meta Pixel (see &ldquo;Cookies and analytics&rdquo; below).
          </p>
          <p>
            We do not collect payment details through this website, and we ask you not to include sensitive information
            (such as health information) in your project description.
          </p>
        </Section>

        <Section id="use" title="Why we use it">
          <ul className="list-disc space-y-2 pl-6">
            <li>To respond to your enquiry, prepare a scope or quote, and arrange a call or meeting if you ask for one;</li>
            <li>to manage a project if you engage us;</li>
            <li>to keep the website secure and prevent spam and automated abuse;</li>
            <li>to understand how the website performs and which campaigns bring enquiries.</li>
          </ul>
          <p>We do not use your enquiry details for marketing unless you agree to receive it.</p>
        </Section>

        <Section id="share" title="Who we share it with">
          <p>
            We do not sell personal information. We use service providers to run this website and to handle enquiries.
            They process information on our behalf, for these purposes:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="text-paper">Website hosting</span>: [hosting provider, to confirm], which hosts the site and
              its logs.
            </li>
            <li>
              <span className="text-paper">Email delivery</span>: Resend, which delivers enquiry notifications to our
              inbox.
            </li>
            <li>
              <span className="text-paper">Spam protection</span>: Cloudflare Turnstile, where enabled. It receives your
              IP address and a challenge token.
            </li>
            <li>
              <span className="text-paper">Analytics</span>: Google (Google Analytics 4), where enabled.
            </li>
            <li>
              <span className="text-paper">Advertising measurement</span>: Meta (Meta Pixel), where enabled.
            </li>
            <li>
              <span className="text-paper">Lead management</span>: an optional webhook to a tool we choose and configure
              to store enquiries, if one is set up. [Confirm whether used at launch.]
            </li>
          </ul>
          <p>
            Some of these providers are located outside Australia, including in the United States, so your information
            may be disclosed overseas. We take reasonable steps to ensure that the providers we use protect your
            information appropriately.
          </p>
        </Section>

        <Section id="cookies" title="Cookies and analytics">
          <p>
            Google Analytics and the Meta Pixel may set cookies in your browser and record page views and actions such as
            selecting a service or submitting an enquiry. You can block or delete cookies in your browser settings, use
            an ad blocker, or manage ad preferences in your Google and Meta accounts.
          </p>
          <p>
            We store UTM campaign values in your browser&apos;s session storage for the current visit only. This is not
            shared with third parties other than as part of your enquiry.
          </p>
        </Section>

        <Section id="retention" title="How long we keep it">
          <p>
            We keep enquiry records for as long as needed to respond to you and manage any project, and for any longer
            period that the law requires.{" "}
            <span className="font-semibold text-paper">[Retention period: to confirm]</span>
          </p>
        </Section>

        <Section id="security" title="Security">
          <p>
            Enquiries are sent over an encrypted connection. The server checks every submission, limits how often one
            connection can submit, and rejects requests that look automated. No online system is completely secure, so we
            cannot guarantee the security of information sent over the internet.
          </p>
        </Section>

        <Section id="rights" title="Your choices and rights">
          <p>
            You can ask us what personal information we hold about you, ask us to correct it, or ask us to delete it,
            subject to legal requirements. Contact us using the details above.
          </p>
          <p>
            If you are unhappy with how we handled your information, please contact us first. You can also complain to the
            Office of the Australian Information Commissioner (OAIC) at{" "}
            <span className="text-paper">oaic.gov.au</span>.
          </p>
          <p>
            If a data breach is likely to cause serious harm, we will notify you and the OAIC as the Notifiable Data
            Breaches scheme requires.
          </p>
        </Section>

        <Section id="changes" title="Changes to this policy">
          <p>
            We may update this policy from time to time. The date at the top of the page shows when it last changed.
          </p>
        </Section>
      </div>
    </div>
  );
}
