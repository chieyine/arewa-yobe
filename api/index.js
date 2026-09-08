export default async function handler(req, res) {
  try {
    const parsedUrl = new URL(req.url, "http://localhost");
    const incomingPath = parsedUrl.searchParams.get("_vercel_url");
    if (incomingPath) {
      parsedUrl.searchParams.delete("_vercel_url");
      const qs = parsedUrl.searchParams.toString();
      req.url = incomingPath + (qs ? `?${qs}` : "");
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
