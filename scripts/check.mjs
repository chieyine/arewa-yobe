import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
}
const files = [
  "server.mjs",
  ...["public", "src", "scripts", "tests"].flatMap(walk),
].filter((f) => /\.(mjs|js)$/.test(f));
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.status) process.exit(result.status);
}
console.log(
  `Syntax checks passed for ${files.length} JavaScript files. This is a syntax check, not a TypeScript check.`,
);
