import { chromium } from "playwright";
import fs from "node:fs/promises";
const c = JSON.parse(
  await fs.readFile(".secrets/demo-credentials.json", "utf8"),
).credentials.find((c) => c.role === "ADMIN");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 360, height: 800 } });
await p.goto("http://localhost:3107");
await p.getByLabel("Email address", { exact: true }).fill(c.email);
await p.getByLabel("Password", { exact: true }).fill(c.password);
await p.getByRole("button", { name: "Sign in to workspace" }).click();
await p.getByRole("heading", { name: "A clearer picture of Yobe." }).waitFor();
console.log(
  await p.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .map((e) => ({
        tag: e.tagName,
        cls: e.className,
        w: e.getBoundingClientRect().width,
        right: e.getBoundingClientRect().right,
      }))
      .filter((e) => e.right > innerWidth + 1)
      .slice(0, 20),
  ),
);
await b.close();
