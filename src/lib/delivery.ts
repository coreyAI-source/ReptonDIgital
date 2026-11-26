import { readEmailConfig, sendEmailNotification, type EmailConfig } from "./email";
import type { Lead } from "./enquiry";
import { readWebhookConfig, sendWebhook, type WebhookConfig } from "./webhook";

/**
 * Where confirmed enquiries go. Server-only. An enquiry is reported as sent
 * only when every configured destination succeeds, and never when none is set.
 */

export interface DeliveryConfig {
  email: EmailConfig | null;
  webhook: WebhookConfig | null;
  /** Turnstile secret. When set, every enquiry must carry a valid token. */
  turnstileSecret: string | null;
  /** Partly configured or invalid settings. Any problem refuses enquiries rather than delivering partially. */
  problems: string[];
  /** Email variables that are not set. Shown in development only. */
  missing: string[];
}

type EnvLike = Record<string, string | undefined>;

export function readDeliveryConfig(env: EnvLike = process.env): DeliveryConfig {
  const email = readEmailConfig(env);
  const webhook = readWebhookConfig(env);
  return {
    email: email.config,
    webhook: webhook.config,
    turnstileSecret: (env.TURNSTILE_SECRET_KEY ?? "").trim() || null,
    problems: [...email.problems, ...webhook.problems],
    missing: email.missing,
  };
}

export function hasDeliveryDestination(config: DeliveryConfig): boolean {
  return config.email !== null || config.webhook !== null;
}

export interface DeliveryResult {
  ok: boolean;
  /** Names of destinations that failed. Never includes enquiry contents. */
  failed: string[];
}

export async function deliverLead(
  lead: Lead,
  config: DeliveryConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  const jobs: Array<{ name: string; run: () => Promise<boolean> }> = [];

  if (config.email) {
    const email = config.email;
    jobs.push({ name: "email", run: () => sendEmailNotification(lead, email, { fetchImpl }) });
  }
  if (config.webhook) {
    const webhook = config.webhook;
    jobs.push({ name: "webhook", run: () => sendWebhook(lead, webhook, { fetchImpl }) });
  }

  if (jobs.length === 0) {
    return { ok: false, failed: [] };
  }

  const settled = await Promise.allSettled(jobs.map((job) => job.run()));
  const failed: string[] = [];
  settled.forEach((result, index) => {
    const job = jobs[index];
    if (!job) return;
    if (result.status === "rejected" || result.value !== true) {
      failed.push(job.name);
    }
  });

  if (failed.length > 0) {
    console.error(`[enquiry] delivery failed for: ${failed.join(", ")}`);
  }
  return { ok: failed.length === 0, failed };
}
