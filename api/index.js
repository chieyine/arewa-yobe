export default async function handler(req, res) {
    if (req.headers["x-forwarded-url"]) {
      req.url = req.headers["x-forwarded-url"];
    } else if (req.headers["x-matched-path"]) {
      req.url = req.headers["x-matched-path"];
    }
    const { ensureDatabaseReady } = await import("../src/auto-migrate.mjs");
    await ensureDatabaseReady();
    const { handleRequest } = await import("../src/server.mjs");
    return await handleRequest(req, res);
  } catch (err) {
    console.error("Vercel Serverless Execution Error:", err);
    res.writeHead(500, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    return res.end(
      JSON.stringify({
        ok: false,
        error: {
          code: "SERVER_EXECUTION_ERROR",
          message: err.message,
          env: {
            hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
            hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
            hasDatabaseUrlUnpooled: Boolean(process.env.DATABASE_URL_UNPOOLED),
            appMode: process.env.APP_MODE || "evaluation",
          },
        },
      }),
    );
  }
}
