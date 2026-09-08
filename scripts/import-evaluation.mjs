import pg from "pg";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { connection } from "../src/db.mjs";
if (
  process.env.APP_MODE === "production" ||
  process.env.ALLOW_DEMO_SEED !== "true"
)
  throw Error(
    "Set APP_MODE=evaluation and ALLOW_DEMO_SEED=true for this local-only import.",
  );
if (process.env.PGHOST && !process.env.PGHOST.startsWith("/"))
  throw Error("Import requires the private local Unix socket.");
const c = new pg.Client(connection("arewa_owner"));
await c.connect();
try {
  if (
    Number((await c.query("select count(*) from civic.accounts")).rows[0].count)
  ) {
    console.log("Existing PostgreSQL accounts preserved; import not repeated.");
    process.exitCode = 0;
  } else {
    const sq = new DatabaseSync("data/arewa.sqlite", { readOnly: true });
    const d = JSON.parse(
      sq.prepare("select payload from app_state where id=1").get().payload,
    );
    sq.close();
    const creds = JSON.parse(
      fs.readFileSync(".secrets/demo-credentials.json"),
    ).credentials;
    await c.query("BEGIN");
    for (const u of d.users) {
      const p = creds.find((x) => x.email === u.email)?.password;
      if (!p)
        throw Error(
          "Private password unavailable for an existing account. Import halted without changes.",
        );
      await c.query(
        "insert into civic.accounts values($1,$2,crypt($3,gen_salt('bf',10)),$4)",
        [u.id, u.email, p, u.displayName],
      );
      await c.query("insert into civic.memberships values($1,$2,$3,$4,$5)", [
        u.id,
        "ws-evaluation",
        u.role,
        u.active,
        u.lgaIds,
      ]);
    }
    for (const [kind, rows] of [
      ["lga", d.lgas],
      ["sector", d.sectors],
    ])
      for (const v of rows)
        await c.query("insert into civic.reference_data values($1,$2,$3)", [
          v.id,
          kind,
          v,
        ]);
    for (const i of d.items) {
      i.title = i.title.replace(
        "[object Object]",
        d.lgas.find((l) => l.id === i.lgaId)?.name || "",
      );
      await c.query("insert into civic.items values($1,$2,$3)", [
        i.id,
        "ws-evaluation",
        i,
      ]);
    }
    for (const r of d.reports)
      await c.query("insert into civic.reports values($1,$2,$3)", [
        r.id,
        "ws-evaluation",
        r,
      ]);
    for (const v of d.revisions)
      await c.query("insert into civic.revisions values($1,$2,$3)", [
        v.id,
        v.reportId,
        v,
      ]);
    for (const e of d.reviewEvents)
      await c.query("insert into civic.review_events values($1,$2,$3,$4)", [
        e.id,
        e.reportId,
        e.revisionId,
        e,
      ]);
    for (const m of d.messages)
      await c.query("insert into civic.messages values($1,$2,$3)", [
        m.id,
        m.reportId,
        m,
      ]);
    for (const a of d.audit)
      await c.query("insert into civic.audit values($1,$2,$3)", [
        a.id,
        "ws-evaluation",
        a,
      ]);
    for (const a of d.followups)
      await c.query("insert into civic.actions values($1,$2,$3)", [
        a.id,
        a.itemId,
        a,
      ]);
    // Legacy files were never safely decoded. Preserve them in the old database, but never mark them ready in the new store.
    await c.query("COMMIT");
    console.log(
      `Imported ${d.users.length} accounts, ${d.items.length} items, ${d.reports.length} reports and their histories. Original SQLite remains untouched.`,
    );
  }
} catch (e) {
  await c.query("ROLLBACK");
  throw e;
} finally {
  await c.end();
}
