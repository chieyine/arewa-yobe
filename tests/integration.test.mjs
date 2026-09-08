import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { fixture, payload } from "./support.mjs";
let f, server, admin, a, b, meal, r, photo;
const port = 3191;
const base = `http://localhost:${port}`;
let evidenceDir;
async function call(user, url, method = "GET", body) {
  const resp = await fetch(base + url, {
    method,
    headers: {
      "content-type": "application/json",
      ...(user?.token ? { cookie: "session=" + user.token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const bytes = Buffer.from(await resp.arrayBuffer());
  let data;
  try {
    data = JSON.parse(bytes);
  } catch {}
  return { status: resp.status, data, bytes, headers: resp.headers };
}
before(async () => {
  f = await fixture();
  evidenceDir = path.resolve(".local", f.name + "-evidence");
  server = spawn(process.execPath, ["server.mjs"], {
    env: {
      ...process.env,
      PORT: String(port),
      PGDATABASE: f.name,
      EVIDENCE_DIR: evidenceDir,
      SECRET_DIR: path.resolve(".local", f.name + "-secrets"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Test server failed to start")),
      10000,
    );
    server.stdout.on("data", (d) => {
      if (String(d).includes("listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.on("error", reject);
  });
  admin = await f.login("ADMIN");
  a = await f.login("focal.bade01@arewa-demo.invalid");
  b = await f.login("focal.bade02@arewa-demo.invalid");
  meal = await f.login("MEAL");
});
after(async () => {
  server?.kill();
  if (server) await new Promise((resolve) => server.once("exit", resolve));
  await f?.close();
  if (evidenceDir) await fs.rm(evidenceDir, { recursive: true, force: true });
});
test("HTTP private evidence rejects disguised files, decodes valid photos, and denies cross-user paths", async () => {
  const invalid = await call(a, "/api/evidence", "POST", {
    id: randomUUID(),
    base64: Buffer.from('<svg onload="evil()"></svg>').toString("base64"),
    mimeType: "image/jpeg",
  });
  assert.equal(invalid.status, 422);
  const bytes = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#21583f" },
  })
    .png()
    .toBuffer();
  const good = await call(a, "/api/evidence", "POST", {
    id: randomUUID(),
    base64: bytes.toString("base64"),
    caption: "Synthetic green test panel",
  });
  assert.equal(good.status, 200, JSON.stringify(good.data));
  photo = good.data.data;
  assert.equal(photo.state, "READY");
  assert.equal((await call(b, "/evidence/" + photo.id)).status, 404);
  assert.equal((await call(null, "/evidence/" + photo.id)).status, 404);
  const download = await call(a, "/evidence/" + photo.id);
  assert.equal(download.status, 200);
  const meta = await sharp(download.bytes).metadata();
  assert.equal(meta.format, "jpeg");
  assert.equal(meta.exif, undefined);
  assert.equal(download.headers.get("cache-control"), "private, no-store");
});
test("full HTTP submit, clarification, immutable revisions, verify, approve, follow-up and progress", async () => {
  const submission = await call(a, "/api/reports", "POST", {
    ...payload(),
    evidenceIds: [photo.id],
  });
  assert.equal(submission.status, 200, JSON.stringify(submission.data));
  r = submission.data.data.report;
  let details = (await call(a, "/api/reports/" + r.id)).data.data;
  assert.equal(details.evidence.length, 1);
  assert.equal((await call(b, "/api/reports/" + r.id)).status, 404);
  const transition = async (actor, state) => {
    const result = await call(
      actor,
      "/api/reports/" + r.id + "/review",
      "POST",
      {
        state,
        revisionId: r.currentRevisionId,
        version: r.version,
        reason: "Synthetic test review decision with explanation.",
      },
    );
    assert.equal(result.status, 200, JSON.stringify(result.data));
    r = result.data.data.report;
  };
  await transition(meal, "IN_REVIEW");
  await call(meal, "/api/reports/" + r.id + "/messages", "POST", {
    text: "Internal note must remain private.",
    visibility: "INTERNAL",
  });
  await transition(meal, "NEEDS_CLARIFICATION");
  details = (await call(a, "/api/reports/" + r.id)).data.data;
  assert.ok(details.messages.every((m) => m.visibility !== "INTERNAL"));
  const oldRevision = r.currentRevisionId;
  const response = await call(a, "/api/reports/" + r.id + "/respond", "POST", {
    operationId: randomUUID(),
    revisionId: r.currentRevisionId,
    version: r.version,
    observation:
      "Updated synthetic observation to clarify the roof structure and the visible work.",
    response: "Added the requested detail.",
  });
  assert.equal(response.status, 200);
  r = response.data.data.report;
  assert.notEqual(r.currentRevisionId, oldRevision);
  details = (await call(a, "/api/reports/" + r.id)).data.data;
  assert.equal(details.revisions.length, 2);
  assert.equal(details.evidence.length, 1);
  await transition(meal, "IN_REVIEW");
  await transition(meal, "VERIFIED");
  await transition(admin, "APPROVED");
  const item = (await call(admin, "/api/items/" + r.itemId)).data.data.item;
  assert.equal(item.confirmedProgress, "NOT_CONFIRMED");
  const p = await call(admin, "/api/items/" + item.id + "/progress", "POST", {
    progress: "IN_PROGRESS",
    sourceReportId: r.id,
    revisionId: r.currentRevisionId,
    version: item.version,
    reason: "Approved test observation supports progress.",
  });
  assert.equal(p.status, 200);
  const follow = await call(a, "/api/reports", "POST", {
    ...payload(),
    itemId: item.id,
    title: item.title,
    sectorId: item.sectorId,
    community: item.community,
  });
  assert.equal(follow.status, 200);
  assert.equal(follow.data.data.report.itemId, item.id);
  assert.equal(
    (await call(admin, "/api/items/" + item.id)).data.data.reports.length,
    2,
  );
});
test("HTTP filters, pagination, aggregates and all three actual export formats agree", async () => {
  const hostile = await call(
    admin,
    "/api/reports?search=" + encodeURIComponent("%' OR 1=1 --"),
  );
  assert.equal(hostile.status, 200);
  assert.equal(hostile.data.data.total, 0);
  const oversized = await call(admin, "/api/reports?search=" + "a".repeat(81));
  assert.equal(oversized.status, 422);
  const filter = "lga=lga-1&sector=sector-2";
  const list = await call(admin, "/api/reports?" + filter + "&pageSize=1");
  const dash = await call(admin, "/api/dashboard?" + filter);
  assert.equal(list.status, 200);
  assert.equal(list.data.data.total, dash.data.data.counts.reportsSubmitted);
  assert.equal(list.data.data.reports.length, 1);
  const counts = dash.data.data.counts;
  assert.equal(
    counts.reportsSubmitted,
    counts.pending + counts.verified + counts.rejected,
  );
  const csv = await call(admin, "/api/exports?" + filter + "&format=csv");
  assert.equal(csv.status, 200);
  assert.equal(
    csv.bytes.toString().trim().split("\r\n").length - 1,
    list.data.data.total,
  );
  const xlsx = await call(admin, "/api/exports?" + filter + "&format=xlsx");
  assert.equal(xlsx.bytes.subarray(0, 2).toString(), "PK");
  const pdf = await call(admin, "/api/exports?" + filter + "&format=pdf");
  assert.ok((await PDFDocument.load(pdf.bytes)).getPageCount() >= 1);
  assert.equal(pdf.headers.get("cache-control"), "private, no-store");
  assert.equal((await call(null, "/api/exports?format=csv")).status, 401);
});
test("cross-origin changes are rejected and session role metadata does not elevate access", async () => {
  const res = await fetch(base + "/api/reports", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: "session=" + a.token,
      origin: "https://untrusted.example",
    },
    body: JSON.stringify(payload()),
  });
  assert.equal(res.status, 403);
  assert.equal((await call(a, "/api/admin/users")).status, 403);
});
