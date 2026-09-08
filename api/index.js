export default async function handler(req, res) {
  try {
    const incoming =
      req.query?._vercel_url ||
      new URL(req.url, "http://localhost").searchParams.get("_vercel_url") ||
      (req.headers["x-forwarded-url"] &&
      !req.headers["x-forwarded-url"].startsWith("/api/index")
        ? req.headers["x-forwarded-url"]
        : null);

    if (incoming) {
      req.url = incoming;
    }

    if (req.url.includes("test-route")) {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(
        JSON.stringify({
          status: "ok",
          incoming,
          reqUrl: req.url,
          query: req.query,
          headers: {
            "x-matched-path": req.headers["x-matched-path"],
            "x-forwarded-url": req.headers["x-forwarded-url"],
          },
        }),
      );
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
        },
      }),
    );
  }
}
