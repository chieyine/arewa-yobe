import { handleRequest } from "../server.mjs";
import { ensureDatabaseReady } from "../src/auto-migrate.mjs";

export default async function handler(req, res) {
  try {
    await ensureDatabaseReady();
  } catch (err) {
    console.error("Database initialization error:", err);
    res.writeHead(500, {
      "content-type": "application/json; charset=utf-8",
      "x-initialization-error": "true",
    });
    return res.end(
      JSON.stringify({
        ok: false,
        error: {
          code: "DATABASE_INITIALIZATION_ERROR",
          message: err.message,
          hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        },
      }),
    );
  }
  return handleRequest(req, res);
}
