export default async function handler(req, res) {
  try {
    const { ensureDatabaseReady } = await import("../../src/auto-migrate.mjs");
    await ensureDatabaseReady();
    const { handleRequest } = await import("../../src/server.mjs");
    return await handleRequest(req, res);
  } catch (err) {
    console.error("Vercel Evidence Execution Error:", err);
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
