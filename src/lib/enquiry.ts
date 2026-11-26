import { z } from "zod";

/**
 * Enquiry rules shared by the browser form (immediate feedback) and the API
 * route (the authoritative check). Change the rules here only.
 */

export const SERVICE_VALUES = ["websites", "ai-automation", "software", "not-sure"] as const;
export type ServiceValue = (typeof SERVICE_VALUES)[number];
export const SERVICE_LABELS: Record<ServiceValue, string> = {
  websites: "Website design",
  "ai-automation": "AI automation",
  software: "Custom software",
  "not-sure": "Not sure yet",
};

export const CONTACT_METHOD_VALUES = ["email", "phone", "either"] as const;
export type ContactMethod = (typeof CONTACT_METHOD_VALUES)[number];
export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  email: "Email",
  phone: "Phone call",
  either: "Either is fine",
};

/** Budget bands qualify an enquiry. They are not prices. */
export const BUDGET_VALUES = ["under-1000", "1000-3000", "3000-10000", "10000-plus", "not-sure"] as const;
export type BudgetValue = (typeof BUDGET_VALUES)[number];
export const BUDGET_LABELS: Record<BudgetValue, string> = {
  "under-1000": "Under A$1,000",
  "1000-3000": "A$1,000 to A$3,000",
  "3000-10000": "A$3,000 to A$10,000",
  "10000-plus": "A$10,000 or more",
  "not-sure": "Not sure yet",
};

/** Submissions faster than this are treated as automated. */
export const MIN_FORM_FILL_MS = 2500;
/** A form left open longer than this must be reloaded before it can be sent. */
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

const PHONE_CHARACTERS = /^\+?[0-9\s()-]+$/;

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .transform((value) => value || undefined);
}

export const utmSchema = z.object({
  source: optionalText(200),
  medium: optionalText(200),
  campaign: optionalText(200),
  content: optionalText(200),
  term: optionalText(200),
});
export type UtmValues = z.output<typeof utmSchema>;

const enquiryFields = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(2, "Please enter your name.")
    .max(100, "Please keep your name to 100 characters or fewer."),
  businessName: optionalText(120),
  email: z
    .string({ error: "Please enter your email address." })
    .trim()
    .min(1, "Please enter your email address.")
    .max(254, "Please enter an email address under 254 characters.")
    .pipe(z.email({ error: "Please enter a valid email address, for example name@example.com." })),
  phone: optionalText(25),
  service: z.enum(SERVICE_VALUES, { error: "Please choose the service you need." }),
  contactMethod: z.enum(CONTACT_METHOD_VALUES, { error: "Please choose how you would like us to reply." }),
  budget: z
    .union([z.enum(BUDGET_VALUES), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
  projectDescription: z
    .string({ error: "Please describe your project." })
    .trim()
    .min(20, "Please describe your project in at least 20 characters.")
    .max(2000, "Please keep your project description under 2,000 characters."),
  consent: z.literal(true, { error: "Please agree to be contacted about your enquiry." }),
});

type ContactRuleInput = { phone?: string | undefined; contactMethod: ContactMethod };

/** Phone rules that depend on other fields. Applied on the browser and on the server. */
function applyContactRules(value: ContactRuleInput, ctx: z.RefinementCtx) {
  if (value.phone) {
    if (!PHONE_CHARACTERS.test(value.phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Please enter a valid phone number, using digits, spaces or + only.",
      });
      return;
    }
    const digits = value.phone.replace(/\D/g, "").length;
    if (digits < 8 || digits > 15) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Please enter a phone number with 8 to 15 digits.",
      });
    }
    return;
  }
  if (value.contactMethod === "phone") {
    ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number so we can call you." });
  }
}

/** Visible form fields only. */
export const enquiryFormSchema = enquiryFields.superRefine(applyContactRules);
export type EnquiryFormValues = z.input<typeof enquiryFormSchema>;
export type Enquiry = z.output<typeof enquiryFormSchema>;

/** Full request body: visible fields plus anti-spam and tracking fields. */
export const enquiryRequestSchema = enquiryFields
  .extend({
    /** Honeypot. Hidden from people, so only automated form fillers complete it. */
    website: z.string().max(200).optional().default(""),
    /** Milliseconds since epoch when the form was first shown. */
    startedAt: z.number().int().positive(),
    /** Tracking values never block an enquiry: invalid ones are dropped. */
    utm: utmSchema.optional().catch(undefined),
    pagePath: z
      .string()
      .max(200)
      .regex(/^\/[^\r\n]*$/)
      .optional()
      .catch(undefined),
    turnstileToken: z.string().max(2048).optional().catch(undefined),
  })
  .superRefine(applyContactRules);
export type EnquiryRequest = z.output<typeof enquiryRequestSchema>;

/** A confirmed enquiry, ready to deliver. Contains no anti-spam fields. */
export interface Lead {
  name: string;
  businessName?: string | undefined;
  email: string;
  phone?: string | undefined;
  service: ServiceValue;
  contactMethod: ContactMethod;
  budget?: BudgetValue | undefined;
  projectDescription: string;
  consent: true;
  pagePath?: string | undefined;
  utm: Partial<UtmValues>;
  submittedAt: string;
}

export function toLead(request: EnquiryRequest, now: Date): Lead {
  return {
    name: request.name,
    businessName: request.businessName,
    email: request.email,
    phone: request.phone,
    service: request.service,
    contactMethod: request.contactMethod,
    budget: request.budget,
    projectDescription: request.projectDescription,
    consent: request.consent,
    pagePath: request.pagePath,
    utm: request.utm ?? {},
    submittedAt: now.toISOString(),
  };
}

/** Maps Zod issues to a flat { field: message } object for the form. First message per field wins. */
export function fieldErrorsFromIssues(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
