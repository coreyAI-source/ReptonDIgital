import { NextResponse } from "next/server";
import { deliverLead, hasDeliveryDestination, readDeliveryConfig } from "@/lib/delivery";
import {
  MAX_FORM_AGE_MS,
  MIN_FORM_FILL_MS,
  enquiryRequestSchema,
  fieldErrorsFromIssues,
  toLead,
} from "@/lib/enquiry";
import { SITE_URL } from "@/lib/env";
import { checkRateLimit, clientAddressFromHeaders, hashClientKey } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const SPAM_REJECTION = "We could not send your enquiry. Please check the form and try again, or call us directly.";

type ApiResponse =
  | { ok: true }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string>;
      /** Development only: explains what is missing. Never sent in production. */
      devMessage?: string;
    };

function respond(body: ApiResponse, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

/**
 * Accepts requests whose Origin matches the Host the browser used, the host
 * Next reports, or the configured public site. Requests without an Origin
 * (non-browser clients) still need the JSON content type checked below.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const allowedHosts = new Set<string>();
  const hostHeader = request.headers.get("host");
  if (hostHeader) allowedHosts.add(hostHeader);
  allowedHosts.add(new URL(request.url).host);
  try {
    allowedHosts.add(new URL(SITE_URL).host);
  } catch {
    // SITE_URL is always a valid URL in normal configuration.
  }
  return allowedHosts.has(originHost);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return respond(
      {
        ok: false,
        code: "FORBIDDEN_ORIGIN",
        message: "This enquiry could not be accepted. Please refresh the page and try again.",
      },
      403,
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return respond(
      { ok: false, code: "UNSUPPORTED_MEDIA_TYPE", message: "Please submit the form from the website." },
      415,
    );
  }

  const tooLarge = () =>
    respond(
      {
        ok: false,
        code: "PAYLOAD_TOO_LARGE",
        message: "Your enquiry is too large. Please shorten the project description.",
      },
      413,
    );

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) return tooLarge();

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return tooLarge();

  const address = clientAddressFromHeaders(request.headers);
  const limit = checkRateLimit(hashClientKey(address), RATE_LIMIT);
  if (!limit.allowed) {
    return respond(
      {
        ok: false,
        code: "RATE_LIMITED",
        message:
          "There have been several enquiries from this connection recently. Please wait a few minutes, or call us directly.",
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return respond({ ok: false, code: "INVALID_JSON", message: "Your enquiry could not be read. Please try again." }, 400);
  }

  const parsed = enquiryRequestSchema.safeParse(json);
  if (!parsed.success) {
    return respond(
      {
        ok: false,
        code: "VALIDATION_FAILED",
        message: "Please check the highlighted fields.",
        fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
      },
      400,
    );
  }
  const data = parsed.data;

  // Honeypot filled in. Refuse without reporting success, so no conversion is recorded for it.
  if (data.website.trim() !== "") {
    return respond({ ok: false, code: "SPAM_CHECK_FAILED", message: SPAM_REJECTION }, 400);
  }

  // Submitted implausibly fast (automated) or left open for too long (stale session).
  const age = Date.now() - data.startedAt;
  if (age < MIN_FORM_FILL_MS) {
    return respond({ ok: false, code: "SPAM_CHECK_FAILED", message: SPAM_REJECTION }, 400);
  }
  if (age > MAX_FORM_AGE_MS) {
    return respond(
      { ok: false, code: "SESSION_EXPIRED", message: "Your session timed out. Please refresh the page and try again." },
      400,
    );
  }

  const delivery = readDeliveryConfig();
  if (delivery.problems.length > 0 || !hasDeliveryDestination(delivery)) {
    const isDev = process.env.NODE_ENV !== "production";
    console.warn("[enquiry] no complete delivery destination is configured; enquiry was NOT sent");
    const devParts = [
      ...delivery.problems,
      delivery.missing.length > 0 ? `Missing: ${delivery.missing.join(", ")}.` : null,
      "Copy .env.example to .env.local and set the email variables, or LEAD_WEBHOOK_URL (see README.md).",
    ].filter(Boolean);
    return respond(
      {
        ok: false,
        code: "NOT_CONFIGURED",
        message:
          "Online enquiries are not connected yet, so your message was not sent. Please call us on the number on this page.",
        ...(isDev ? { devMessage: devParts.join(" ") } : {}),
      },
      503,
    );
  }

  if (delivery.turnstileSecret) {
    const verified = data.turnstileToken
      ? await verifyTurnstileToken(data.turnstileToken, delivery.turnstileSecret, address)
      : false;
    if (!verified) {
      return respond(
        { ok: false, code: "SECURITY_CHECK_FAILED", message: "Please complete the security check and try again." },
        400,
      );
    }
  }

  const result = await deliverLead(toLead(data, new Date()), delivery);
  if (!result.ok) {
    return respond(
      {
        ok: false,
        code: "SEND_FAILED",
        message:
          "We could not send your enquiry just now, so it has not been delivered. Please try again shortly or call us.",
      },
      502,
    );
  }

  return respond({ ok: true }, 200);
}

export function GET() {
  return respond({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST to submit an enquiry." }, 405, {
    Allow: "POST",
  });
}
