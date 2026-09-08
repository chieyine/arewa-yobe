import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const base = path.resolve(".local");
const data = path.join(base, "postgres");
const sock = path.join(base, "socket");
const bin = process.env.PG_BIN || "/usr/local/opt/postgresql@18/bin";
fs.mkdirSync(base, { recursive: true, mode: 0o700 });
fs.mkdirSync(sock, { recursive: true, mode: 0o700 });
const run = (name, args) => {
  const r = spawnSync(path.join(bin, name), args, { stdio: "inherit" });
  if (r.status) process.exit(r.status);
};
if (process.argv[2] === "stop") {
  run("pg_ctl", ["-D", data, "stop", "-m", "fast"]);
  process.exit(0);
}
if (!fs.existsSync(path.join(data, "PG_VERSION")))
  run("initdb", [
    "-D",
    data,
    "-A",
    "trust",
    "-U",
    "arewa_owner",
    "--no-locale",
    "-E",
    "UTF8",
  ]);
if (!fs.existsSync(path.join(data, "postmaster.pid")))
  run("pg_ctl", [
    "-D",
    data,
    "-l",
    path.join(base, "postgres.log"),
    "-o",
    `-k ${sock} -p 55439 -h ''`,
    "start",
  ]);
console.log(
  "Private local PostgreSQL ready. TCP is disabled; its Unix socket is in .local/socket.",
);
