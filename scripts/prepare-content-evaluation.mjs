import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { connection, localEvaluation } from "../src/db.mjs";
import { seed } from "./seed-demo.mjs";
if (
  process.env.APP_MODE !== "evaluation" ||
  process.env.ALLOW_DEMO_SEED !== "true" ||
  !connection().host.startsWith("/")
)
  throw Error("Requires authorized local evaluation");
const previous = connection().database;
const name = "arewa_content_" + randomUUID().replaceAll("-", "");
const secretDir = path.resolve(".secrets", name);
const existing = JSON.parse(
  await fs.readFile(
    path.join(localEvaluation.secretDir || ".secrets", "demo-credentials.json"),
    "utf8",
  ),
).credentials;
const owner = new pg.Client(connection("arewa_owner"));
await owner.connect();
let c;
try {
  await owner.query("CREATE DATABASE " + name);
  c = new pg.Client({ ...connection("arewa_owner"), database: name });
  await c.connect();
  for (const file of [
    "001_core.sql",
    "002_processing.sql",
    "003_boundaries.sql",
    "004_workflow_details.sql",
    "005_scoped_queries.sql",
    "006_aggregate_memory.sql",
    "007_trend_aggregation.sql",
  ])
    await c.query(await fs.readFile("db/" + file, "utf8"));
  await seed(
    c,
    path.join(secretDir, "demo-credentials.json"),
    "2026-09-08",
    existing,
  );
  const counts = (
    await c.query(
      "select (select count(*) from civic.items)::int items,(select count(*) from civic.reports)::int reports,(select count(*) from civic.accounts)::int accounts",
    )
  ).rows[0];
  if (counts.items !== 34 || counts.reports !== 102 || counts.accounts !== 38)
    throw Error("Unexpected fixture counts");
  const placeholder = (
    await c.query(
      "select count(*)::int n from civic.revisions where data->>'observation' ~* 'fictional|synthetic|test scenario'",
    )
  ).rows[0].n;
  if (placeholder) throw Error("Placeholder report text remains");
  await fs.writeFile(
    ".local/active-evaluation.json",
    JSON.stringify(
      {
        database: name,
        secretDir,
        previousDatabase: previous,
        preparedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  await fs.writeFile(
    "docs/evidence/content-dataset-check.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        ...counts,
        placeholderObservations: placeholder,
        previousDatabasePreserved: previous,
        activeDatabase: name,
        note: "Fresh illustrative scenarios; previous reports/revisions were not altered. Shared account emails and passwords retained; account IDs are fresh.",
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      ...counts,
      placeholderObservations: placeholder,
      previousDatabasePreserved: previous,
      activeDatabase: name,
    }),
  );
} finally {
  await c?.end();
  await owner.end();
}
