import type { Lead } from "@/lib/enquiry";

/** Shared sample data for tests. Not a test file (Vitest only runs *.test.ts). */
export const sampleLead: Lead = {
  name: "Alex Example",
  businessName: "Example & Sons",
  email: "alex@example.com",
  phone: "0493 381 286",
  service: "websites",
  contactMethod: "phone",
  budget: "1000-3000",
  projectDescription: "Line one\n<b>bold</b> & more detail for the project.",
  consent: true,
  pagePath: "/websites",
  utm: { source: "google", campaign: "black-friday" },
  submittedAt: "2026-11-27T00:00:00.000Z",
};

export const validFormValues = {
  name: "Alex Example",
  businessName: "Example Plumbing",
  email: "alex@example.com",
  phone: "0493 381 286",
  service: "websites",
  contactMethod: "either",
  budget: "1000-3000",
  projectDescription: "We need a website that shows our services and takes quote requests.",
  consent: true,
};
