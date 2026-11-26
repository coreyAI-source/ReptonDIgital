import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/enquiry/route";
import { MIN_FORM_FILL_MS, MAX_FORM_AGE_MS } from "@/lib/enquiry";
import { resetRateLimitForTests } from "@/lib/rate-limit";
import { validFormValues } from "./fixtures";

const ORIGIN = "https://reptondigital.example.com";
const ENV_KEYS = [
  "RESEND_API_KEY",
  "ENQUIRY_TO_EMAIL",
  "ENQUIRY_FROM_EMAIL",
  "LEAD_WEBHOOK_URL",
  "LEAD_WEBHOOK_SECRET",
  "TURNSTILE_SECRET_KEY",
] as const;

let ipCounter = 0;

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  for (const key of ENV_KEYS) {
    const value = values[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function body(overrides: Record<string, unknown> = {}) {
  return {
    ...validFormValues,
    website: "",
    startedAt: Date.now() - MIN_FORM_FILL_MS - 2000,
    utm: { source: "meta", campaign: "black-friday" },
    pagePath: "/websites",
    ...overrides,
  };
}

function post(payload: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return new Request(`${ORIGIN}/api/enquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: ORIGIN,
      "x-forwarded-for": `198.51.100.${(ipCounter % 200) + 1}`,
      ...headers,
    },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

/** Routes outbound calls: webhook and Turnstile verification get their own answers. */
function stubOutbound(options: { webhook?: number; turnstile?: boolean } = {}) {
  const fetchMock = vi.fn(async (...args: [RequestInfo | URL, RequestInit?]) => {
    const url = String(args[0]);
    if (url.startsWith("https://challenges.cloudflare.com")) {
      return new Response(JSON.stringify({ success: options.turnstile ?? true }), { status: 200 });
    }
    return new Response("{}", { status: options.webhook ?? 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("POST /api/enquiry", () => {
  beforeEach(() => {
    resetRateLimitForTests();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    setEnv({});
  });

  afterEach(() => {
    setEnv({});
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("refuses requests from another origin", async () => {
    const response = await POST(post(body(), { Origin: "https://evil.example.net" }));
    expect(response.status).toBe(403);
  });

  it("requires a JSON content type", async () => {
    const response = await POST(post(body(), { "Content-Type": "text/plain" }));
    expect(response.status).toBe(415);
  });

  it("rejects oversized bodies", async () => {
    const response = await POST(post({ ...body(), projectDescription: "x".repeat(20_000) }));
    expect(response.status).toBe(413);
  });

  it("rejects invalid JSON", async () => {
    const response = await POST(post("{not json"));
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("INVALID_JSON");
  });

  it("returns field errors for invalid input", async () => {
    const response = await POST(post(body({ email: "not-an-email" })));
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.code).toBe("VALIDATION_FAILED");
    expect(json.fieldErrors.email).toBeDefined();
  });

  it("refuses a filled honeypot without reporting success", async () => {
    const fetchMock = stubOutbound();
    const response = await POST(post(body({ website: "http://spam.example" })));
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.code).toBe("SPAM_CHECK_FAILED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a form submitted implausibly fast", async () => {
    const response = await POST(post(body({ startedAt: Date.now() })));
    expect((await response.json()).code).toBe("SPAM_CHECK_FAILED");
  });

  it("asks for a reload when the form was left open too long", async () => {
    const response = await POST(post(body({ startedAt: Date.now() - MAX_FORM_AGE_MS - 60_000 })));
    expect((await response.json()).code).toBe("SESSION_EXPIRED");
  });

  it("says the enquiry was not sent when no destination is configured", async () => {
    const fetchMock = stubOutbound();
    const response = await POST(post(body()));
    const json = await response.json();
    expect(response.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.code).toBe("NOT_CONFIGURED");
    expect(json.message).toMatch(/not sent/i);
    expect(json.devMessage).toMatch(/RESEND_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("delivers to the configured webhook with UTM and service, but no anti-spam fields", async () => {
    setEnv({ LEAD_WEBHOOK_URL: "https://hooks.example.com/lead", LEAD_WEBHOOK_SECRET: "hook-secret" });
    const fetchMock = stubOutbound({ webhook: 200 });

    const response = await POST(post(body()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const call = fetchMock.mock.calls.find(([url]) => String(url).includes("hooks.example.com"));
    expect(call).toBeDefined();
    const sent = JSON.parse(String(call?.[1]?.body ?? "{}")) as {
      lead: Record<string, unknown>;
    };
    expect(sent.lead.service).toBe("websites");
    expect(sent.lead.utm).toMatchObject({ source: "meta", campaign: "black-friday" });
    expect(sent.lead).not.toHaveProperty("website");
    expect(sent.lead).not.toHaveProperty("startedAt");
  });

  it("reports the enquiry as not delivered when the destination fails", async () => {
    setEnv({ LEAD_WEBHOOK_URL: "https://hooks.example.com/lead" });
    stubOutbound({ webhook: 500 });

    const response = await POST(post(body()));
    const json = await response.json();
    expect(response.status).toBe(502);
    expect(json.ok).toBe(false);
    expect(json.code).toBe("SEND_FAILED");
  });

  it("requires a valid Turnstile token when Turnstile is enabled", async () => {
    setEnv({ LEAD_WEBHOOK_URL: "https://hooks.example.com/lead", TURNSTILE_SECRET_KEY: "turnstile-secret" });
    stubOutbound({ turnstile: true });

    const missing = await POST(post(body()));
    expect(missing.status).toBe(400);
    expect((await missing.json()).code).toBe("SECURITY_CHECK_FAILED");

    const withToken = await POST(post(body({ turnstileToken: "valid-token" })));
    expect(withToken.status).toBe(200);
  });

  it("limits repeated submissions from one connection", async () => {
    setEnv({ LEAD_WEBHOOK_URL: "https://hooks.example.com/lead" });
    stubOutbound({ webhook: 200 });
    const headers = { "x-forwarded-for": "203.0.113.99" };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const ok = await POST(post(body(), headers));
      expect(ok.status).toBe(200);
    }
    const limited = await POST(post(body(), headers));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).not.toBeNull();
  });
});

describe("GET /api/enquiry", () => {
  it("only accepts POST", async () => {
    const response = GET();
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });
});
