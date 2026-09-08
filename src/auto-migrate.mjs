import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "./db.mjs";
import { seed } from "../scripts/seed-demo.mjs";

let readyPromise = null;

export async function ensureDatabaseReady() {
  if (readyPromise) return readyPromise;
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) return;

  readyPromise = (async () => {
    try {
      const c = await pool.connect();
      try {
        const reg = await c.query(
          "select to_regclass('civic.schema_migrations') as t",
        );
        if (!reg.rows[0]?.t) {
          console.log("Empty Neon database detected. Applying base schema...");
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
          "008_evidence_blobs.sql",
        ]) {
          const version = file.replace(".sql", "");
          const res = await c.query(
            "select 1 from civic.schema_migrations where version=$1",
            [version],
          );
          if (!res.rowCount) {
            await c.query("BEGIN");
            await c.query(await fs.readFile(path.join("db", file), "utf8"));
            await c.query("COMMIT");
          }
        }
        if (process.env.APP_MODE === "evaluation") {
          const accCount = (
            await c.query("select count(*) from civic.accounts")
          ).rows[0]?.count;
          if (Number(accCount) === 0) {
            console.log("Seeding demo evaluation data into Neon database...");
            await seed(c, null);
          }
        }
      } finally {
        c.release();
      }
    } catch (err) {
      console.error("Auto-migration notice:", err.message);
    }
  })();
  return readyPromise;
}
