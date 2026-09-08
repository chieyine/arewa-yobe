import { handleRequest } from "../server.mjs";
import { ensureDatabaseReady } from "../src/auto-migrate.mjs";

export default async function handler(req, res) {
  await ensureDatabaseReady();
  return handleRequest(req, res);
}
