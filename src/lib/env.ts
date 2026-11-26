/**
 * Public (browser-safe) configuration. Only NEXT_PUBLIC_* values belong here.
 * Next.js inlines them at build time, so set them before `next build`
 * (on Vercel: Project Settings > Environment Variables, then redeploy).
 */

const trimmed = (value: string | undefined) => (value ?? "").trim();

/** Canonical site URL, no trailing slash. Used for canonical links, sitemap and robots. */
export const SITE_URL = (trimmed(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000").replace(/\/+$/, "");

const GA4_PATTERN = /^G-[A-Z0-9]{4,20}$/;
const META_PIXEL_PATTERN = /^\d{8,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Invalid IDs are ignored, so a typo never loads a wrong or unsafe script. */
const rawGa4 = trimmed(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);
export const GA4_MEASUREMENT_ID = GA4_PATTERN.test(rawGa4) ? rawGa4 : null;

const rawMetaPixel = trimmed(process.env.NEXT_PUBLIC_META_PIXEL_ID);
export const META_PIXEL_ID = META_PIXEL_PATTERN.test(rawMetaPixel) ? rawMetaPixel : null;

const rawContactEmail = trimmed(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
export const CONTACT_EMAIL = EMAIL_PATTERN.test(rawContactEmail) ? rawContactEmail : null;

/** Cloudflare Turnstile site key. The matching secret lives on the server only. */
export const TURNSTILE_SITE_KEY = trimmed(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) || null;
