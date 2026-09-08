import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fixture } from "../support.mjs";
export default async function () {
  const f = await fixture();
  const config = path.resolve(".local/browser-fixture.json");
  const evidence = path.resolve(".local", f.name + "-photos");
  await fs.writeFile(
    config,
    JSON.stringify({ credentials: f.credentials, database: f.name }),
    { mode: 0o600 },
  );
  const server = spawn(process.execPath, ["server.mjs"], {
    env: {
      ...process.env,
      PORT: "3193",
      PGDATABASE: f.name,
      EVIDENCE_DIR: evidence,
      NODE_ENV: "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Browser test server did not start")),
      10000,
    );
    server.stdout.on("data", (b) => {
      if (String(b).includes("listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.on("error", reject);
  });
  return async () => {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
    await f.close();
    await fs.rm(evidence, { recursive: true, force: true });
    await fs.rm(config, { force: true });
  };
}
