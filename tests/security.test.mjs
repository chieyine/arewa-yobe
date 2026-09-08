import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { fixture, payload } from "./support.mjs";
let f, a, b, admin, meal, limited, report;
before(async () => {
  f = await fixture();
  a = await f.login("focal.bade01@arewa-demo.invalid");
  b = await f.login("focal.bade02@arewa-demo.invalid");
  admin = await f.login("ADMIN");
  meal = await f.login("MEAL");
  limited = await f.login("meal.support@arewa-demo.invalid");
  report = (
    await f.query(a, "select civic.submit_report($1) as d", [payload()])
  ).rows[0].d.report;
});
after(async () => {
  await f?.close();
});
test("DB01: anonymous operational reads are empty and mutations fail", async () => {
  assert.equal(
    (await f.query(null, "select * from civic.reports")).rowCount,
    0,
  );
  await assert.rejects(
    f.query(null, "select civic.submit_report($1)", [payload()]),
    /AUTH_REQUIRED/,
  );
});
test("DB02: another focal person cannot read report, revision, item or evidence", async () => {
  assert.equal(
    (await f.query(b, "select * from civic.reports where id=$1", [report.id]))
      .rowCount,
    0,
  );
  assert.equal(
    (
      await f.query(b, "select * from civic.revisions where report_id=$1", [
        report.id,
      ])
    ).rowCount,
    0,
  );
  assert.equal(
    (await f.query(b, "select * from civic.items where id=$1", [report.itemId]))
      .rowCount,
    0,
  );
});
test("DB03: workspace boundary does not follow an ADMIN label", async () => {
  await f.db.query(
    "update civic.memberships set workspace_id='workspace-b' where user_id=$1",
    [b.id],
  );
  assert.equal((await f.query(b, "select * from civic.reports")).rowCount, 0);
  await f.db.query(
    "update civic.memberships set workspace_id='ws-evaluation' where user_id=$1",
    [b.id],
  );
});
test("DB04: unassigned LGA cannot be submitted; scoped MEAL cannot read out-of-scope reports", async () => {
  await assert.rejects(
    f.query(a, "select civic.submit_report($1)", [
      { ...payload(), lgaId: "lga-17" },
    ]),
    /ASSIGNMENT_REQUIRED/,
  );
  assert.equal(
    (
      await f.query(
        limited,
        "select r.* from civic.reports r join civic.items i on i.id=r.item_id where i.lga_id='lga-17'",
      )
    ).rowCount,
    0,
  );
});
test("DB05/21: deactivated membership is denied with an existing token", async () => {
  await f.query(admin, "select civic.manage_user($1,$2,null)", [
    b.id,
    { active: false },
  ]);
  await assert.rejects(f.query(b, "select civic.profile()"), /AUTH_REQUIRED/);
  assert.equal((await f.query(b, "select * from civic.reports")).rowCount, 0);
  await f.query(admin, "select civic.manage_user($1,$2,null)", [
    b.id,
    { active: true },
  ]);
});
test("DB06/07: forged role context and direct workflow writes do not bypass database permissions", async () => {
  await assert.rejects(
    f.query(
      a,
      "update civic.reports set data=jsonb_set(data,'{reviewState}','\"APPROVED\"') where id=$1",
      [report.id],
    ),
    /permission denied/,
  );
  await assert.rejects(
    f.query(a, "update civic.memberships set role='ADMIN' where user_id=$1", [
      a.id,
    ]),
    /permission denied/,
  );
  await assert.rejects(
    f.query(a, "delete from civic.audit"),
    /permission denied/,
  );
  await assert.rejects(
    f.query(a, "select civic.log_event($1,$2,$3)", ["FAKE", report.id, {}]),
    /permission denied/,
  );
});
test("DB08/09: direct workflow invocation rejects self-review", async () => {
  const own = (
    await f.query(admin, "select civic.submit_report($1) as d", [payload()])
  ).rows[0].d.report;
  await assert.rejects(
    f.query(admin, "select civic.review_report($1,$2)", [
      own.id,
      {
        state: "IN_REVIEW",
        revisionId: own.currentRevisionId,
        version: own.version,
        reason: "Test review",
      },
    ]),
    /SELF_REVIEW/,
  );
});
test("DB10/11: MEAL cannot approve; stale decisions fail", async () => {
  let r = (
    await f.query(meal, "select civic.review_report($1,$2) as d", [
      report.id,
      {
        state: "IN_REVIEW",
        revisionId: report.currentRevisionId,
        version: 1,
        reason: "Begin evaluation review",
      },
    ])
  ).rows[0].d;
  await assert.rejects(
    f.query(meal, "select civic.review_report($1,$2)", [
      r.id,
      {
        state: "VERIFIED",
        revisionId: r.currentRevisionId,
        version: 1,
        reason: "Stale concurrent review",
      },
    ]),
    /VERSION_CONFLICT/,
  );
  r = (
    await f.query(meal, "select civic.review_report($1,$2) as d", [
      r.id,
      {
        state: "VERIFIED",
        revisionId: r.currentRevisionId,
        version: r.version,
        reason: "Test verification evidence checked",
      },
    ])
  ).rows[0].d;
  await assert.rejects(
    f.query(meal, "select civic.review_report($1,$2)", [
      r.id,
      {
        state: "APPROVED",
        revisionId: r.currentRevisionId,
        version: r.version,
        reason: "Not permitted",
      },
    ]),
    /ADMIN_REQUIRED/,
  );
});
test("DB12/13: concurrent repeated submits return one report; different payload fails", async () => {
  const b = payload();
  const results = await Promise.all([
    f.query(a, "select civic.submit_report($1) as d", [b]),
    f.query(a, "select civic.submit_report($1) as d", [b]),
  ]);
  assert.equal(results[0].rows[0].d.report.id, results[1].rows[0].d.report.id);
  await assert.rejects(
    f.query(a, "select civic.submit_report($1)", [
      { ...b, title: "DEMO — Changed content after sending" },
    ]),
    /IDEMPOTENCY_CONFLICT/,
  );
  await f.query(admin, "select civic.manage_user($1,$2,null)", [
    a.id,
    { lgaIds: [] },
  ]);
  await assert.rejects(
    f.query(a, "select civic.submit_report($1)", [b]),
    /ASSIGNMENT_REQUIRED/,
  );
  await f.query(admin, "select civic.manage_user($1,$2,null)", [
    a.id,
    { lgaIds: ["lga-1"] },
  ]);
});
test("DB14: failed evidence dependency rolls back new report, item and audit together", async () => {
  const counts = async () =>
    (
      await f.db.query(
        "select (select count(*) from civic.items) i,(select count(*) from civic.reports) r,(select count(*) from civic.audit) a",
      )
    ).rows[0];
  const before = await counts();
  await assert.rejects(
    f.query(a, "select civic.submit_report($1)", [
      { ...payload(), evidenceIds: ["missing-photo"] },
    ]),
    /EVIDENCE_NOT_READY/,
  );
  assert.deepEqual(await counts(), before);
});
test("DB15: internal notes are absent from direct author reads", async () => {
  await f.query(meal, "select civic.add_message($1,$2)", [
    report.id,
    { text: "PRIVATE REVIEWER NOTE", visibility: "INTERNAL" },
  ]);
  assert.equal(
    (
      await f.query(
        a,
        "select * from civic.messages where report_id=$1 and data->>'text'='PRIVATE REVIEWER NOTE'",
        [report.id],
      )
    ).rowCount,
    0,
  );
  assert.equal(
    (
      await f.query(
        meal,
        "select * from civic.messages where report_id=$1 and data->>'text'='PRIVATE REVIEWER NOTE'",
        [report.id],
      )
    ).rowCount,
    1,
  );
});
test("DB16/22: ordinary database role cannot claim evidence is decoded or mutate immutable revisions", async () => {
  await assert.rejects(
    f.query(a, "select civic.register_evidence($1,$2)", [
      "fake",
      { state: "READY" },
    ]),
    /permission denied/,
  );
  await assert.rejects(
    f.query(a, "update civic.revisions set data=$1 where id=$2", [
      {},
      report.currentRevisionId,
    ]),
    /permission denied/,
  );
  await assert.rejects(
    f.db.query("update civic.revisions set data=data where id=$1", [
      report.currentRevisionId,
    ]),
    /IMMUTABLE_RECORD/,
  );
});
test("DB23: final active administrator cannot be deactivated", async () => {
  const other = f.credentials.find(
    (u) => u.role === "ADMIN" && u.id !== admin.id,
  );
  await f.query(admin, "select civic.manage_user($1,$2,null)", [
    other.id,
    { active: false },
  ]);
  await assert.rejects(
    f.query(admin, "select civic.manage_user($1,$2,null)", [
      admin.id,
      { active: false },
    ]),
    /LAST_ADMIN/,
  );
  await f.query(admin, "select civic.manage_user($1,$2,null)", [
    other.id,
    { active: true },
  ]);
});

test("new aggregate function and population still enforce direct database scope", async () => {
  const small = (await f.query(a, "select civic.dashboard($1) as d", [{}]))
    .rows[0].d;
  const other = (
    await f.query(a, "select civic.dashboard($1) as d", [{ lga: "lga-17" }])
  ).rows[0].d;
  assert.ok(small.counts.reportsSubmitted > 0);
  assert.equal(other.counts.reportsSubmitted, 0);
  assert.equal(
    (
      await f.query(
        limited,
        'select * from civic.report_population(\'{"lga":"lga-17"}\')',
      )
    ).rowCount,
    0,
  );
  await assert.rejects(
    f.query(null, "select civic.dashboard($1)", [{}]),
    /AUTH_REQUIRED/,
  );
});
