import pg from "pg";
import { connection } from "../src/db.mjs";
const target = process.env.PGDATABASE;
if (
  process.env.APP_MODE !== "evaluation" ||
  process.env.ALLOW_DEMO_RESET !== "true" ||
  !/^arewa_disposable_[a-z0-9_]+$/.test(target || "") ||
  process.env.CONFIRM_RESET_DATABASE !== target ||
  !connection().host.startsWith("/")
)
  throw Error(
    "Reset refused: only an explicitly confirmed arewa_disposable_* local evaluation database is allowlisted.",
  );
const c = new pg.Client(connection("arewa_owner"));
await c.connect();
try {
  await c.query("DROP SCHEMA IF EXISTS civic CASCADE");
  console.log(
    "The explicitly named disposable schema was reset. Reapply migrations and seed intentionally.",
  );
} finally {
  await c.end();
}
