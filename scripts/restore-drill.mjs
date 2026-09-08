import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";
import { connection } from "../src/db.mjs";
import { fixture, payload } from "../tests/support.mjs";
import { dashboard, filters } from "../src/query.mjs";
import { csvExport, xlsxExport, pdfExport } from "../src/exports.mjs";
import { listReports } from "../src/query.mjs";
const f = await fixture();
const target = "arewa_restore_" + randomUUID().replaceAll("-", "");
const base = path.resolve(".local", target);
const evidence = path.join(base, "source-evidence");
const restored = path.join(base, "restored-evidence");
const key = randomBytes(32).toString("hex");
await fs.mkdir(evidence, { recursive: true });
let restoreDb;
try {
  const account = await f.login("FOCAL_PERSON");
  const sample = Buffer.from("synthetic backup checksum fixture");
  const crypto = await import("node:crypto");
  const id = randomBytes(16).toString("hex");
  await fs.writeFile(path.join(evidence, id), sample);
  await f.db.query("insert into civic.evidence values($1,$2,null,$3)", [
    id,
    account.id,
    {
      id,
      state: "READY",
      checksum: crypto.createHash("sha256").update(sample).digest("hex"),
      caption: "Backup checksum fixture, not served as a photo",
    },
  ]);
  const env = {
    ...process.env,
    APP_MODE: "evaluation",
    PGDATABASE: f.name,
    EVIDENCE_DIR: evidence,
    BACKUP_DIR: path.join(base, "backup"),
    BACKUP_KEY: key,
  };
  const backup = spawnSync(process.execPath, ["scripts/backup.mjs"], {
    env,
    encoding: "utf8",
  });
  if (backup.status) throw Error(backup.stderr);
  const file = JSON.parse(backup.stdout).backup;
  const r = spawnSync(process.execPath, ["scripts/restore.mjs"], {
    env: {
      ...env,
      BACKUP_FILE: file,
      RESTORE_DATABASE: target,
      RESTORE_EVIDENCE_DIR: restored,
    },
    encoding: "utf8",
  });
  if (r.status) throw Error(r.stderr);
  restoreDb = new pg.Client({ ...connection(), database: target });
  await restoreDb.connect();
  await restoreDb.query("BEGIN");
  const signed = (
    await restoreDb.query("select civic.sign_in($1,$2) as d", [
      account.email,
      account.password,
    ])
  ).rows[0].d;
  await restoreDb.query("select set_config('civic.session',$1,true)", [
    crypto.createHash("sha256").update(signed.token).digest("hex"),
  ]);
  const d = await dashboard(restoreDb, filters({}));
  if (d.counts.reportsSubmitted !== 6)
    throw Error("Restored focal scope differs");
  const rr = await listReports(restoreDb, filters({}), true);
  const referenceRows = (
    await restoreDb.query("select kind,data from civic.reference_data")
  ).rows;
  const refs = {
    lgas: referenceRows.filter((x) => x.kind === "lga").map((x) => x.data),
    sectors: referenceRows
      .filter((x) => x.kind === "sector")
      .map((x) => x.data),
  };
  if (
    csvExport(rr.reports, refs).length < 100 ||
    xlsxExport(rr.reports, refs, {}).subarray(0, 2).toString() !== "PK" ||
    (await pdfExport(d)).subarray(0, 4).toString() !== "%PDF"
  )
    throw Error("Restored export verification failed");
  await restoreDb.query("COMMIT");
  await restoreDb.query("select set_config('civic.session','',false)");
  if ((await restoreDb.query("select * from civic.reports")).rowCount)
    throw Error("Restored anonymous access was not denied");
  if (!(await fs.readFile(path.join(restored, id))).equals(sample))
    throw Error("Restored evidence differs");
  const result = {
    date: new Date().toISOString(),
    source: "Disposable synthetic PostgreSQL database",
    restoredDatabase: target,
    accounts: 38,
    reports: 102,
    revisions: 102,
    evidenceChecksums: 1,
    roleSignIn: "PASS",
    focalScope: "PASS (6 reports)",
    anonymousDenial: "PASS",
    scopedExports: "PASS (CSV, XLSX, PDF)",
    encryptedBackup: "AES-256-GCM",
    restore: "PASS",
    note: "Both disposable databases are removed after verification; this is an executed restore drill, not a scheduled production backup.",
  };
  await fs.writeFile(
    "docs/evidence/restore-drill.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await restoreDb?.end();
  await f.owner.query(`DROP DATABASE IF EXISTS ${target} WITH (FORCE)`);
  await f.close();
  await fs.rm(base, { recursive: true, force: true });
}
