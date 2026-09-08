import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
await page.goto("http://localhost:3107");
await page.getByRole("heading", { name: "Sign in" }).waitFor();
await page.waitForTimeout(1800);
await page.screenshot({
  path: "docs/evidence/sign-in-mobile.png",
  fullPage: true,
});
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw Error("Mobile login overflow");
await page.setViewportSize({ width: 1440, height: 1000 });
await page.mouse.move(700, 350);
await page.waitForTimeout(700);
const tilt = await page
  .locator(".terrain-stage")
  .evaluate((el) => getComputedStyle(el).transform);
if (tilt === "none") throw Error("Pointer depth missing");
if (await page.locator("#motionToggle").count())
  throw Error("Pause control remains");
const loops = await page
  .locator(".terrain-svg")
  .evaluate((el) => getComputedStyle(el).animationIterationCount);
if (loops === "infinite") throw Error("Unbounded artwork animation");
await page.emulateMedia({ reducedMotion: "reduce" });
const reduced = await page
  .locator(".terrain-stage")
  .evaluate((el) => getComputedStyle(el).transform);
if (reduced !== "none") throw Error("Reduced motion not honored");
console.log(
  "PASS: mobile sign-in width, pointer depth, finite animation and reduced-motion fallback",
);
await browser.close();
