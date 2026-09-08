export function filters(q) {
  const f = Object.fromEntries(
    q instanceof URLSearchParams ? q : Object.entries(q || {}),
  );
  if ((f.search || "").length > 80)
    throw Object.assign(Error("FILTER_INVALID"), { status: 422 });
  for (const key of ["from", "to"])
    if (
      f[key] &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(f[key]) ||
        !Number.isFinite(Date.parse(f[key] + "T12:00:00Z")) ||
        new Date(f[key] + "T12:00:00Z").toISOString().slice(0, 10) !== f[key])
    )
      throw Error("FILTER_INVALID");
  if (f.from && f.to && f.from > f.to) throw Error("FILTER_INVALID");
  return {
    search: f.search || "",
    lga: f.lga || "",
    sector: f.sector || "",
    state: f.state || "",
    itemType: f.itemType || "",
    progress: f.progress || "",
    dateBasis: f.dateBasis === "OBSERVED" ? "OBSERVED" : "FIRST_SUBMITTED",
    from: f.from || "",
    to: f.to || "",
    page: Math.max(1, Math.floor(Number(f.page) || 1)),
    pageSize: Math.min(100, Math.max(1, Math.floor(Number(f.pageSize) || 20))),
  };
}
const projection = `r.data || jsonb_build_object('item',i.data,'revision',v.data,'evidenceCount',(select count(*) from civic.revision_evidence re where re.revision_id=v.id))`;
export async function listReports(c, f, all = false) {
  const total = Number(
    (await c.query("select count(*) from civic.report_population($1)", [f]))
      .rows[0].count,
  );
  if (all && total > 20000) throw Error("EXPORT_LIMIT");
  const result = await c.query(
    `select p.report || jsonb_build_object('item',p.item,'revision',p.revision,'evidenceCount',(select count(*) from civic.revision_evidence where revision_id=p.revision->>'id')) as data from civic.report_population($1) p order by p.report->>'firstSubmittedAt' desc,p.id ${all ? "" : `limit ${f.pageSize} offset ${(f.page - 1) * f.pageSize}`}`,
    [f],
  );
  return {
    reports: result.rows.map((x) => x.data),
    total,
    page: f.page,
    pageSize: f.pageSize,
  };
}
export async function reportDetail(c, id) {
  const row = (
    await c.query(
      `SELECT ${projection} as data FROM civic.reports r JOIN civic.items i ON i.id=r.item_id JOIN civic.revisions v ON v.id=r.data->>'currentRevisionId' WHERE r.id=$1`,
      [id],
    )
  ).rows[0];
  if (!row) throw Error("NOT_FOUND");
  const r = row.data;
  for (const [field, sql, params] of [
    [
      "messages",
      "select data from civic.messages where report_id=$1 order by data->>'createdAt'",
      [id],
    ],
    [
      "history",
      "select data from civic.review_events where report_id=$1 order by data->>'createdAt'",
      [id],
    ],
    [
      "revisions",
      "select data from civic.revisions where report_id=$1 order by (data->>'revisionNumber')::int",
      [id],
    ],
    [
      "evidence",
      "select e.data from civic.evidence e join civic.revision_evidence re on re.evidence_id=e.id where re.revision_id=$1",
      [r.currentRevisionId],
    ],
  ])
    r[field] = (await c.query(sql, params)).rows.map((x) => x.data);
  return r;
}
export async function dashboard(c, f) {
  return (await c.query("select civic.dashboard($1) as data", [f])).rows[0]
    .data;
}
