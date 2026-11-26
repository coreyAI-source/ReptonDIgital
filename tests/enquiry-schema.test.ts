import { describe, expect, it } from "vitest";
import {
  MIN_FORM_FILL_MS,
  enquiryFormSchema,
  enquiryRequestSchema,
  fieldErrorsFromIssues,
  toLead,
} from "@/lib/enquiry";
import { validFormValues } from "./fixtures";

const timedRequest = { ...validFormValues, website: "", startedAt: Date.now() - MIN_FORM_FILL_MS - 1000 };

describe("enquiryFormSchema", () => {
  it("accepts a complete, valid enquiry", () => {
    expect(enquiryFormSchema.safeParse(validFormValues).success).toBe(true);
  });

  it("treats blank optional fields as absent", () => {
    const result = enquiryFormSchema.safeParse({ ...validFormValues, businessName: "  ", phone: "", budget: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.businessName).toBeUndefined();
      expect(result.data.phone).toBeUndefined();
      expect(result.data.budget).toBeUndefined();
    }
  });

  it("requires consent to be contacted", () => {
    const result = enquiryFormSchema.safeParse({ ...validFormValues, consent: false });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsFromIssues(result.error.issues).consent).toMatch(/agree/i);
  });

  it("rejects an invalid email address", () => {
    const result = enquiryFormSchema.safeParse({ ...validFormValues, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsFromIssues(result.error.issues).email).toBeDefined();
  });

  it("rejects a service that is not offered", () => {
    expect(enquiryFormSchema.safeParse({ ...validFormValues, service: "consulting" }).success).toBe(false);
  });

  it("rejects a project description that is too short", () => {
    expect(enquiryFormSchema.safeParse({ ...validFormValues, projectDescription: "Too short" }).success).toBe(false);
  });

  it("requires a phone number when a phone call is preferred", () => {
    const result = enquiryFormSchema.safeParse({ ...validFormValues, phone: "", contactMethod: "phone" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsFromIssues(result.error.issues).phone).toMatch(/phone number/i);
  });

  it("checks phone characters and digit count", () => {
    expect(enquiryFormSchema.safeParse({ ...validFormValues, phone: "call me!" }).success).toBe(false);
    expect(enquiryFormSchema.safeParse({ ...validFormValues, phone: "12345" }).success).toBe(false);
    expect(enquiryFormSchema.safeParse({ ...validFormValues, phone: "+61 493 381 286" }).success).toBe(true);
  });
});

describe("enquiryRequestSchema", () => {
  it("drops invalid tracking values without rejecting the enquiry", () => {
    const result = enquiryRequestSchema.safeParse({
      ...timedRequest,
      utm: { source: "google", medium: "cpc", campaign: "" },
      pagePath: "not-a-path",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.utm).toMatchObject({ source: "google", medium: "cpc" });
      expect(result.data.pagePath).toBeUndefined();
    }
  });

  it("defaults the honeypot to an empty string", () => {
    const withoutHoneypot: Partial<typeof timedRequest> = { ...timedRequest };
    delete withoutHoneypot.website;
    const result = enquiryRequestSchema.safeParse(withoutHoneypot);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.website).toBe("");
  });

  it("requires the form timestamp", () => {
    const withoutTimestamp: Partial<typeof timedRequest> = { ...timedRequest };
    delete withoutTimestamp.startedAt;
    expect(enquiryRequestSchema.safeParse(withoutTimestamp).success).toBe(false);
  });
});

describe("toLead", () => {
  it("builds the lead from visible fields only, with a submission time", () => {
    const parsed = enquiryRequestSchema.parse({
      ...timedRequest,
      utm: { source: "meta" },
      pagePath: "/websites",
      turnstileToken: "token-value",
    });
    const lead = toLead(parsed, new Date("2026-11-27T01:02:03Z"));

    expect(lead).toMatchObject({
      service: "websites",
      pagePath: "/websites",
      submittedAt: "2026-11-27T01:02:03.000Z",
      utm: { source: "meta" },
    });
    expect(lead).not.toHaveProperty("website");
    expect(lead).not.toHaveProperty("startedAt");
    expect(lead).not.toHaveProperty("turnstileToken");
  });
});
