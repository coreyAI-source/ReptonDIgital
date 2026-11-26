import { afterEach, describe, expect, it, vi } from "vitest";
import { deliverLead, hasDeliveryDestination, readDeliveryConfig } from "@/lib/delivery";
import { readWebhookConfig } from "@/lib/webhook";
import { sampleLead } from "./fixtures";

const emailEnv = {
  RESEND_API_KEY: "re_test_key",
  ENQUIRY_TO_EMAIL: "hello@example.com",
  ENQUIRY_FROM_EMAIL: "enquiries@example.com",
};

/** Answers by destination: Resend and webhook responses are chosen per test. */
function routedFetch(answers: { resend?: number; webhook?: number }) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith("https://api.resend.com")) {
      return new Response("{}", { status: answers.resend ?? 200 });
    }
    return new Response("{}", { status: answers.webhook ?? 200 });
  }) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

describe("readWebhookConfig", () => {
  it("is off when LEAD_WEBHOOK_URL is not set", () => {
    expect(readWebhookConfig({})).toEqual({ config: null, problems: [] });
  });

  it("requires https, except for localhost during development", () => {
    expect(readWebhookConfig({ LEAD_WEBHOOK_URL: "http://example.com/hook" }).problems).toHaveLength(1);
    expect(readWebhookConfig({ LEAD_WEBHOOK_URL: "https://example.com/hook" }).config?.url).toBe(
      "https://example.com/hook",
    );
    expect(readWebhookConfig({ LEAD_WEBHOOK_URL: "http://localhost:4010/hook" }).config).not.toBeNull();
  });

  it("reads the optional bearer secret", () => {
    const { config } = readWebhookConfig({
      LEAD_WEBHOOK_URL: "https://example.com/hook",
      LEAD_WEBHOOK_SECRET: " s3cret ",
    });
    expect(config?.secret).toBe("s3cret");
  });
});

describe("deliverLead", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports failure when no destination is configured, so nothing is claimed as sent", async () => {
    const config = readDeliveryConfig({});
    expect(hasDeliveryDestination(config)).toBe(false);
    const result = await deliverLead(sampleLead, config, routedFetch({}));
    expect(result).toEqual({ ok: false, failed: [] });
  });

  it("succeeds when the only configured webhook answers 2xx, and sends the bearer secret", async () => {
    const fetchImpl = routedFetch({});
    const config = readDeliveryConfig({
      LEAD_WEBHOOK_URL: "https://hooks.example.com/lead",
      LEAD_WEBHOOK_SECRET: "hook-secret",
    });

    const result = await deliverLead(sampleLead, config, fetchImpl);

    expect(result.ok).toBe(true);
    const [url, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0] ?? [];
    expect(url).toBe("https://hooks.example.com/lead");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer hook-secret");
  });

  it("succeeds only when every configured destination succeeds", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const config = readDeliveryConfig({ ...emailEnv, LEAD_WEBHOOK_URL: "https://hooks.example.com/lead" });

    const allGood = await deliverLead(sampleLead, config, routedFetch({ resend: 200, webhook: 200 }));
    expect(allGood).toEqual({ ok: true, failed: [] });

    const webhookDown = await deliverLead(sampleLead, config, routedFetch({ resend: 200, webhook: 500 }));
    expect(webhookDown).toEqual({ ok: false, failed: ["webhook"] });

    const emailDown = await deliverLead(sampleLead, config, routedFetch({ resend: 503, webhook: 200 }));
    expect(emailDown).toEqual({ ok: false, failed: ["email"] });
  });

  it("refuses to deliver when a configured destination is invalid", () => {
    const config = readDeliveryConfig({ LEAD_WEBHOOK_URL: "http://example.com/insecure" });
    expect(config.problems).toHaveLength(1);
    expect(hasDeliveryDestination(config)).toBe(false);
  });
});
