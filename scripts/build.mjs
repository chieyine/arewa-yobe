import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
await fs.mkdir("dist", { recursive: true });
await fs.cp("public", "dist/public", { recursive: true });
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    result.push(...(entry.isDirectory() ? await walk(p) : [p]));
  }
  return result;
}
const files = [
  "server.mjs",
  ...(await walk("src")),
  ...(await walk("public")),
  ...(await walk("db")),
].sort();
const hash = createHash("sha256");
for (const file of files) {
  hash.update(file + "\0");
  hash.update(await fs.readFile(file));
}
await fs.writeFile(
  "dist/build.json",
  JSON.stringify(
    {
      version: "0.2.0",
      build: hash.digest("hex").slice(0, 16),
      createdAt: new Date().toISOString(),
      sourceFiles: files.length,
    },
    null,
    2,
  ),
);
console.log(
  "Production assets and complete application-source build identifier written to dist.",
);
