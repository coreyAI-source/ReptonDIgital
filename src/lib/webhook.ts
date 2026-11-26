import type { Lead } from "./enquiry";

/**
 * Optional lead webhook: forwards each confirmed enquiry as JSON to a URL you
 * control (for example a CRM, spreadsheet automation or Make/Zapier scenario).
 * Server-only. Configure with LEAD_WEBHOOK_URL and, optionally,
 * LEAD_WEBHOOK_SECRET (sent as a Bearer token). HTTPS is required, except for
 * localhost during development and tests.
 */

export interface WebhookConfig {
  url: string;
  secret: string | null;
}

type EnvLike = Record<string, string | undefined>;

export function readWebhookConfig(env: EnvLike = process.env): {
  config: WebhookConfig | null;
  problems: string[];
} {
  const raw = (env.LEAD_WEBHOOK_URL ?? "").trim();
  if (!raw) return { config: null, problems: [] };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { config: null, problems: ["LEAD_WEBHOOK_URL is not a valid URL."] };
  }

  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal)) {
    return { config: null, problems: ["LEAD_WEBHOOK_URL must use https://."] };
  }

  return {
    config: { url: url.toString(), secret: (env.LEAD_WEBHOOK_SECRET ?? "").trim() || null },
    problems: [],
  };
}

/** Returns true only when the endpoint answers with a 2xx status. */
export async function sendWebhook(
  lead: Lead,
  config: WebhookConfig,
  options: { fetchImpl?: typeof fetch } = {},
): Promise<boolean> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.secret) headers.Authorization = `Bearer ${config.secret}`;

  try {
    const response = await fetchImpl(config.url, {
      method: "POST",
      headers,
      body: JSON.stringify({ source: "repton-digital-website", event: "enquiry.submitted", lead }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`[enquiry] webhook responded with HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[enquiry] webhook request failed (${error instanceof Error ? error.name : "unknown"})`);
    return false;
  }
}
