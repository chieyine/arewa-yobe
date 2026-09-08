import pg from "pg";
import fs from "node:fs/promises";
import { connection } from "../src/db.mjs";
if (
  process.env.PGHOST &&
  !process.env.PGHOST.startsWith("/") &&
  !["localhost", "127.0.0.1"].includes(process.env.PGHOST) &&
  !(
    process.env.PGHOST === "database" &&
    process.env.PGDATABASE === "arewa_eval" &&
    process.env.ALLOW_COMPOSE_EVALUATION === "true"
  )
)
  throw Error(
    "Remote migrations require a separate approved deployment procedure.",
  );
const c = new pg.Client(connection(process.env.PGOWNER || "arewa_owner"));
await c.connect();
try {
  const exists = (
    await c.query("select to_regclass('civic.schema_migrations') as t")
  ).rows[0].t;
  if (!exists) {
    await c.query("BEGIN");
    await c.query(await fs.readFile("db/001_core.sql", "utf8"));
    await c.query("COMMIT");
  }
  for (const file of [
    "002_processing.sql",
    "003_boundaries.sql",
    "004_workflow_details.sql",
    "005_scoped_queries.sql",
    "006_aggregate_memory.sql",
    "007_trend_aggregation.sql",
  ]) {
    const version = file.replace(".sql", "");
    if (
      !(
        await c.query(
          "select 1 from civic.schema_migrations where version=$1",
          [version],
        )
      ).rowCount
    ) {
      await c.query("BEGIN");
      await c.query(await fs.readFile("db/" + file, "utf8"));
      await c.query("COMMIT");
    }
  }
  for (const [role, password] of [
    ["arewa_app", process.env.PGPASSWORD],
    ["arewa_processor", process.env.PGPROCESSOR_PASSWORD],
  ]) {
    if (password) {
      const stmt = (
        await c.query(
          "select format('ALTER ROLE %I PASSWORD %L',$1::text,$2::text) as sql",
          [role, password],
        )
      ).rows[0].sql;
      await c.query(stmt);
    }
  }
  console.log("PostgreSQL migrations applied.");
} finally {
  await c.end();
}
