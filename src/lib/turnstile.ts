/**
 * Cloudflare Turnstile server-side verification. Optional: used only when
 * TURNSTILE_SECRET_KEY is set. Fails closed: any error counts as not verified.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(
  token: string,
  secret: string,
  remoteAddress: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token || !secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteAddress && remoteAddress !== "unknown") body.set("remoteip", remoteAddress);

  try {
    const response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { success?: unknown };
    return data.success === true;
  } catch {
    return false;
  }
}
