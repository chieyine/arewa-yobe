import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import {
  withDb,
  rpc,
  pool,
  processEvidence,
  processorPool,
  localEvaluation,
} from "./db.mjs";
import { filters, listReports, reportDetail, dashboard } from "./query.mjs";
import { csvExport, xlsxExport, pdfExport } from "./exports.mjs";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const publicDir = path.join(root, "public");
const evidenceDir = path.resolve(
  process.env.EVIDENCE_DIR || path.join(root, "data/evidence-v2"),
);
const secretDir = path.resolve(
  process.env.SECRET_DIR || localEvaluation.secretDir || path.join(root, ".secrets"),
);
async function loadDemoCredentials() {
  if (process.env.DEMO_CREDENTIALS_JSON) {
    try {
      const parsed = JSON.parse(process.env.DEMO_CREDENTIALS_JSON);
      return Array.isArray(parsed) ? parsed : parsed.credentials || [];
    } catch {}
  }
  try {
    return (
      JSON.parse(
        await fs.readFile(path.join(secretDir, "demo-credentials.json"), "utf8"),
      ).credentials || []
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return [];
  }
}
const mode = process.env.APP_MODE || "evaluation";
if (!["development", "evaluation", "staging", "production"].includes(mode))
  throw Error("Invalid APP_MODE");
const port = Number(process.env.PORT || 3000);
const notice =
  "Demonstration prepared by Kredit Technologies Limited for evaluation. All records are fictional. This is not an official RAWYOD deployment.";
const errors = {
  AUTH_REQUIRED: [
    401,
    "Sign in again to continue. Your local drafts are still saved.",
  ],
  INVALID_CREDENTIALS: [401, "Email or password not recognised."],
  FORBIDDEN: [403, "You do not have permission for this action."],
  NOT_FOUND: [404, "This record is not available to your account."],
  ASSIGNMENT_REQUIRED: [
    403,
    "This LGA is no longer assigned to your account. Your draft has been preserved.",
  ],
  SELF_REVIEW: [403, "You cannot review your own report."],
  ADMIN_REQUIRED: [403, "This action requires an administrator."],
  REVIEWER_REQUIRED: [403, "Only the review team can make this decision."],
  VERSION_CONFLICT: [
    409,
    "This record changed since you opened it. Your text is preserved; compare the latest revision before trying again.",
  ],
  IDEMPOTENCY_CONFLICT: [
    409,
    "This send reference already belongs to different content. Your draft is preserved.",
  ],
  INVALID_TRANSITION: [
    422,
    "That decision is not available for the current review state.",
  ],
  VALIDATION_ERROR: [
    422,
    "Check the required fields, dates, and text lengths.",
  ],
  FUTURE_DATE: [422, "The observation date cannot be in the future."],
  INVALID_PROGRESS: [
    422,
    "Choose a progress status appropriate for this item and provide a reason.",
  ],
  LAST_ADMIN: [409, "Keep at least one active administrator."],
  EVIDENCE_NOT_READY: [
    422,
    "A selected photo is not ready. Retry it or remove it before sending.",
  ],
  EVIDENCE_LIMIT: [422, "Attach no more than five photos."],
  APPROVED_SOURCE_REQUIRED: [422, "Choose an approved report for this item."],
  RECOVERY_INVALID: [
    422,
    "The recovery link is invalid, expired, or the password is shorter than 12 characters.",
  ],
  FILTER_INVALID: [422, "Check the search and date filters."],
  REASON_REQUIRED: [
    422,
    "Add a reason or question of at least three characters.",
  ],
  MESSAGE_REQUIRED: [422, "Write a message of up to 2,000 characters."],
  INVALID_USER: [422, "Enter a name, unique email address, and valid role."],
  INVALID_ASSIGNMENT: [422, "Choose valid LGA assignments."],
  EXPORT_LIMIT: [422, "Narrow your filters to 20,000 reports or fewer."],
  RESPOND_NOT_ALLOWED: [
    409,
    "This report is no longer awaiting clarification.",
  ],
  IDEMPOTENCY_REQUIRED: [422, "A stable send reference is required."],
  ITEM_MISMATCH: [
    422,
    "The item type, sector, and LGA must match the selected item.",
  ],
};
function send(res, status, data, headers = {}) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers,
  });
  res.end(
    JSON.stringify(
      status < 400 ? { ok: true, data } : { ok: false, error: data },
    ),
  );
}
async function body(req, limit = 30_000_000) {
  const parts = [];
  let length = 0;
  for await (const p of req) {
    length += p.length;
    if (length > limit)
      throw Object.assign(Error("BODY_TOO_LARGE"), { status: 413 });
    parts.push(p);
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString() || "{}");
  } catch {
    throw Object.assign(Error("INVALID_JSON"), { status: 400 });
  }
}
function cookie(req) {
  return (
    (req.headers.cookie || "").match(/(?:^|;\s*)session=([^;]+)/)?.[1] || ""
  );
}
const sessionCookie = (token, age = 28800) =>
  `session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${mode === "production" || mode === "staging" ? "; Secure" : ""}`;
const attempts = new Map();
function rate(req, path) {
  const ip = req.socket?.remoteAddress || req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || "127.0.0.1";
  const key = ip + ":" + path;
  const entry = attempts.get(key) || { n: 0, end: Date.now() + 60000 };
  if (entry.end < Date.now()) {
    entry.n = 0;
    entry.end = Date.now() + 60000;
  }
  entry.n++;
  attempts.set(key, entry);
  if (attempts.size > 10000)
    for (const [k, v] of attempts) if (v.end < Date.now()) attempts.delete(k);
  if (entry.n > (path.includes("auth") ? 20 : 180))
    throw Object.assign(Error("RATE_LIMIT"), { status: 429 });
}
async function refs(c) {
  const rows = (
    await c.query(
      "select kind,data from civic.reference_data order by data->>'name',data->>'label'",
    )
  ).rows;
  return {
    lgas: rows.filter((x) => x.kind === "lga").map((x) => x.data),
    sectors: rows.filter((x) => x.kind === "sector").map((x) => x.data),
  };
}
async function api(req, res, url) {
  try {
    const p = url.pathname;
    rate(req, p.startsWith("/api/auth") ? "auth" : cookie(req).slice(0, 10));
    if (
      !["GET", "HEAD"].includes(req.method) &&
      req.headers.origin &&
      req.headers.origin !== `http://${req.headers.host}` &&
      req.headers.origin !== `https://${req.headers.host}`
    )
      return send(res, 403, {
        code: "ORIGIN_REJECTED",
        message: "Refresh the application and try again.",
      });
    if (
      !["GET", "HEAD"].includes(req.method) &&
      !String(req.headers["content-type"]).startsWith("application/json")
    )
      return send(res, 415, {
        code: "JSON_REQUIRED",
        message: "Use a JSON request.",
      });
    if (p === "/api/health") {
      try {
        await pool.query("select 1");
        return send(res, 200, { status: "ok", database: "PostgreSQL", mode });
      } catch (err) {
        return send(res, 500, {
          status: "database_error",
          error: err.message,
          hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
          mode,
        });
      }
    }
    const localDemo =
      mode === "evaluation" &&
      ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
        req.socket?.remoteAddress || "",
      ) &&
      ["localhost", "127.0.0.1", "[::1]"].includes(
        new URL("http://" + req.headers.host).hostname,
      ) &&
      !req.headers.forwarded &&
      !req.headers["x-forwarded-for"] &&
      !req.headers["x-forwarded-host"];
    const demoAutofill =
      mode === "evaluation" &&
      (localDemo || process.env.ALLOW_PUBLIC_DEMO_LOGIN === "true");
    if (p === "/api/demo-password" && req.method === "POST") {
      if (!demoAutofill)
        return send(res, 403, {
          code: "FORBIDDEN",
          message: "Password autofill is not enabled for this environment.",
        });
      const input = await body(req, 1000);
      const entries = await loadDemoCredentials();
      const allowed = ["FOCAL_PERSON", "MEAL", "ADMIN"]
        .map((role) =>
          entries.find(
            (entry) =>
              entry.role === role &&
              entry.email?.endsWith("@arewa-demo.invalid"),
          ),
        )
        .filter(Boolean);
      const account = allowed.find((entry) => entry.email === input.email);
      if (!account)
        return send(res, 404, {
          code: "NOT_FOUND",
          message: "Demo account not found.",
        });
      return send(res, 200, { password: account.password });
    }
    if (p === "/api/demo-accounts" && req.method === "GET") {
      if (mode !== "evaluation") return send(res, 200, { accounts: [] });
      const entries = await loadDemoCredentials();
      const accounts = ["FOCAL_PERSON", "MEAL", "ADMIN"].flatMap((role) => {
        const entry = entries.find(
          (entry) =>
            entry.role === role &&
            typeof entry.email === "string" &&
            entry.email.endsWith("@arewa-demo.invalid"),
        );
        return entry ? [{ role, email: entry.email }] : [];
      });
      return send(res, 200, { accounts, passwordAutofill: demoAutofill });
    }
    if (p === "/api/auth/login" && req.method === "POST") {
      const b = await body(req, 10000);
      const result = await withDb("", (c) =>
        rpc(c, "sign_in", [
          String(b.email || "").slice(0, 254),
          String(b.password || "").slice(0, 128),
        ]),
      );
      return send(
        res,
        200,
        { user: result.user, notice },
        { "set-cookie": sessionCookie(result.token) },
      );
    }
    if (p === "/api/auth/logout" && req.method === "POST") {
      await withDb(cookie(req), (c) => rpc(c, "sign_out"));
      return send(
        res,
        200,
        { message: "Signed out." },
        { "set-cookie": sessionCookie("", 0) },
      );
    }
    if (p === "/api/auth/recovery/request" && req.method === "POST") {
      const b = await body(req, 10000);
      if (!["development", "evaluation"].includes(mode))
        return send(res, 503, {
          code: "RECOVERY_UNCONFIGURED",
          message: "Contact your workspace administrator for account recovery.",
        });
      const token = await withDb("", (c) =>
        rpc(c, "request_recovery", [String(b.email || "").slice(0, 254)]),
      );
      if (token) {
        try {
          await fs.mkdir(secretDir, { recursive: true, mode: 0o700 });
          await fs.writeFile(
            path.join(secretDir, "last-recovery-link.txt"),
            `http://localhost:${port}/#/reset?token=${token}\n`,
            { mode: 0o600 },
          );
        } catch {}
      }
      return send(res, 200, {
        message:
          "If the account exists, a private recovery link is available to the local evaluator administrator. No email was sent.",
      });
    }
    if (p === "/api/auth/recovery/reset" && req.method === "POST") {
      const b = await body(req, 10000);
      await withDb("", (c) => rpc(c, "reset_password", [b.token, b.password]));
      return send(res, 200, {
        message: "Password reset. Sign in with your new password.",
      });
    }
    const token = cookie(req);
    const result = await withDb(token, async (c) => {
      const user = await rpc(c, "profile");
      if (p === "/api/me")
        return {
          user,
          ...(await refs(c)),
          workspace: {
            id: user.workspaceId,
            name: "Yobe evaluation workspace",
            evaluation: mode === "evaluation",
            timezone: "Africa/Lagos",
          },
          notice,
        };
      if (p === "/api/dashboard")
        return dashboard(c, filters(url.searchParams));
      if (p === "/api/reports" && req.method === "GET")
        return listReports(c, filters(url.searchParams));
      if (p === "/api/reports" && req.method === "POST")
        return rpc(c, "submit_report", [await body(req)]);
      let m = p.match(/^\/api\/reports\/([^/]+)$/);
      if (m && req.method === "GET") return reportDetail(c, m[1]);
      m = p.match(/^\/api\/reports\/([^/]+)\/amendment-request$/);
      if (m && req.method === "POST") {
        const b = await body(req, 10000);
        await rpc(c, "request_amendment", [m[1], b.reason]);
        return {
          message:
            "Your amendment request was recorded. The existing revision remains unchanged.",
        };
      }
      m = p.match(/^\/api\/reports\/([^/]+)\/(review|respond|messages)$/);
      if (m && req.method === "POST") {
        const fn = {
          review: "review_report",
          respond: "respond_report",
          messages: "add_message",
        }[m[2]];
        return { report: await rpc(c, fn, [m[1], await body(req)]) };
      }
      if (p === "/api/items" && req.method === "GET") {
        const all = (
          await c.query("select data from civic.items order by data->>'title'")
        ).rows.map((x) => x.data);
        const f = filters(url.searchParams);
        return {
          items: all.filter(
            (i) =>
              (!f.lga || i.lgaId === f.lga) &&
              (!f.sector || i.sectorId === f.sector) &&
              (!f.progress || i.confirmedProgress === f.progress) &&
              (!f.itemType || i.type === f.itemType) &&
              (!f.search ||
                i.title.toLowerCase().includes(f.search.toLowerCase())),
          ),
        };
      }
      m = p.match(/^\/api\/items\/([^/]+)$/);
      if (m && req.method === "GET") {
        const i = (
          await c.query("select data from civic.items where id=$1", [m[1]])
        ).rows[0];
        if (!i) throw Error("NOT_FOUND");
        const ids = (
          await c.query(
            "select id from civic.reports where item_id=$1 order by data->>'firstSubmittedAt' desc",
            [m[1]],
          )
        ).rows;
        const reports = [];
        for (const r of ids) reports.push(await reportDetail(c, r.id));
        return {
          item: i.data,
          reports,
          actions: (
            await c.query(
              "select data from civic.actions where item_id=$1 order by data->>'createdAt' desc",
              [m[1]],
            )
          ).rows.map((x) => x.data),
        };
      }
      m = p.match(/^\/api\/items\/([^/]+)\/(progress|actions)$/);
      if (m && req.method === "POST")
        return {
          item: await rpc(
            c,
            m[2] === "progress" ? "confirm_progress" : "save_action",
            [m[1], await body(req)],
          ),
        };
      if (p === "/api/evidence" && req.method === "POST") {
        if (!["ADMIN", "FOCAL_PERSON"].includes(user.role))
          throw Error("FORBIDDEN");
        const b = await body(req, 8_000_000);
        if (!/^[0-9a-f-]{36}$/.test(b.id || ""))
          throw Error("VALIDATION_ERROR");
        const bytes = Buffer.from(String(b.base64 || ""), "base64");
        if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024)
          throw Object.assign(Error("PHOTO_SIZE"), { status: 422 });
        let transformed, metadata;
        try {
          const sharp = (await import("sharp")).default;
          const decoder = sharp(bytes, {
            limitInputPixels: 40_000_000,
            failOn: "warning",
            animated: false,
          });
          metadata = await decoder.metadata();
          if (
            !["jpeg", "png", "webp"].includes(metadata.format) ||
            metadata.pages > 1
          )
            throw Error("format");
          transformed = await decoder
            .rotate()
            .resize({
              width: 1600,
              height: 1600,
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 82 })
            .toBuffer({ resolveWithObject: true });
        } catch {
          throw Object.assign(Error("PHOTO_INVALID"), { status: 422 });
        }
        const checksum = createHash("sha256")
          .update(transformed.data)
          .digest("hex");
        const id = createHash("sha256")
          .update(user.id + ":" + b.id)
          .digest("hex")
          .slice(0, 32);
        const filepath = path.join(evidenceDir, id);
        try {
          await fs.mkdir(evidenceDir, { recursive: true, mode: 0o700 });
          await fs.writeFile(filepath, transformed.data, {
            flag: "wx",
            mode: 0o600,
          });
        } catch (e) {
          if (e.code === "EEXIST") {
            try {
              const existing = await fs.readFile(filepath);
              if (createHash("sha256").update(existing).digest("hex") !== checksum)
                throw Error("IDEMPOTENCY_CONFLICT");
            } catch (err) {
              if (err.message === "IDEMPOTENCY_CONFLICT") throw err;
            }
          }
        }
        return processEvidence(token, id, {
          mimeType: "image/jpeg",
          size: transformed.data.length,
          width: transformed.info.width,
          height: transformed.info.height,
          checksum,
          caption: String(b.caption || "").slice(0, 200),
          processing:
            "Auto-oriented, resized to at most 1600 px, JPEG encoded, metadata removed.",
        }, transformed.data);
      }
      if (p === "/api/admin/users" && req.method === "GET")
        return {
          users: (await c.query("select civic.list_users() as data")).rows.map(
            (x) => x.data,
          ),
        };
      if (p === "/api/admin/users" && req.method === "POST") {
        if (!["development", "evaluation"].includes(mode))
          throw Error("FORBIDDEN");
        const b = await body(req, 10000);
        const password = randomBytes(18).toString("base64url");
        const u = await rpc(c, "manage_user", [null, b, password]);
        try {
          await fs.mkdir(secretDir, { recursive: true, mode: 0o700 });
          await fs.writeFile(
            path.join(secretDir, `account-${u.id}.json`),
            JSON.stringify({ email: b.email, password }, null, 2),
            { mode: 0o600 },
          );
        } catch {}
        return { user: u, delivery: "Private evaluator file; no email sent." };
      }
      m = p.match(/^\/api\/admin\/users\/([^/]+)$/);
      if (m && req.method === "PATCH")
        return {
          user: await rpc(c, "manage_user", [
            m[1],
            await body(req, 10000),
            null,
          ]),
        };
      if (p === "/api/admin/audit" && req.method === "GET") {
        if (user.role !== "ADMIN") throw Error("ADMIN_REQUIRED");
        return {
          events: (
            await c.query(
              "select data from civic.audit order by data->>'createdAt' desc limit 500",
            )
          ).rows.map((x) => x.data),
        };
      }
      if (p === "/api/admin/reference-data" && req.method === "POST") {
        const b = await body(req, 10000);
        await rpc(c, "save_reference", [b.id || randomUUID(), b]);
        return { message: "Sector saved." };
      }
      if (p === "/api/notifications")
        return {
          notifications: (
            await c.query(
              "select id,data from civic.notifications order by data->>'createdAt' desc limit 100",
            )
          ).rows.map((x) => ({ id: x.id, ...x.data })),
        };
      m = p.match(/^\/api\/notifications\/([^/]+)$/);
      if (m && req.method === "POST") {
        await rpc(c, "mark_notification", [m[1]]);
        return { message: "Marked as read." };
      }
      if (p === "/api/exports" && req.method === "GET") {
        if (user.role === "FOCAL_PERSON") throw Error("FORBIDDEN");
        const f = filters(url.searchParams),
          format = url.searchParams.get("format") || "csv";
        if (!["csv", "xlsx", "pdf"].includes(format))
          throw Error("FILTER_INVALID");
        const rows = (await listReports(c, f, true)).reports,
          reference = await refs(c);
        const data =
          format === "csv"
            ? csvExport(rows, reference)
            : format === "xlsx"
              ? xlsxExport(rows, reference, f)
              : await pdfExport(await dashboard(c, f));
        await c.query("select civic.record_export($1,$2)", [
          format,
          JSON.stringify(f),
        ]);
        return { download: data, format };
      }
      throw Error("NOT_FOUND");
    });
    if (result?.download) {
      const types = {
        csv: "text/csv; charset=utf-8",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf: "application/pdf",
      };
      res.writeHead(200, {
        "content-type": types[result.format],
        "content-disposition": `attachment; filename="arewa-evaluation.${result.format}"`,
        "cache-control": "private, no-store",
      });
      return res.end(result.download);
    }
    send(res, 200, result);
  } catch (e) {
    const code = errors[e.message]
      ? e.message
      : e.code === "23505"
        ? "INVALID_USER"
        : e.message;
    const [status, message] = errors[code] || [
      e.status || (["22P02", "22007", "23514"].includes(e.code) ? 422 : 500),
      code === "PHOTO_INVALID"
        ? "Choose a valid JPEG, PNG or WebP photo. The selected file could not be safely decoded."
        : code === "PHOTO_SIZE"
          ? "Choose a photo up to 5 MB."
          : code === "RATE_LIMIT"
            ? "Too many attempts. Wait a minute and try again."
            : "The request could not be completed. Your saved work has been preserved.",
    ];
    if (status >= 500)
      console.error("Request failed:", e.code || e.name, code.slice(0, 100));
    send(res, status, { code: status >= 500 ? "SERVER_ERROR" : code, message });
  }
}
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
export async function handleRequest(req, res) {
  try {
    const { ensureDatabaseReady } = await import("./auto-migrate.mjs");
    await ensureDatabaseReady();
  } catch (err) {
    console.error("ensureDatabaseReady warning:", err.message);
  }
  res.setHeader("x-request-id", randomUUID());
  res.setHeader(
    "content-security-policy",
    "default-src 'self'; img-src 'self' data: blob: https://tile.openstreetmap.org; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  );
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "same-origin");
  res.setHeader(
    "permissions-policy",
    "camera=(self), geolocation=(self), microphone=()",
  );
  try {
    const u = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (u.pathname.startsWith("/api/")) return await api(req, res, u);
    if (u.pathname.startsWith("/evidence/")) {
      const id = u.pathname.split("/").pop();
      const evidence = await withDb(cookie(req), async (c) => {
        await rpc(c, "profile");
        await rpc(c, "record_evidence_access", [id]);
        const ev = (
          await c.query(
            "select data from civic.evidence where id=$1 AND data->>'state'='READY'",
            [id],
          )
        ).rows[0]?.data;
        if (!ev) return null;
        let blob = null;
        try {
          const blobRow = (
            await c.query(
              "select content, mime_type from civic.evidence_blobs where id=$1",
              [id],
            )
          ).rows[0];
          if (blobRow) {
            blob = { content: blobRow.content, mimeType: blobRow.mime_type };
          }
        } catch {}
        return { metadata: ev, blob };
      });
      if (!evidence) throw Error("NOT_FOUND");
      let data = evidence.blob?.content;
      if (!data) {
        try {
          data = await fs.readFile(path.join(evidenceDir, id));
        } catch {
          throw Error("NOT_FOUND");
        }
      }
      res.writeHead(200, {
        "content-type": evidence.blob?.mimeType || "image/jpeg",
        "cache-control": "private, no-store",
      });
      return res.end(data);
    }
    const file = u.pathname === "/" ? "index.html" : u.pathname.slice(1);
    let data;
    for (const cand of [
      path.resolve(publicDir, file),
      path.join(root, "public", file),
      path.join(root, "dist", file),
      path.join(root, "dist", "public", file),
      path.join(root, "public", "index.html"),
      path.join(root, "dist", "index.html"),
    ]) {
      try {
        data = await fs.readFile(cand);
        break;
      } catch {}
    }
    if (!data) throw Error("NOT_FOUND");
    res.writeHead(200, {
      "content-type": mime[path.extname(file)] || "text/html; charset=utf-8",
      "cache-control": file === "sw.js" ? "no-cache" : "no-cache",
    });
    return res.end(data);
  } catch {
    send(res, 404, {
      code: "NOT_FOUND",
      message: "The requested resource is unavailable.",
    });
  }
}

export const server = http.createServer(handleRequest);

const isDirectRun =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun && !process.env.VERCEL && !process.env.NOW_REGION) {
  server.listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log(`Arewa Civic Tracker listening on http://localhost:${port}`),
  );
  process.on("SIGTERM", () =>
    server.close(() => Promise.all([pool.end(), processorPool.end()])),
  );
}

export default handleRequest;
