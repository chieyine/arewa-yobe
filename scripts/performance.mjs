import { fixture } from "../tests/support.mjs";
import { withDb, connection } from "../src/db.mjs";
import { dashboard, filters } from "../src/query.mjs";
import pg from "pg";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const f = await fixture();
let pool;
try {
  const admin = await f.login("ADMIN");
  const i = (await f.db.query("select id,data from civic.items limit 1"))
    .rows[0];
  const author = (
    await f.db.query(
      "select user_id from civic.memberships where role='FOCAL_PERSON' and 'lga-1'=ANY(lga_ids) limit 1",
    )
  ).rows[0].user_id;
  await f.db.query(
    `INSERT INTO civic.reports(id,workspace_id,data) SELECT 'perf-report-'||n,'ws-evaluation',jsonb_build_object('id','perf-report-'||n,'reference','PERF-'||n,'itemId',$1::text,'authorId',$2::text,'reviewState','SUBMITTED','currentRevisionId','perf-revision-'||n,'firstSubmittedAt','2026-09-08T08:00:00Z','lastSubmittedAt','2026-09-08T08:00:00Z','version',1) FROM generate_series(1,9898) n`,
    [i.id, author],
  );
  await f.db.query(
    `INSERT INTO civic.revisions SELECT 'perf-revision-'||n,'perf-report-'||n,jsonb_build_object('id','perf-revision-'||n,'revisionNumber',1,'observedDate','2026-09-08','observation','Fictional scale fixture, not a real observation.','observedProgress','IN_PROGRESS') FROM generate_series(1,9898) n`,
  );
  await f.db.query("ANALYZE civic.reports; ANALYZE civic.revisions;");
  pool = new pg.Pool({ ...connection(), database: f.name, max: 20 });
  pool.on("error", (error) => {
    if (error.code !== "57P01")
      console.error("Performance connection error:", error.code);
  });
  const times = [];
  const run = async () => {
    const start = performance.now(),
      c = await pool.connect();
    try {
      await c.query("BEGIN");
      await c.query("select set_config('civic.session',$1,true)", [
        createHash("sha256").update(admin.token).digest("hex"),
      ]);
      const d = await dashboard(c, filters({}));
      if (d.counts.reportsSubmitted !== 10000) throw Error("Bad aggregate");
      await c.query("COMMIT");
      times.push(performance.now() - start);
    } finally {
      c.release();
    }
  };
  await Promise.all(Array.from({ length: 20 }, run));
  times.sort((a, b) => a - b);
  const result = {
    date: new Date().toISOString(),
    profile:
      "Local PostgreSQL 18.6, Node 24.11.0; 10,000 report records; 20 concurrent complete dashboard queries; no network shaping",
    samples: 20,
    p50Ms: Math.round(times[9]),
    p95Ms: Math.round(times[18]),
    maxMs: Math.round(times[19]),
    targetP95Ms: 1000,
    note: "Includes connection checkout and all dashboard aggregate queries. This is a local load result, not a hosted latency measurement.",
  };
  await fs.writeFile(
    "docs/evidence/performance.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await pool?.end();
  await f.close();
}
