import { afterEach, describe, expect, it, vi } from "vitest";
import { isBlackFridayOfferActive } from "@/config/promotion";
import { checkRateLimit, clientAddressFromHeaders, hashClientKey, resetRateLimitForTests } from "@/lib/rate-limit";
import { pickUtmParams } from "@/lib/utm";
import { verifyTurnstileToken } from "@/lib/turnstile";

describe("verifyTurnstileToken", () => {
  it("does not call Cloudflare without a token", async () => {
    const fetchImpl = vi.fn();
    expect(await verifyTurnstileToken("", "secret", "203.0.113.5", fetchImpl as unknown as typeof fetch)).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns true only when Cloudflare reports success", async () => {
    const ok = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    expect(await verifyTurnstileToken("tok", "secret", "203.0.113.5", ok as unknown as typeof fetch)).toBe(true);

    const [url, init] = ok.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe("secret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("203.0.113.5");

    const rejected = vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 200 }));
    expect(await verifyTurnstileToken("tok", "secret", null, rejected as unknown as typeof fetch)).toBe(false);
  });

  it("fails closed on HTTP errors and network failures", async () => {
    const serverError = vi.fn(async () => new Response("oops", { status: 500 }));
    expect(await verifyTurnstileToken("tok", "secret", null, serverError as unknown as typeof fetch)).toBe(false);

    const broken = vi.fn(async () => {
      throw new TypeError("network down");
    });
    expect(await verifyTurnstileToken("tok", "secret", null, broken as unknown as typeof fetch)).toBe(false);
  });
});

describe("checkRateLimit", () => {
  afterEach(() => {
    resetRateLimitForTests();
  });

  it("allows the limit within the window, then blocks with a retry time", () => {
    const now = 1_000_000;
    const options = { limit: 2, windowMs: 60_000 };
    expect(checkRateLimit("k", options, now).allowed).toBe(true);
    expect(checkRateLimit("k", options, now + 1).allowed).toBe(true);
    const blocked = checkRateLimit("k", options, now + 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window passes", () => {
    const now = 1_000_000;
    const options = { limit: 1, windowMs: 60_000 };
    expect(checkRateLimit("k", options, now).allowed).toBe(true);
    expect(checkRateLimit("k", options, now + 1).allowed).toBe(false);
    expect(checkRateLimit("k", options, now + 60_001).allowed).toBe(true);
  });

  it("never stores the raw address", () => {
    const key = hashClientKey("203.0.113.5");
    expect(key).not.toContain("203.0.113.5");
    expect(key).toHaveLength(32);
  });

  it("reads the first forwarded address", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.7, 10.0.0.1" });
    expect(clientAddressFromHeaders(headers)).toBe("198.51.100.7");
    expect(clientAddressFromHeaders(new Headers())).toBe("unknown");
  });
});

describe("isBlackFridayOfferActive", () => {
  it("is active until the end of 30 November 2026 in Perth time", () => {
    // 23:59:59 AWST on 30 November is 15:59:59 UTC.
    expect(isBlackFridayOfferActive(new Date("2026-11-30T15:59:59Z"))).toBe(true);
  });

  it("ends at midnight Perth time on 1 December", () => {
    expect(isBlackFridayOfferActive(new Date("2026-11-30T16:00:00Z"))).toBe(false);
    expect(isBlackFridayOfferActive(new Date("2026-12-15T00:00:00Z"))).toBe(false);
  });
});

describe("pickUtmParams", () => {
  it("keeps only utm_* values, trimmed and length-limited", () => {
    const params = new URLSearchParams(
      `utm_source=%20google%20&utm_medium=cpc&utm_campaign=${"c".repeat(300)}&utm_content=&gclid=abc&utm_term=bathroom`,
    );
    const picked = pickUtmParams(params);
    expect(picked).toEqual({
      source: "google",
      medium: "cpc",
      campaign: "c".repeat(200),
      term: "bathroom",
    });
  });

  it("returns an empty object when there are no UTM values", () => {
    expect(pickUtmParams(new URLSearchParams("gclid=abc"))).toEqual({});
  });
});
