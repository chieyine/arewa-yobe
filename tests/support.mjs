import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { connection } from "../src/db.mjs";
import { seed } from "../scripts/seed-demo.mjs";
export async function fixture() {
  const name = "arewa_test_" + randomUUID().replaceAll("-", "");
  const owner = new pg.Client(connection("arewa_owner"));
  await owner.connect();
  await owner.query(`CREATE DATABASE ${name}`);
  const db = new pg.Client({ ...connection("arewa_owner"), database: name });
  await db.connect();
  for (const file of [
    "001_core.sql",
    "002_processing.sql",
    "003_boundaries.sql",
    "004_workflow_details.sql",
    "005_scoped_queries.sql",
    "006_aggregate_memory.sql",
    "007_trend_aggregation.sql",
  ])
    await db.query(await fs.readFile("db/" + file, "utf8"));
  const secrets = path.resolve(".local", name + ".json");
  await seed(db, secrets);
  const credentials = JSON.parse(
    await fs.readFile(secrets, "utf8"),
  ).credentials;
  const login = async (roleOrEmail) => {
    const user =
      credentials.find((c) => c.email === roleOrEmail) ||
      credentials.find((c) => c.role === roleOrEmail);
    const c = new pg.Client({ ...connection(), database: name });
    await c.connect();
    const result = (
      await c.query("select civic.sign_in($1,$2) as d", [
        user.email,
        user.password,
      ])
    ).rows[0].d;
    await c.end();
    return { ...user, token: result.token };
  };
  const query = async (user, sql, params = [], role = "arewa_app") => {
    const c = new pg.Client({ ...connection(role), database: name });
    await c.connect();
    try {
      await c.query("BEGIN");
      await c.query("select set_config('civic.session',$1,true)", [
        createHash("sha256")
          .update(user?.token || "")
          .digest("hex"),
      ]);
      const result = await c.query(sql, params);
      await c.query("COMMIT");
      return result;
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      await c.end();
    }
  };
  return {
    name,
    db,
    owner,
    credentials,
    login,
    query,
    async close() {
      await db.end();
      await owner.query(`DROP DATABASE ${name} WITH (FORCE)`);
      await owner.end();
      await fs.unlink(secrets);
    },
  };
}
export const payload = () => ({
  clientRecordId: randomUUID(),
  itemType: "PUBLIC_PROJECT",
  title: "DEMO — Independent test school roof",
  lgaId: "lga-1",
  sectorId: "sector-2",
  community: "Demo community",
  observationDate: "2026-09-08",
  observedProgress: "IN_PROGRESS",
  observation:
    "Synthetic test observation documenting work visible during this fictional site visit.",
  evidenceIds: [],
});
