import { chromium } from "playwright";
import fs from "node:fs/promises";
const accounts = JSON.parse(
  await fs.readFile(".secrets/demo-credentials.json", "utf8"),
).credentials;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
async function signIn(role) {
  await page.goto("http://localhost:3107/");
  const c = accounts.find((x) => x.role === role);
  await page.getByLabel("Email address", { exact: true }).fill(c.email);
  await page.getByLabel("Password", { exact: true }).fill(c.password);
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await page.locator("#main h1").waitFor();
}
async function capture(route, name) {
  await page.goto("http://localhost:3107/#" + route);
  await page.locator("#main h1").waitFor();
  await page.waitForTimeout(750);
  await page.screenshot({
    path: "docs/evidence/complete-" + name + "-desktop.png",
  });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: "docs/evidence/complete-" + name + "-mobile.png",
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  results.push({ route, overflow });
  await page.setViewportSize({ width: 1440, height: 960 });
}
await signIn("ADMIN");
await page.setViewportSize({ width: 360, height: 800 });
await page.getByLabel("Open workspace navigation", { exact: true }).click();
await page
  .getByRole("navigation", { name: "All workspace pages" })
  .getByRole("link", { name: "People & access" })
  .click();
await page.getByRole("heading", { name: "People & access" }).waitFor();
await page.setViewportSize({ width: 1440, height: 960 });

const ids = await page.evaluate(async () => {
  const r = await (await fetch("/api/reports?pageSize=1")).json();
  const i = await (await fetch("/api/items")).json();
  return { report: r.data.reports[0].id, item: i.data.items[0].id };
});
for (const [route, name] of [
  ["/monitoring", "dashboard"],
  ["/monitoring/reports", "reports"],
  ["/monitoring/reports/" + ids.report, "review"],
  ["/monitoring/items", "items"],
  ["/monitoring/items/" + ids.item, "item-detail"],
  ["/admin/users", "people"],
  ["/admin/reference-data", "sectors"],
  ["/admin/audit", "audit"],
  ["/notifications", "inbox"],
  ["/help", "handbook"],
])
  await capture(route, name);
await page.getByRole("button", { name: "Sign out", exact: true }).click();
await page.getByRole("heading", { name: "Sign in" }).waitFor();
await signIn("FOCAL_PERSON");
for (const [route, name] of [
  ["/field", "field"],
  ["/field/reports", "my-reports"],
  ["/field/drafts", "drafts"],
  ["/field/reports/new", "compose"],
])
  await capture(route, name);
await fs.writeFile(
  "docs/evidence/complete-design-check.json",
  JSON.stringify({ date: new Date().toISOString(), results, errors }, null, 2),
);
await browser.close();
if (errors.length || results.some((x) => x.overflow))
  throw Error("Design check failed: " + JSON.stringify({ errors, results }));
console.log(
  "PASS: 14 workspace views at desktop and 360px; no page errors or horizontal overflow.",
);
