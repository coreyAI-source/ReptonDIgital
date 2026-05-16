# CLAUDE.md — Repton Digital / Reportly Waitlist Page

This file is read by Claude Code at the start of every session working on this project.

---

## What This Is

The **reptondigital.com.au** website — currently a waitlist landing page for **Reportly**, the first product built by Repton Digital.

---

## About Repton Digital

Repton Digital is an Australian software development company. We design and build SaaS products and web software — no templates, no fluff. Based in Australia.

---

## About Reportly

Reportly is Repton Digital's first product — an AI-powered client reporting SaaS for marketing agencies.

**What it does:** Automatically pulls data from clients' ad accounts (Google Analytics, Meta Ads, Google Ads) and uses AI to write the full report narrative, start to finish.

**Tagline:** "Client reports that write themselves."

---

## Current Site Purpose

Waitlist landing page for Reportly early access. Goal: capture high-intent leads from marketing agency owners before launch.

---

## Tech Stack

- **Vanilla HTML, CSS, JS** — no frameworks, no build step
- **Static site** hosted on Vercel (push to `main` → auto deploy)
- **Google Fonts** — Inter only (weights 400–800)
- No backend — form submission is client-side confirmation only (no data is sent anywhere)

---

## File Structure

| File          | Purpose                                            |
|---------------|----------------------------------------------------|
| `index.html`  | Main page — all 7 sections                         |
| `styles.css`  | All styles — mobile-first, CSS variables           |
| `script.js`   | Smooth scroll, Intersection Observer, form handler |
| `vercel.json` | Static site deployment config (no build step)      |
| `robots.txt`  | Allows all crawlers, points to sitemap             |
| `sitemap.xml` | Single URL: https://reptondigital.com.au           |
| `CLAUDE.md`   | This file — project context for Claude Code        |

---

## Brand Identity

| Token    | Hex       | Usage                              |
|----------|-----------|------------------------------------|
| Navy     | `#0F172A` | Page background                    |
| Indigo   | `#6366F1` | Primary accent, CTAs, badges       |
| White    | `#FFFFFF` | Headlines, primary text            |
| Slate    | `#94A3B8` | Body text, secondary copy          |

- **Font:** Inter (Google Fonts)
- **Aesthetic:** Premium, minimal SaaS — think Linear or Vercel. Confident, modern, not corporate.

---

## Page Sections

1. **Nav** — Repton Digital wordmark + "Makers of Reportly" indigo pill badge + "Join waitlist" CTA
2. **Hero** — Full viewport, headline, sub, two CTAs, animated indigo gradient
3. **Problem** — 3 pain cards with red/orange accent icons
4. **How it works** — 3 numbered steps, horizontal desktop / stacked mobile
5. **Features** — 6 cards (AI narratives, white-label, monthly delivery, multi-platform, PDF export, custom branding)
6. **Waitlist form** — Name, work email, client count dropdown → thank-you state on submit
7. **Footer** — Copyright, Privacy/Terms links, Reportly tagline

---

## Pricing (for future pricing section)

| Plan    | Price   | Clients   |
|---------|---------|-----------|
| Starter | $99/mo  | Up to 10  |
| Agency  | $199/mo | Up to 30  |
| Scale   | $299/mo | Unlimited |

---

## Deployment

**Repo:** https://github.com/coreyAI-source/ReptonDIgital  
**Branch:** `main`  
**Domain:** reptondigital.com.au  
Push to `main` → Vercel auto-deploys.

---

## Rules for Claude

1. Always keep this as a single static site — no frameworks, no build step, no backend
2. Update this CLAUDE.md whenever the project purpose, structure, or stack changes
3. Never hardcode API keys or secrets in any file
4. Keep the mobile-first approach — test responsive behaviour for all changes
5. The waitlist form has no backend — it only shows a confirmation state on submit
