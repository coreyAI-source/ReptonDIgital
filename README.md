# Repton Digital website

Conversion-focused marketing site for Repton Digital, a Perth web development, AI automation and custom software business. Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and Zod.

**Status:** live at https://reptondigital.com.au, deployed from `main` of `coreyAI-source/ReptonDIgital` on Vercel. No credentials are configured yet, so enquiries are not sent until email is set up. The portfolio screenshots are not in the repository yet.

## What is included

- **Pages:** `/` (home), `/websites` (A$699 starter package), `/ai-automation`, `/software`, `/work` (the Fresh New Look Renovations project), `/contact` (enquiry form), `/privacy` (draft policy), plus a 404 page, `sitemap.xml`, `robots.txt` and a generated social preview image.
- **Black Friday banner:** shown above the header until the end of the day set in `src/config/promotion.ts` (default 30 November 2026, Perth time).
- **Enquiry form:** name, business name, email, phone, service, project description, budget range, preferred contact method and a consent tick box. UTM campaign values and the chosen service are kept and sent with each enquiry.
- **Analytics:** Google Analytics 4 and the Meta Pixel, switched on by environment variables. Events: page views, service selections, and a lead event only after the server confirms an enquiry was delivered.
- **Honest delivery:** the form reports "sent" only when every configured destination (email and/or webhook) succeeds. With nothing configured it says the enquiry was not sent.

## Requirements

- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm 10 or newer

## Local development

```powershell
cd reptondigital
npm install
Copy-Item .env.example .env.local   # then fill in the values you have (see below)
npm run dev                         # http://localhost:3000
```

On macOS or Linux, use `cp .env.example .env.local`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serves the production build |
| `npm run typecheck` | TypeScript check, no output |
| `npm run lint` | ESLint (Next.js rules and TypeScript rules) |
| `npm run test` | Unit and API tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright). Install the browser once with `npx playwright install chromium` |
| `npm run check` | Typecheck, lint, unit tests and production build |

## Before launch: what needs your input

Nothing below has been published or activated. Items marked **credential** need an account or key from you.

| # | Item | Where | Notes |
| --- | --- | --- | --- |
| 1 | Live domain (**decision**) | `NEXT_PUBLIC_SITE_URL` | Used for canonical links, sitemap, social previews and structured data. |
| 2 | Enquiry email (**credential**) | `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` | Sign up at resend.com. The sender domain must be verified in Resend, which needs a domain you control. |
| 3 | Lead storage beyond your inbox (optional) | `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | Forwards each enquiry as JSON to a CRM, spreadsheet automation or similar. HTTPS only. |
| 4 | Spam protection (**credential**, recommended) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile. Without it the form relies on the honeypot, timing check and a per-instance rate limit. |
| 5 | Analytics (**credential**) | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (`G-…`), `NEXT_PUBLIC_META_PIXEL_ID` (digits) | Invalid IDs are ignored. These are read at build time, so set them before deploying. |
| 6 | Public contact email (optional) | `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the footer and on the contact page only when set. |
| 7 | Phone number (**confirm**) | `src/config/business.ts` | `+61 493 381 286` was taken from your brand notes (`repton-digital/repton-context.md` in the git history). Confirm it is current. |
| 8 | Legal name, privacy contact and retention period (**confirm**) | `src/config/business.ts`, `src/app/privacy/page.tsx` | Items in `[square brackets]` are placeholders. Have the policy reviewed against the Australian Privacy Principles, then set `privacyPolicyIsDraft: false`. This is not legal advice. |
| 9 | Starter package scope and prices (**approve**) | `src/app/websites/page.tsx` | The scope list is a draft for you to approve. Hosting is shown as A$10 per month, taken from your brand notes with AUD assumed. |
| 10 | Black Friday end date | `src/config/promotion.ts` (`endsOn`) | Default 2026-11-30. After the offer ends, update the starter-package wording if the price changes. |
| 11 | Fresh New Look screenshots (**client approval**) | `public/work/` and `src/app/work/page.tsx` | Captured from the client review build, which has not launched. Confirm the client agrees to them appearing publicly. They are not in the repository yet, so the portfolio images show as broken until they are added to `public/work/`. Update the status line when the site launches. |
| 12 | Cookie consent (**decision**) | not implemented | Analytics load on page load and the privacy policy says so. Add a consent banner if you advertise to EU or UK audiences. |

Budget bands in the enquiry form (`src/lib/enquiry.ts`) are qualifying ranges only, not prices.

## Deploying to Vercel

1. The Vercel project `repton-d-igital` deploys `main` to reptondigital.com.au. For changes, push a branch, check its preview, then merge to `main`.
2. `vercel.json` sets the framework to Next.js. The dashboard's **Output Directory** must still be empty. A static setting serves the repository with no homepage, so every page returns 404.
3. Under **Environment Variables**, add the values from `.env.example` for the Production environment. Mark the `RESEND_API_KEY`, `LEAD_WEBHOOK_SECRET` and `TURNSTILE_SECRET_KEY` values as sensitive.
4. Deploy. Then check `/robots.txt` and `/sitemap.xml`.
5. Submit one test enquiry. Confirm the email arrives with the visitor's address as reply-to, and that GA4 Realtime and Meta Test Events show the page view and the lead.
6. Add your domain in Vercel. Set `NEXT_PUBLIC_SITE_URL` to it and redeploy, because `NEXT_PUBLIC_*` values are built into the site.

## Verification

- `npm run check`: typecheck, lint, 56 unit and API tests across 5 files, and production build. All passing.
- `npm run test:e2e`: 34 test runs, 17 cases on each of the desktop and phone projects. 31 pass and 3 are skipped by design (device-specific checks). They cover page layout, the mobile menu, the Black Friday end date, form validation, UTM persistence, the webhook round trip, analytics events (including no lead event on failure), and an accessibility scan.
- Horizontal overflow checked at 320, 360, 375, 390, 414, 600, 768, 900, 1024, 1280 and 1440 px on every page.

Not yet done: Lighthouse scores, real-device testing, live email delivery, and live GA4 and Meta event verification.

## Project structure

```
src/
  app/                    Pages, layout, metadata, sitemap, robots, social image
    api/enquiry/route.ts  Enquiry endpoint (POST)
  components/site/        Page sections and UI (form, navigation, banner, cards)
  components/analytics/   GA4 and Meta Pixel loaders, page view tracking, UTM capture
  config/                 Business details, Black Friday offer, navigation
  lib/                    Validation, email, webhook, Turnstile, rate limit, analytics, UTM
public/brand/             Repton mark (cropped from the existing logo)
public/work/              Fresh New Look screenshots (client review build)
tests/                    Vitest unit and API tests
e2e/                      Playwright browser tests and a local mock webhook
```

## Notes

- Spam protection layers: a hidden honeypot field, a minimum fill time of 2.5 seconds, a 10-minute rate limit per connection (held in memory, so it is per server instance), same-origin checks, and optional Turnstile.
- Nothing on the site claims results, testimonials, reviews, registration numbers or guaranteed outcomes. The Fresh New Look project is described only with facts from its build report.
- The brand "R" mark is the existing Repton logo, cropped so it reads at small sizes. The original file is in the git history.
