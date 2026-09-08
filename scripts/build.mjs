import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

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
  ...(await walk("src")),
  ...(await walk("public")),
  ...(await walk("db")),
].sort();

const hash = createHash("sha256");
for (const file of files) {
  hash.update(file + "\0");
  hash.update(await fs.readFile(file));
}

const buildInfo = {
  version: "0.2.0",
  build: hash.digest("hex").slice(0, 16),
  createdAt: new Date().toISOString(),
  sourceFiles: files.length,
};

await fs.writeFile("public/build.json", JSON.stringify(buildInfo, null, 2));

console.log("Production build metadata written to public/build.json.");
