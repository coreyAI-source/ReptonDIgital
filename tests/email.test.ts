import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEnquiryEmail, escapeHtml, readEmailConfig, safeHeaderText, sendEmailNotification } from "@/lib/email";
import { sampleLead } from "./fixtures";

const config = { apiKey: "re_test_key", to: "hello@example.com", from: "enquiries@example.com" };

describe("readEmailConfig", () => {
  it("reports nothing configured when no email variables are set", () => {
    const result = readEmailConfig({});
    expect(result.config).toBeNull();
    expect(result.problems).toEqual([]);
    expect(result.missing).toEqual(["RESEND_API_KEY", "ENQUIRY_TO_EMAIL", "ENQUIRY_FROM_EMAIL"]);
  });

  it("refuses a partly configured setup rather than delivering to some destinations", () => {
    const result = readEmailConfig({ RESEND_API_KEY: "re_test_key" });
    expect(result.config).toBeNull();
    expect(result.problems[0]).toMatch(/partly configured/);
  });

  it("accepts a complete setup, including a display-name sender", () => {
    const result = readEmailConfig({
      RESEND_API_KEY: "re_test_key",
      ENQUIRY_TO_EMAIL: "hello@example.com",
      ENQUIRY_FROM_EMAIL: "Repton Digital <enquiries@example.com>",
    });
    expect(result.config).toEqual({
      apiKey: "re_test_key",
      to: "hello@example.com",
      from: "Repton Digital <enquiries@example.com>",
    });
  });

  it("rejects an invalid recipient address", () => {
    const result = readEmailConfig({
      RESEND_API_KEY: "re_test_key",
      ENQUIRY_TO_EMAIL: "not-an-address",
      ENQUIRY_FROM_EMAIL: "enquiries@example.com",
    });
    expect(result.config).toBeNull();
    expect(result.problems.join(" ")).toMatch(/ENQUIRY_TO_EMAIL/);
  });
});

describe("buildEnquiryEmail", () => {
  it("escapes HTML in the body", () => {
    const message = buildEnquiryEmail({
      ...sampleLead,
      name: "Alex <script>alert(1)</script>",
    });
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
    expect(message.html).toContain("Example &amp; Sons");
    expect(message.html).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("keeps the subject on one line", () => {
    const message = buildEnquiryEmail({ ...sampleLead, name: "Alex\r\nBcc: someone@example.com" });
    expect(message.subject).not.toMatch(/[\r\n]/);
  });

  it("includes campaign details and the project description in the text body", () => {
    const message = buildEnquiryEmail(sampleLead);
    expect(message.text).toContain("utm_campaign: black-friday");
    expect(message.text).toContain("Service: Website design");
    expect(message.text).toContain("Line one");
  });
});

describe("safeHeaderText and escapeHtml", () => {
  it("removes line breaks and limits length", () => {
    expect(safeHeaderText("a\r\nb")).toBe("a b");
    expect(safeHeaderText("x".repeat(400))).toHaveLength(150);
  });

  it("escapes the characters that matter in HTML", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("sendEmailNotification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to Resend with the enquirer as reply-to and returns true on success", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));

    const ok = await sendEmailNotification(sampleLead, config, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(ok).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(String(init.body)) as { reply_to: string; to: string[]; from: string };
    expect(body.reply_to).toBe("alex@example.com");
    expect(body.to).toEqual(["hello@example.com"]);
    expect(body.from).toBe("enquiries@example.com");
  });

  it("returns false when the provider rejects the request, and logs only the status", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchImpl = vi.fn(async () => new Response("rejected", { status: 422 }));

    const ok = await sendEmailNotification(sampleLead, config, { fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(ok).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith("[enquiry] email provider responded with HTTP 422");
    expect(errorSpy.mock.calls.flat().join(" ")).not.toContain("alex@example.com");
  });

  it("returns false on a network failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });

    const ok = await sendEmailNotification(sampleLead, config, { fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(ok).toBe(false);
  });
});
