import fs from "node:fs";
const base = process.env.TEST_URL || "http://localhost:3107";
const credentials = JSON.parse(
  fs.readFileSync(".secrets/demo-credentials.json"),
).credentials;
const c = credentials.find((x) => x.role === "ADMIN");
const login = await fetch(base + "/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: c.email, password: c.password }),
});
const cookie = login.headers.get("set-cookie")?.split(";")[0];
console.log("Sign-in:", login.status);
if (!login.ok) {
  console.log(await login.text());
  process.exit(1);
}
for (const p of [
  "/api/me",
  "/api/dashboard",
  "/api/reports",
  "/api/items",
  "/api/admin/users",
  "/api/exports?format=pdf",
]) {
  const r = await fetch(base + p, { headers: { cookie } });
  console.log(
    p,
    r.status,
    r.ok
      ? String((await r.arrayBuffer()).byteLength) + " bytes"
      : await r.text(),
  );
}
