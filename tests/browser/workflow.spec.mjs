import { test, expect, chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const credentials = async () =>
  JSON.parse(await fs.readFile(".local/browser-fixture.json", "utf8"))
    .credentials;
async function login(page, roleOrEmail, opt = false) {
  const cs = await credentials(),
    c =
      cs.find((c) => c.email === roleOrEmail) ||
      cs.find((c) => c.role === roleOrEmail);
  await page.goto("/");
  await page.getByLabel("Email address", { exact: true }).fill(c.email);
  await page.getByLabel("Password", { exact: true }).fill(c.password);
  if (opt)
    await page
      .getByLabel("Prepare offline drafts on this private device")
      .check();
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page.locator("main h1")).toBeVisible();
  return c;
}
async function newReport(page, title, photo = false) {
  await page.goto("/#/field/reports/new");
  await page.getByLabel("Short title", { exact: true }).fill(title);
  await page.getByLabel("Sector", { exact: true }).selectOption("sector-2");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page.getByLabel("Community", { exact: true }).fill("Demo community");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page
    .getByLabel("What did you see?", { exact: true })
    .fill(
      "This is a fictional browser test observation of the school roof repair and visible progress.",
    );
  if (photo) {
    const buffer = await sharp({
      create: { width: 120, height: 80, channels: 3, background: "#aac785" },
    })
      .png()
      .toBuffer();
    await page.getByLabel("Choose photographs").setInputFiles({
      name: "synthetic-test.png",
      mimeType: "image/png",
      buffer,
    });
    await expect(page.getByAltText("Selected photograph 1")).toBeVisible();
    await page
      .getByLabel("Caption 1")
      .fill("Synthetic illustration used only for evaluation");
  }
  await page.getByRole("button", { name: "Continue", exact: false }).click();
}
async function decision(page, state) {
  await page.getByLabel("Decision", { exact: true }).selectOption(state);
  await page
    .getByLabel("Reason / clarification question")
    .fill("Test review: please preserve this revision-specific explanation.");
  await page
    .getByRole("button", { name: "Save decision", exact: true })
    .click();
  await page.waitForLoadState("networkidle");
}
test("full browser journey: photograph, clarification, verification, approval, follow-up", async ({
  browser,
}) => {
  const field = await browser.newPage(),
    meal = await browser.newPage(),
    admin = await browser.newPage();
  const errors = [];
  field.on("pageerror", (e) => errors.push(e.message));
  await login(field, "focal.bade01@arewa-demo.invalid", true);
  await newReport(field, "DEMO — Browser-tested school roof", true);
  await field
    .getByRole("button", { name: "Send report", exact: false })
    .click();
  await expect(
    field.getByText("Server reference:", { exact: false }),
  ).toBeVisible();
  const url = field.url();
  await expect(field.locator(".evidence-grid img")).toHaveCount(1);
  await field.reload();
  await expect(
    field.getByRole("heading", { name: "Browser-tested school roof" }),
  ).toBeVisible();
  await login(meal, "MEAL");
  await meal.goto(url);
  await decision(meal, "IN_REVIEW");
  await meal
    .getByLabel("Add a message", { exact: true })
    .fill("Reviewer-only note: not for the author.");
  await meal.getByLabel("Internal note · only the review team").check();
  await meal.getByRole("button", { name: "Add message", exact: true }).click();
  await expect(
    meal.getByText("Reviewer-only note: not for the author.", { exact: true }),
  ).toBeVisible();
  await decision(meal, "NEEDS_CLARIFICATION");
  await field.reload();
  await expect(
    field.getByText("Reviewer-only note: not for the author."),
  ).toHaveCount(0);
  await field
    .getByLabel("Updated observation")
    .fill(
      "The fictional school roof framing is visible and the report now clarifies the materials observed.",
    );
  await field
    .getByLabel("Your response to the reviewer")
    .fill("Added details on the visible framing.");
  await field.getByRole("button", { name: "Respond and resubmit" }).click();
  await expect(
    field.getByText("Revision 2", { exact: false }).first(),
  ).toBeVisible();
  await meal.reload();
  await decision(meal, "IN_REVIEW");
  await decision(meal, "VERIFIED");
  await login(admin, "ADMIN");
  await admin.goto(url);
  await decision(admin, "APPROVED");
  await admin
    .getByRole("link", { name: "View the item’s full history" })
    .click();
  await expect(
    admin.getByRole("heading", { name: "Not confirmed", exact: true }),
  ).toBeVisible();
  await admin
    .getByLabel("Confirmed progress", { exact: true })
    .selectOption("IN_PROGRESS");
  await admin
    .getByLabel("Reason", { exact: true })
    .fill("The approved report supports this fictional progress update.");
  await admin
    .getByRole("button", { name: "Confirm progress", exact: true })
    .click();
  await expect(
    admin.getByRole("heading", { name: "In progress", exact: true }),
  ).toBeVisible();
  const itemUrl = admin.url();
  await field.goto(itemUrl);
  await field.getByRole("button", { name: "Add a follow-up visit" }).click();
  await field.getByRole("button", { name: "Continue", exact: false }).click();
  await field.getByRole("button", { name: "Continue", exact: false }).click();
  await field
    .getByLabel("What did you see?", { exact: true })
    .fill(
      "A later fictional visit found the same roof project continuing with further visible progress.",
    );
  await field.getByRole("button", { name: "Continue", exact: false }).click();
  await field
    .getByRole("button", { name: "Send report", exact: false })
    .click();
  await expect(
    field.getByText("Server reference:", { exact: false }),
  ).toBeVisible();
  await admin.goto(itemUrl);
  await admin.reload();
  await expect(admin.getByText("2 report(s) in your scope")).toBeVisible();
  expect(errors).toEqual([]);
  await Promise.all([field.close(), meal.close(), admin.close()]);
});
test("offline draft survives browser restart, opens for editing and explicitly sends", async () => {
  const userDataDir = path.resolve(
    ".local/browser-offline-profile-" + Date.now(),
  );
  let context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    baseURL: "http://localhost:3193",
    viewport: { width: 360, height: 800 },
  });
  let page = await context.newPage();
  await login(page, "focal.bade02@arewa-demo.invalid", true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await newReport(page, "DEMO — Restart-safe offline observation");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByText("Saved on this device. Not yet sent."),
  ).toBeVisible();
  await context.close();
  context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    baseURL: "http://localhost:3193",
    viewport: { width: 360, height: 800 },
  });
  await context.setOffline(true);
  page = await context.newPage();
  await page.goto("/#/field/drafts");
  await expect(
    page.getByRole("heading", {
      name: "DEMO — Restart-safe offline observation",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue editing" }).click();
  await expect(page.getByLabel("Short title", { exact: true })).toHaveValue(
    "DEMO — Restart-safe offline observation",
  );
  await page.goto("/#/field/drafts");
  await page
    .getByRole("button", { name: "Send when connected", exact: true })
    .click();
  await expect(
    page.getByText("Waiting to send", { exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No unsent drafts" }),
  ).toBeVisible({ timeout: 20000 });
  const caches = await page.evaluate(async () => {
    const rows = [];
    for (const key of await window.caches.keys()) {
      const cache = await window.caches.open(key);
      rows.push(...(await cache.keys()).map((r) => r.url));
    }
    return rows;
  });
  expect(
    caches.some((p) => p.includes("/api/") || p.includes("/evidence/")),
  ).toBe(false);
  await context.close();
  await fs.rm(userDataDir, { recursive: true, force: true });
});
test("accessibility and no page overflow on principal desktop and 360px mobile screens", async ({
  page,
}) => {
  await page.goto("/");
  let result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await login(page, "ADMIN");
  const initialUrl = page.url();
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  expect(page.url()).toBe(initialUrl);
  for (const route of ["/monitoring", "/monitoring/reports", "/admin/users"]) {
    await page.goto("/#" + route);
    await expect(page.locator("main h1")).toBeVisible();
    result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await page.setViewportSize({ width: 360, height: 800 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `docs/evidence/${route.replaceAll("/", "-").slice(1)}-360.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await login(page, "focal.bade02@arewa-demo.invalid");
  await page.goto("/#/field/reports/new");
  await page.setViewportSize({ width: 360, height: 800 });
  result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/evidence/report-form-360.png",
    fullPage: true,
  });
});

test("lost submit response retries without a duplicate report", async ({
  page,
}) => {
  await login(page, "focal.bade02@arewa-demo.invalid", true);
  await newReport(page, "DEMO — Lost-response retry check");
  let committedId,
    intercepted = false;
  await page.route("**/api/reports", async (route) => {
    if (route.request().method() === "POST" && !intercepted) {
      intercepted = true;
      const response = await route.fetch();
      const json = await response.json();
      committedId = json.data.report.id;
      await route.abort("failed");
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Send report", exact: false }).click();
  await expect(page.locator("#formError")).toContainText("Your draft is saved");
  await page.goto("/#/field/drafts");
  await page.getByRole("button", { name: "Try sending", exact: true }).click();
  await expect(
    page.getByText("Server reference:", { exact: false }),
  ).toBeVisible();
  expect(page.url()).toContain(committedId);
  const count = await page.evaluate(async () => {
    const r = await fetch("/api/reports?search=Lost-response%20retry%20check");
    return (await r.json()).data.total;
  });
  expect(count).toBe(1);
});

test("expired-session drafts stay with their author across account changes", async ({
  page,
  context,
}) => {
  await login(page, "focal.bade01@arewa-demo.invalid", true);
  await newReport(page, "DEMO — Account-private unsent draft");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByText("Saved on this device. Not yet sent."),
  ).toBeVisible();
  await context.clearCookies();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await login(page, "focal.bade02@arewa-demo.invalid");
  await page.goto("/#/field/drafts");
  await expect(
    page.getByText("DEMO — Account-private unsent draft", { exact: true }),
  ).toHaveCount(0);
  const offlineContext = await page.evaluate(async () => {
    const module = await import("/offline.js");
    return module.prepared();
  });
  expect(offlineContext).toBeNull();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await login(page, "focal.bade01@arewa-demo.invalid", true);
  await page.goto("/#/field/drafts");
  await expect(
    page.getByRole("heading", { name: "DEMO — Account-private unsent draft" }),
  ).toBeVisible();
});
