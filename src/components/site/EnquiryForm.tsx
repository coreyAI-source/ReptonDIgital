"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { TurnstileWidget } from "@/components/site/TurnstileWidget";
import { trackLeadConfirmed, trackServiceSelected } from "@/lib/analytics";
import { buttonClasses, cx } from "@/lib/classes";
import {
  BUDGET_LABELS,
  BUDGET_VALUES,
  CONTACT_METHOD_LABELS,
  CONTACT_METHOD_VALUES,
  SERVICE_LABELS,
  SERVICE_VALUES,
  enquiryFormSchema,
  fieldErrorsFromIssues,
  type ServiceValue,
} from "@/lib/enquiry";
import { TURNSTILE_SITE_KEY } from "@/lib/env";
import { readStoredUtmParams } from "@/lib/utm";

type Status = "idle" | "submitting" | "success" | "error";

type ApiResult =
  | { ok: true }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string>;
      devMessage?: string;
    };

/** Order used to move focus to the first invalid field. */
const FIELD_ORDER = [
  "name",
  "businessName",
  "email",
  "phone",
  "service",
  "contactMethod",
  "budget",
  "projectDescription",
  "consent",
] as const;

const CONTROL =
  "mt-2 w-full rounded-xl border bg-ink px-4 py-3 text-base text-paper placeholder:text-smoke/70 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40";

function controlClass(hasError: boolean): string {
  return cx(CONTROL, hasError ? "border-red-400" : "border-line-strong");
}

/** The hint is hidden while an error shows, so only the error is referenced then. */
function describedBy(id: string, hint: string | undefined, error: string | undefined): string | undefined {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

function readField(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-paper">
        {label}
        {required ? (
          <span className="text-electric-soft"> *</span>
        ) : (
          <span className="font-normal text-smoke"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-smoke">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Enquiry form used on the contact page and the service pages. Validation runs
 * in the browser for quick feedback and again on the server. A lead conversion
 * is recorded only after the server confirms the enquiry was sent.
 */
export function EnquiryForm({
  defaultService = "not-sure",
  ariaLabel = "Project enquiry form",
}: {
  defaultService?: ServiceValue;
  ariaLabel?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [widgetKey, setWidgetKey] = useState(0);

  // Time the form was shown. Submissions that come back implausibly fast are treated as automated.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function showErrors(form: HTMLFormElement, errors: Record<string, string>, message: string) {
    setFieldErrors(errors);
    setFormMessage(message);
    setStatus("error");
    const firstKey = FIELD_ORDER.find((key) => errors[key]);
    if (firstKey) {
      const element = form.elements.namedItem(firstKey);
      if (element instanceof HTMLElement) element.focus();
    }
  }

  function resetSecurityCheck() {
    setTurnstileToken("");
    setWidgetKey((key) => key + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = enquiryFormSchema.safeParse({
      name: readField(data, "name"),
      businessName: readField(data, "businessName"),
      email: readField(data, "email"),
      phone: readField(data, "phone"),
      service: readField(data, "service"),
      contactMethod: readField(data, "contactMethod"),
      budget: readField(data, "budget"),
      projectDescription: readField(data, "projectDescription"),
      consent: data.get("consent") === "on",
    });

    if (!parsed.success) {
      showErrors(form, fieldErrorsFromIssues(parsed.error.issues), "Please check the highlighted fields.");
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setFieldErrors({});
      setFormMessage("Please complete the security check, then send again.");
      setStatus("error");
      return;
    }

    setFieldErrors({});
    setFormMessage("");
    setStatus("submitting");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          website: readField(data, "website"),
          startedAt: startedAt.current || Date.now(),
          pagePath: window.location.pathname,
          utm: readStoredUtmParams(),
          turnstileToken: turnstileToken || undefined,
        }),
        cache: "no-store",
      });
      const result = (await response.json().catch(() => null)) as ApiResult | null;

      if (response.ok && result?.ok === true) {
        trackLeadConfirmed(parsed.data.service, window.location.pathname);
        setFirstName(parsed.data.name.split(/\s+/)[0] ?? "");
        setStatus("success");
        return;
      }

      const failure = result && result.ok === false ? result : null;
      const message = failure
        ? `${failure.message}${failure.devMessage ? ` ${failure.devMessage}` : ""}`
        : "We could not send your enquiry. Please try again, or call us.";
      showErrors(form, failure?.fieldErrors ?? {}, message);
      resetSecurityCheck();
    } catch {
      showErrors(form, {}, "We could not reach the server. Check your connection and try again, or call us.");
      resetSecurityCheck();
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="glass rounded-3xl p-8 text-center sm:p-12">
        <p className="font-display text-3xl font-extrabold tracking-tight text-paper">
          Thanks{firstName ? `, ${firstName}` : ""}.
        </p>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-mist">
          Your enquiry has been sent. We will reply using the contact details you gave us.
        </p>
        <Link href="/" className={cx(buttonClasses("secondary", "md"), "mt-8")}>
          Back to home
        </Link>
      </div>
    );
  }

  const e = fieldErrors;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label={ariaLabel}
      className="glass rounded-3xl p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="enquiry-name" label="Full name" required error={e.name}>
          <input
            id="enquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            className={controlClass(Boolean(e.name))}
            aria-invalid={Boolean(e.name)}
            aria-describedby={describedBy("enquiry-name", undefined, e.name)}
          />
        </Field>

        <Field id="enquiry-businessName" label="Business name" error={e.businessName}>
          <input
            id="enquiry-businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            className={controlClass(Boolean(e.businessName))}
            aria-invalid={Boolean(e.businessName)}
            aria-describedby={describedBy("enquiry-businessName", undefined, e.businessName)}
          />
        </Field>

        <Field id="enquiry-email" label="Email" required error={e.email}>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={controlClass(Boolean(e.email))}
            aria-invalid={Boolean(e.email)}
            aria-describedby={describedBy("enquiry-email", undefined, e.email)}
          />
        </Field>

        <Field
          id="enquiry-phone"
          label="Phone"
          hint="Needed if you choose a phone call."
          error={e.phone}
        >
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={controlClass(Boolean(e.phone))}
            aria-invalid={Boolean(e.phone)}
            aria-describedby={describedBy("enquiry-phone", "Needed if you choose a phone call.", e.phone)}
          />
        </Field>

        <Field id="enquiry-service" label="Service" required error={e.service}>
          <select
            id="enquiry-service"
            name="service"
            defaultValue={defaultService}
            className={controlClass(Boolean(e.service))}
            aria-invalid={Boolean(e.service)}
            aria-describedby={describedBy("enquiry-service", undefined, e.service)}
            onChange={(event) => trackServiceSelected(event.currentTarget.value, "enquiry_form")}
          >
            {SERVICE_VALUES.map((value) => (
              <option key={value} value={value}>
                {SERVICE_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="enquiry-budget" label="Estimated budget" error={e.budget} hint="A range helps us suggest the right scope.">
          <select
            id="enquiry-budget"
            name="budget"
            defaultValue=""
            className={controlClass(Boolean(e.budget))}
            aria-invalid={Boolean(e.budget)}
            aria-describedby={describedBy("enquiry-budget", "A range helps us suggest the right scope.", e.budget)}
          >
            <option value="">Choose a range</option>
            {BUDGET_VALUES.map((value) => (
              <option key={value} value={value}>
                {BUDGET_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="enquiry-contactMethod" label="Preferred contact" required error={e.contactMethod}>
          <select
            id="enquiry-contactMethod"
            name="contactMethod"
            defaultValue="either"
            className={controlClass(Boolean(e.contactMethod))}
            aria-invalid={Boolean(e.contactMethod)}
            aria-describedby={describedBy("enquiry-contactMethod", undefined, e.contactMethod)}
          >
            {CONTACT_METHOD_VALUES.map((value) => (
              <option key={value} value={value}>
                {CONTACT_METHOD_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field id="enquiry-projectDescription" label="Tell us about your project" required error={e.projectDescription}>
            <textarea
              id="enquiry-projectDescription"
              name="projectDescription"
              rows={5}
              placeholder="What does your business do, what do you need built, and when would you like it finished?"
              className={cx(controlClass(Boolean(e.projectDescription)), "resize-y")}
              aria-invalid={Boolean(e.projectDescription)}
              aria-describedby={describedBy("enquiry-projectDescription", undefined, e.projectDescription)}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-mist">
          <input
            id="enquiry-consent"
            name="consent"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-electric"
            aria-invalid={Boolean(e.consent)}
            aria-describedby={e.consent ? "enquiry-consent-error" : undefined}
          />
          <span>
            I agree that Repton Digital may contact me about this enquiry. I have read the{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-paper">
              privacy policy
            </Link>
            .<span className="text-electric-soft"> *</span>
          </span>
        </label>
        {e.consent ? (
          <p id="enquiry-consent-error" className="mt-1.5 pl-7 text-sm text-red-300">
            {e.consent}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people and skipped by keyboard and screen readers. Bots tend to fill it in. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {TURNSTILE_SITE_KEY ? (
        <div className="mt-6">
          <TurnstileWidget key={widgetKey} siteKey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
        </div>
      ) : null}

      <div role="alert" aria-live="assertive" className="mt-6 empty:hidden">
        {formMessage ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-100">
            {formMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "submitting"}
          className={cx(buttonClasses("primary", "lg"), "disabled:cursor-wait disabled:opacity-70")}
        >
          {status === "submitting" ? "Sending..." : "Send my enquiry"}
        </button>
        <p className="max-w-sm text-xs leading-relaxed text-smoke">
          We use your details only to reply to your enquiry. See our{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-paper">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
