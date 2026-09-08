import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createCipheriv, randomBytes, createHash } from "node:crypto";
import pg from "pg";
import { connection } from "../src/db.mjs";
const target = process.env.BACKUP_DIR && path.resolve(process.env.BACKUP_DIR),
  key = process.env.BACKUP_KEY;
if (!target || !key || !/^[a-f0-9]{64}$/i.test(key))
  throw Error(
    "Set BACKUP_DIR and a private 32-byte BACKUP_KEY as 64 hexadecimal characters.",
  );
const evidence = path.resolve(process.env.EVIDENCE_DIR || "data/evidence-v2");
if (
  target === evidence ||
  target.startsWith(evidence + path.sep) ||
  target === path.resolve(".local/postgres")
)
  throw Error("Backup must use a separate directory.");
await fs.mkdir(target, { recursive: true, mode: 0o700 });
const filename = path.join(
  target,
  "arewa-" + new Date().toISOString().replaceAll(":", "-") + ".backup",
);
const c = new pg.Client(connection("arewa_owner"));
await c.connect();
let temp;
try {
  await c.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
  const snapshot = (await c.query("select pg_export_snapshot() as id")).rows[0]
    .id;
  const count = (
    await c.query(
      "select (select count(*)::int from civic.reports) reports,(select count(*)::int from civic.revisions) revisions,(select count(*)::int from civic.accounts) accounts",
    )
  ).rows[0];
  const ready = (
    await c.query(
      "select id,data from civic.evidence where data->>'state'='READY'",
    )
  ).rows;
  const dump = spawnSync(
    path.join(
      process.env.PG_BIN || "/usr/local/opt/postgresql@18/bin",
      "pg_dump",
    ),
    [
      "-h",
      connection().host,
      "-p",
      String(connection().port),
      "-U",
      "arewa_owner",
      "-d",
      connection().database,
      "--no-owner",
      "--no-acl",
      "-Fc",
      "--snapshot=" + snapshot,
    ],
    {
      maxBuffer: 128 * 1024 * 1024,
      env: { ...process.env, PGPASSWORD: process.env.PGOWNER_PASSWORD || "" },
    },
  );
  if (dump.status)
    throw Error(
      "Database dump failed: " + dump.stderr.toString().slice(0, 300),
    );
  const files = [];
  for (const row of ready) {
    const bytes = await fs.readFile(path.join(evidence, row.id));
    const checksum = createHash("sha256").update(bytes).digest("hex");
    if (checksum !== row.data.checksum)
      throw Error("Evidence checksum mismatch for " + row.id);
    files.push({ id: row.id, checksum, base64: bytes.toString("base64") });
  }
  const content = Buffer.from(
    JSON.stringify({
      version: 1,
      createdAt: new Date().toISOString(),
      counts: count,
      database: dump.stdout.toString("base64"),
      evidence: files,
      notice:
        "Private evaluation backup includes auth recovery material. Protect this file and its key separately.",
    }),
  );
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
  await fs.writeFile(
    filename,
    Buffer.concat([Buffer.from("AREWA1"), iv, cipher.getAuthTag(), encrypted]),
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    JSON.stringify({
      backup: filename,
      counts: count,
      evidenceFiles: files.length,
      encrypted: true,
    }),
  );
} finally {
  await c.query("ROLLBACK");
  await c.end();
}
