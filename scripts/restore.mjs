import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createDecipheriv, createHash } from "node:crypto";
import pg from "pg";
import { connection } from "../src/db.mjs";
const target = process.env.RESTORE_DATABASE,
  source = process.env.BACKUP_FILE,
  key = process.env.BACKUP_KEY,
  output =
    process.env.RESTORE_EVIDENCE_DIR &&
    path.resolve(process.env.RESTORE_EVIDENCE_DIR);
if (
  process.env.APP_MODE !== "evaluation" ||
  !/^arewa_restore_[a-z0-9_]+$/.test(target || "") ||
  !source ||
  !key ||
  !output ||
  !connection().host.startsWith("/")
)
  throw Error(
    "Restore requires APP_MODE=evaluation, a new arewa_restore_* local database, BACKUP_FILE, BACKUP_KEY, and a separate RESTORE_EVIDENCE_DIR.",
  );
try {
  await fs.access(output);
  throw Error(
    "Restore evidence directory already exists; choose a new disposable target.",
  );
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const bytes = await fs.readFile(source);
if (bytes.subarray(0, 6).toString() !== "AREWA1")
  throw Error("Unsupported backup format");
const decipher = createDecipheriv(
  "aes-256-gcm",
  Buffer.from(key, "hex"),
  bytes.subarray(6, 18),
);
decipher.setAuthTag(bytes.subarray(18, 34));
const content = JSON.parse(
  Buffer.concat([
    decipher.update(bytes.subarray(34)),
    decipher.final(),
  ]).toString(),
);
const owner = new pg.Client(connection("arewa_owner"));
await owner.connect();
let db;
try {
  if (
    (await owner.query("select 1 from pg_database where datname=$1", [target]))
      .rowCount
  )
    throw Error("Restore refuses to overwrite an existing database.");
  await owner.query(`CREATE DATABASE ${target}`);
  const result = spawnSync(
    path.join(
      process.env.PG_BIN || "/usr/local/opt/postgresql@18/bin",
      "pg_restore",
    ),
    [
      "-h",
      connection().host,
      "-p",
      String(connection().port),
      "-U",
      "arewa_owner",
      "-d",
      target,
      "--no-owner",
      "--no-acl",
      "--exit-on-error",
    ],
    {
      input: Buffer.from(content.database, "base64"),
      maxBuffer: 128 * 1024 * 1024,
    },
  );
  if (result.status)
    throw Error("Restore failed: " + result.stderr.toString().slice(0, 400));
  db = new pg.Client({ ...connection("arewa_owner"), database: target });
  await db.connect();
  // pg_dump --no-acl deliberately excludes environment credentials; reapply the reviewed application grants.
  await db.query(
    "GRANT USAGE ON SCHEMA civic TO arewa_app,arewa_processor; GRANT SELECT ON civic.memberships,civic.reference_data,civic.items,civic.reports,civic.revisions,civic.evidence,civic.revision_evidence,civic.messages,civic.review_events,civic.actions,civic.audit,civic.notifications TO arewa_app; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA civic TO arewa_app; REVOKE ALL ON ALL FUNCTIONS IN SCHEMA civic FROM PUBLIC; REVOKE EXECUTE ON FUNCTION civic.notify_response(),civic.immutable(),civic.log_event(text,text,jsonb),civic.assert_payload(jsonb),civic.register_evidence(text,jsonb) FROM arewa_app; GRANT EXECUTE ON FUNCTION civic.register_evidence(text,jsonb) TO arewa_processor;",
  );
  await fs.mkdir(output, { recursive: true, mode: 0o700 });
  for (const e of content.evidence) {
    if (!/^[a-f0-9]{32}$/.test(e.id))
      throw Error("Invalid evidence identifier in backup");
    const b = Buffer.from(e.base64, "base64");
    if (createHash("sha256").update(b).digest("hex") !== e.checksum)
      throw Error("Checksum mismatch");
    await fs.writeFile(path.join(output, e.id), b, { mode: 0o600 });
  }
  const counts = (
    await db.query(
      "select (select count(*)::int from civic.reports) reports,(select count(*)::int from civic.revisions) revisions,(select count(*)::int from civic.accounts) accounts",
    )
  ).rows[0];
  if (JSON.stringify(counts) !== JSON.stringify(content.counts))
    throw Error("Restored cardinalities do not match");
  console.log(
    JSON.stringify({
      database: target,
      evidenceDirectory: output,
      counts,
      evidenceFiles: content.evidence.length,
      result:
        "Restored and checksums verified. Run role sign-in and scoped export smoke checks before using this target.",
    }),
  );
} finally {
  await db?.end();
  await owner.end();
}
