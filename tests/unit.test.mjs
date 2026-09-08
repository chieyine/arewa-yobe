import test from "node:test";
import assert from "node:assert/strict";
import { csvCell } from "../src/exports.mjs";
import { filters } from "../src/query.mjs";
test("CSV neutralises hostile formula prefixes after whitespace and controls", () => {
  for (const s of [
    '=HYPERLINK("evil")',
    " +SUM(1,2)",
    "\t@SUM(1,2)",
    "\r-1",
    "\n=1",
  ])
    assert.ok(csvCell(s).startsWith("\"'"));
  assert.equal(csvCell('A "quote", here'), '"A ""quote"", here"');
});
test("pagination is bounded and date basis is explicit", () => {
  assert.equal(filters({ pageSize: 9000 }).pageSize, 100);
  assert.equal(filters({ page: -5 }).page, 1);
  assert.equal(filters({}).dateBasis, "FIRST_SUBMITTED");
  assert.throws(
    () => filters({ from: "2026-09-08", to: "2026-09-01" }),
    /FILTER_INVALID/,
  );
});
test("calendar filters reject impossible dates instead of normalizing them", () => {
  for (const from of ["2026-02-30", "2026-99-08", "not-a-date"])
    assert.throws(() => filters({ from }), /FILTER_INVALID/);
  assert.equal(filters({ from: "2024-02-29" }).from, "2024-02-29");
});

test("reset tooling refuses production and non-allowlisted targets", async () => {
  const { spawnSync } = await import("node:child_process");
  for (const env of [
    {
      APP_MODE: "production",
      ALLOW_DEMO_RESET: "true",
      PGDATABASE: "postgres",
    },
    {
      APP_MODE: "evaluation",
      ALLOW_DEMO_RESET: "true",
      PGDATABASE: "production",
    },
  ]) {
    const r = spawnSync(process.execPath, ["scripts/reset-demo.mjs"], {
      env: { ...process.env, ...env },
      encoding: "utf8",
    });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /Reset refused/);
  }
});
