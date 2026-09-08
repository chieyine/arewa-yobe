import { chromium } from "playwright";
import fs from "node:fs/promises";
const credentials = JSON.parse(
  await fs.readFile(".secrets/demo-credentials.json", "utf8"),
).credentials;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3107");
await page.getByRole("heading", { name: "Sign in" }).waitFor();
await page.waitForTimeout(1800);
await page.screenshot({
  path: "docs/evidence/sign-in-desktop.png",
  fullPage: true,
});
const admin = credentials.find((c) => c.role === "ADMIN");
await page.getByLabel("Email address", { exact: true }).fill(admin.email);
await page.getByLabel("Password", { exact: true }).fill(admin.password);
await page.getByRole("button", { name: "Sign in to workspace" }).click();
await page.getByRole("heading", { name: "Monitoring overview" }).waitFor();
await page.screenshot({
  path: "docs/evidence/dashboard-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 360, height: 800 });
await page.screenshot({
  path: "docs/evidence/dashboard-mobile.png",
  fullPage: true,
});
console.log("Browser errors:", errors);
console.log(
  "Mobile page overflow:",
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
);
await browser.close();
