import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["/", "/websites", "/ai-automation", "/software", "/work", "/contact", "/privacy"];
const MOCK_WEBHOOK = "http://127.0.0.1:4010";

/** Shape of what the mock webhook recorded: the payload sent by the site. */
interface WebhookRecord {
  lead?: { projectDescription?: string; utm?: Record<string, string>; website?: unknown };
}
/** The form rejects submissions faster than 2.5 seconds (automated-fill protection). */
const HUMAN_FILL_PAUSE_MS = 2800;

/** Records analytics calls. Entries are the arguments of each gtag or fbq call. */
async function gaEvents(page: Page): Promise<unknown[][]> {
  return page.evaluate(() => {
    const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
    return layer.map((entry) => Array.from(entry as ArrayLike<unknown>));
  });
}

async function metaCalls(page: Page): Promise<unknown[][]> {
  return page.evaluate(() => {
    const fbq = (window as unknown as { fbq?: { queue?: unknown[] } }).fbq;
    return (fbq?.queue ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
  });
}

async function fillEnquiry(page: Page, description: string) {
  await page.waitForTimeout(HUMAN_FILL_PAUSE_MS);
  await page.getByLabel("Full name").fill("Alex Example");
  await page.getByLabel(/^Email/).fill("alex@example.com");
  await page.getByLabel("Tell us about your project").fill(description);
  await page.getByLabel(/I agree that Repton Digital may contact me/).check();
}

test.beforeEach(async ({ page }) => {
  // Keep third-party trackers offline so the queued analytics calls can be inspected.
  await page.route(/googletagmanager\.com|connect\.facebook\.net|challenges\.cloudflare\.com/, (route) =>
    route.abort(),
  );
});

test.describe("layout and navigation", () => {
  for (const path of ROUTES) {
    test(`${path} has one H1 and no horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1").first()).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("every page has its own title", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of ROUTES) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(ROUTES.length);
  });

  test("desktop navigation reaches the work page", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation only");
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
  });

  test("mobile menu opens, navigates and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile menu only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Software" }).click();
    await expect(page).toHaveURL(/\/software$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  });
});

test.describe("Black Friday banner", () => {
  test("shows until the end of 30 November 2026 in Perth time", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-27T10:00:00+08:00"));
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Black Friday offer" })).toBeVisible();

    await page.clock.setFixedTime(new Date("2026-12-01T10:00:00+08:00"));
    await page.reload();
    await expect(page.getByRole("region", { name: "Black Friday offer" })).toHaveCount(0);
  });
});

test.describe("enquiry form", () => {
  test("shows field errors, moves focus to the first one and sends nothing", async ({ page }) => {
    const sent: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/enquiry")) sent.push(request.url());
    });

    await page.goto("/contact");
    await page.getByRole("button", { name: "Send my enquiry" }).click();

    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeFocused();
    expect(sent).toHaveLength(0);
  });

  test("a confirmed enquiry keeps UTM values and service, and records a lead only after success", async ({
    page,
  }) => {
    const marker = `E2E-${Date.now()}`;
    await page.goto("/?utm_source=google&utm_medium=cpc&utm_campaign=bf-test&utm_content=ad-a");
    await expect.poll(async () => (await gaEvents(page)).some((e) => e[1] === "page_view")).toBe(true);

    // UTM values must survive moving to another page.
    await page.getByRole("link", { name: "Get a Quote" }).first().click();
    await expect(page).toHaveURL(/\/contact$/);

    await page.getByLabel("Service").selectOption("websites");
    await expect
      .poll(async () => (await gaEvents(page)).some((e) => e[1] === "service_selected"))
      .toBe(true);

    await fillEnquiry(page, `A website for our plumbing business. ${marker}`);

    const [sent] = await Promise.all([
      page.waitForRequest((request) => request.url().includes("/api/enquiry") && request.method() === "POST"),
      page.getByRole("button", { name: "Send my enquiry" }).click(),
    ]);
    const response = await sent.response();
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("status")).toContainText("Thanks, Alex.");

    const payload = sent.postDataJSON() as { service: string; utm: Record<string, string> };
    expect(payload.service).toBe("websites");
    expect(payload.utm).toMatchObject({ source: "google", medium: "cpc", campaign: "bf-test", content: "ad-a" });

    const events = await gaEvents(page);
    expect(events.some((e) => e[1] === "generate_lead")).toBe(true);
    expect((await metaCalls(page)).some((e) => e[0] === "track" && e[1] === "Lead")).toBe(true);

    // The webhook received the same lead, with campaign details and without anti-spam fields.
    // Other tests submit in parallel, so find this test's lead by its unique marker.
    const findLead = async (): Promise<WebhookRecord | undefined> => {
      const leads = (await (await fetch(`${MOCK_WEBHOOK}/leads`)).json()) as WebhookRecord[];
      return leads.find((record) => record.lead?.projectDescription?.includes(marker));
    };
    await expect.poll(async () => (await findLead()) !== undefined).toBe(true);
    const received = await findLead();
    expect(received?.lead?.utm).toMatchObject({ campaign: "bf-test" });
    expect(received?.lead).not.toHaveProperty("website");
  });

  test("a failed enquiry shows the error and records no conversion", async ({ page }) => {
    await page.route("**/api/enquiry", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          code: "NOT_CONFIGURED",
          message: "Online enquiries are not connected yet, so your message was not sent.",
        }),
      }),
    );

    await page.goto("/websites#enquiry");
    await expect(page.getByLabel("Service")).toHaveValue("websites");

    await fillEnquiry(page, "A website for our plumbing business, sent while the service is offline.");
    await page.getByRole("button", { name: "Send my enquiry" }).click();

    const formAlert = page.getByRole("form", { name: "Website enquiry form" }).getByRole("alert");
    await expect(formAlert).toContainText("was not sent");
    const events = await gaEvents(page);
    expect(events.some((e) => e[1] === "generate_lead")).toBe(false);
    expect((await metaCalls(page)).some((e) => e[0] === "track" && e[1] === "Lead")).toBe(false);
  });

  test("the service pages preselect their service", async ({ page }) => {
    await page.goto("/software#enquiry");
    await expect(page.getByLabel("Service")).toHaveValue("software");
  });
});

test.describe("analytics", () => {
  test("a page view is recorded for each route visited", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Work" }).first().click();
    await expect(page).toHaveURL(/\/work$/);
    await expect
      .poll(async () => (await gaEvents(page)).filter((e) => e[1] === "page_view").length)
      .toBeGreaterThanOrEqual(2);
    expect((await metaCalls(page)).filter((e) => e[0] === "track" && e[1] === "PageView").length).toBeGreaterThanOrEqual(2);
  });
});

test.describe("accessibility", () => {
  test("home and contact have no serious or critical WCAG A/AA violations", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop accessibility scan only");
    for (const path of ["/", "/contact"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${path}: ${v.id}`)).toEqual([]);
    }
  });
});
