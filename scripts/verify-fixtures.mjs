import pg from "pg";
import { connection } from "../src/db.mjs";
const c = new pg.Client(connection("arewa_owner"));
await c.connect();
try {
  const counts = (
    await c.query(
      "select (select count(*)::int from civic.reference_data where kind='lga') lgas,(select count(*)::int from civic.memberships where role='FOCAL_PERSON') focal_persons,(select count(*)::int from civic.items) items,(select count(*)::int from civic.reports) reports,(select count(*)::int from civic.revisions) revisions",
    )
  ).rows[0];
  if (counts.lgas !== 17 || counts.focal_persons !== 34)
    throw Error(
      "Reference and focal-person cardinalities differ from evaluation contract",
    );
  const future = (
    await c.query(
      "select count(*)::int as n from civic.revisions where (data->>'observedDate')::date>'2026-09-08'::date",
    )
  ).rows[0].n;
  console.log(
    JSON.stringify(
      {
        counts,
        referenceChecks: "passed",
        legacyFutureObservationDates: future,
        note: "Existing imported reports are preserved, so item/report totals may exceed the fresh fixture baseline of 34/102.",
      },
      null,
      2,
    ),
  );
} finally {
  await c.end();
}
