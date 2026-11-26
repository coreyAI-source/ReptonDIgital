import { BUDGET_LABELS, CONTACT_METHOD_LABELS, SERVICE_LABELS, type Lead } from "./enquiry";

/**
 * Enquiry notification by email through the Resend HTTP API. Server-only.
 * Configure with RESEND_API_KEY, ENQUIRY_TO_EMAIL and ENQUIRY_FROM_EMAIL
 * (see .env.example). The sender domain must be verified in Resend.
 */

export const EMAIL_ENV_NAMES = ["RESEND_API_KEY", "ENQUIRY_TO_EMAIL", "ENQUIRY_FROM_EMAIL"] as const;

export interface EmailConfig {
  apiKey: string;
  to: string;
  from: string;
}

export interface EmailConfigReadResult {
  config: EmailConfig | null;
  missing: string[];
  problems: string[];
}

type EnvLike = Record<string, string | undefined>;

const EMAIL_ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readEmailConfig(env: EnvLike = process.env): EmailConfigReadResult {
  const apiKey = (env.RESEND_API_KEY ?? "").trim();
  const to = (env.ENQUIRY_TO_EMAIL ?? "").trim();
  const from = (env.ENQUIRY_FROM_EMAIL ?? "").trim();

  const entries: Array<[string, string]> = [
    ["RESEND_API_KEY", apiKey],
    ["ENQUIRY_TO_EMAIL", to],
    ["ENQUIRY_FROM_EMAIL", from],
  ];
  const missing = entries.filter(([, value]) => !value).map(([name]) => name);

  // Nothing set: email is simply not in use. A webhook may still be configured.
  if (missing.length === entries.length) {
    return { config: null, missing, problems: [] };
  }
  // Partly set: refuse rather than deliver to only some destinations.
  if (missing.length > 0) {
    return {
      config: null,
      missing,
      problems: [`Email is partly configured. Missing: ${missing.join(", ")}.`],
    };
  }

  // Accept "Name <address@domain>" for the sender.
  const fromAddress = from.match(/<([^>]+)>$/)?.[1]?.trim() ?? from;
  const problems: string[] = [];
  if (!EMAIL_ADDRESS.test(to)) {
    problems.push("ENQUIRY_TO_EMAIL is not a valid email address.");
  }
  if (!EMAIL_ADDRESS.test(fromAddress)) {
    problems.push("ENQUIRY_FROM_EMAIL must be an email address on a domain verified with Resend.");
  }
  if (problems.length > 0) {
    return { config: null, missing: [], problems };
  }

  return { config: { apiKey, to, from }, missing: [], problems: [] };
}

/** Removes line breaks and limits length so a value cannot inject email headers. */
export function safeHeaderText(value: string, max = 150): string {
  return value.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, max);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildEnquiryEmail(lead: Lead): { subject: string; text: string; html: string } {
  const service = SERVICE_LABELS[lead.service];
  const subject = safeHeaderText(`New ${service.toLowerCase()} enquiry from ${lead.name}`);

  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Business", lead.businessName ?? "Not given"],
    ["Email", lead.email],
    ["Phone", lead.phone ?? "Not given"],
    ["Preferred contact", CONTACT_METHOD_LABELS[lead.contactMethod]],
    ["Service", service],
    ["Budget range", lead.budget ? BUDGET_LABELS[lead.budget] : "Not given"],
    ["Page submitted from", lead.pagePath ?? "Not recorded"],
    ["Submitted (UTC)", lead.submittedAt],
  ];

  const utmEntries: Array<[string, string | undefined]> = [
    ["utm_source", lead.utm.source],
    ["utm_medium", lead.utm.medium],
    ["utm_campaign", lead.utm.campaign],
    ["utm_content", lead.utm.content],
    ["utm_term", lead.utm.term],
  ];
  const campaignRows: Array<[string, string]> = [];
  for (const [label, value] of utmEntries) {
    if (value) campaignRows.push([label, value]);
  }

  const text = [
    "New enquiry from the Repton Digital website.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(campaignRows.length > 0
      ? ["", "Campaign details:", ...campaignRows.map(([label, value]) => `${label}: ${value}`)]
      : []),
    "",
    "Project description:",
    lead.projectDescription,
    "",
    "Reply to this email to contact the enquirer directly.",
  ].join("\n");

  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.5">
<h2 style="margin:0 0 12px">New enquiry</h2>
<table style="border-collapse:collapse;margin-bottom:16px">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#555;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
  )
  .join("\n")}
</table>
${
  campaignRows.length > 0
    ? `<p style="margin:0 0 4px;color:#555">Campaign details</p><ul style="margin:0 0 16px;padding-left:18px">${campaignRows
        .map(([label, value]) => `<li>${escapeHtml(label)}: ${escapeHtml(value)}</li>`)
        .join("")}</ul>`
    : ""
}
<p style="margin:0 0 4px;color:#555">Project description</p>
<p style="margin:0;white-space:pre-line">${escapeHtml(lead.projectDescription)}</p>
</body></html>`;

  return { subject, text, html };
}

/**
 * Sends the enquiry notification. Times out after 10 seconds. Logs only the
 * HTTP status or error type, never the enquiry contents.
 */
export async function sendEmailNotification(
  lead: Lead,
  config: EmailConfig,
  options: { fetchImpl?: typeof fetch } = {},
): Promise<boolean> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const message = buildEnquiryEmail(lead);

  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: lead.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[enquiry] email provider responded with HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[enquiry] email provider request failed (${error instanceof Error ? error.name : "unknown"})`);
    return false;
  }
}
