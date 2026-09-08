import pg from "pg";
import fs from "node:fs";
export let localEvaluation = {};
try {
  localEvaluation = JSON.parse(
    fs.readFileSync(".local/active-evaluation.json", "utf8"),
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
import path from "node:path";
import { createHash } from "node:crypto";
export const connection = (user = "arewa_app") => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (dbUrl) {
    return {
      connectionString: dbUrl,
      ssl:
        process.env.PGSSLMODE === "disable"
          ? false
          : { rejectUnauthorized: false },
      max: Number(process.env.PGMAXCONNECTIONS || 5),
    };
  }
  return {
    host: process.env.PGHOST || path.resolve(".local/socket"),
    port: Number(process.env.PGPORT || 55439),
    database: process.env.PGDATABASE || localEvaluation.database || "postgres",
    user,
    password:
      user === "arewa_owner"
        ? process.env.PGOWNER_PASSWORD
        : user === "arewa_processor"
          ? process.env.PGPROCESSOR_PASSWORD
          : process.env.PGPASSWORD,
    max: 10,
  };
};
export const pool = new pg.Pool(connection());
export const processorPool = new pg.Pool(connection("arewa_processor"));
for (const connections of [pool, processorPool])
  connections.on("error", (error) =>
    console.error(
      "Idle database connection interrupted:",
      error.code || "UNKNOWN",
    ),
  );
export async function processEvidence(token, id, data, buffer) {
  const c = await processorPool.connect();
  try {
    await c.query("BEGIN");
    await c.query("select set_config('civic.session',$1,true)", [
      digest(token),
    ]);
    const result = await rpc(c, "register_evidence", [id, data]);
    if (buffer) {
      await c.query(
        "INSERT INTO civic.evidence_blobs (id, content, mime_type) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content",
        [id, buffer, data.mimeType || "image/jpeg"],
      );
    }
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export const digest = (s) =>
  createHash("sha256")
    .update(s || "")
    .digest("hex");
export async function withDb(token, fn) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query("select set_config('civic.session',$1,true)", [
      digest(token),
    ]);
    const result = await fn(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export const rpc = async (c, name, args = []) => {
  if (!/^[a-z_]+$/.test(name)) throw Error("Invalid function");
  return (
    await c.query(
      `select civic.${name}(${args.map((_, i) => "$" + (i + 1)).join(",")}) as result`,
      args,
    )
  ).rows[0]?.result;
};
