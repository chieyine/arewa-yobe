# Local setup and evaluation

This is a Node.js 24.11.0 application with PostgreSQL 18, private filesystem evidence, and a browser interface. It does not need a hosted Supabase account. The original build specification remains in the root README; decisions and departures are recorded in `docs/assumptions-and-decisions.md`.

## Existing workspace

The active local evaluation uses the sample-content database selected in `.local/active-evaluation.json`. That file also records its private credential directory. Demo emails and passwords are unchanged. The earlier imported database and its original `.secrets/demo-credentials.json` are preserved. Do not paste passwords into tickets, screenshots, source control, or a public chat.

```sh
npm ci
npm run db:start
npm run db:migrate
npm run build
PORT=3107 npm start
```

Open http://localhost:3107. Port 3000 was already occupied during verification; the updated application uses 3107. `npm start` serves `dist/public`; run `npm run build` after editing frontend files.

## A clean checkout

Install the pinned Node runtime and PostgreSQL 18 binaries first. On this Mac, PostgreSQL is at `/usr/local/opt/postgresql@18/bin`. On another machine, set `PG_BIN` to the actual PostgreSQL binary directory. Use an ordinary OS account, not root.

```sh
npm ci
npm run db:start
npm run db:migrate
APP_MODE=evaluation ALLOW_DEMO_SEED=true npm run seed:demo
npm run verify:fixtures
npm run build
PORT=3107 npm start
```

`db:start` creates only `.local/postgres` and `.local/socket`, both private to the OS user. TCP is disabled. Local socket authentication relies on that private filesystem boundary. Never expose this trust-authenticated socket or database to an untrusted OS user.

The seed creates 17 LGAs, 34 focal persons, two administrators, two MEAL users, 34 items, and 102 fictional reports. Repeating it preserves existing records and credentials. The active sample-content evaluation has 34 items and 102 reports. The previous imported database still contains its 35 items and 103 reports; it was not reset or rewritten.

Use `npm run db:stop` to stop the private PostgreSQL instance. Stop the application first. No remote service, billable resource, DNS, or email is created by these commands.

## Verification

```sh
npx playwright install chromium
npm run lint
npm run test:unit
npm run test:db
npm run test:integration
npm run build
npm run test:e2e
node scripts/restore-drill.mjs
node scripts/performance.mjs
```

Database and browser suites create uniquely named `arewa_test_*` local databases and remove those exact databases at teardown. Browser tests use a production build on port 3193; API tests use 3191. They never reset the working evaluation database. On restricted agent hosts, local socket, listening-port, and browser execution may require host approval.

## Private account delivery

Give each evaluator only their account entry from `.secrets/demo-credentials.json` through an approved private channel. Account creation in the UI writes `.secrets/account-<id>.json`; it does not email anyone. Local password recovery writes `.secrets/last-recovery-link.txt`. Recovery links expire after 30 minutes and work once. In staging/production, local recovery-file delivery is disabled; an approved identity-delivery arrangement remains a deployment prerequisite.

## Switching back to the previous local evaluation

The sample-content refresh created a separate database, not a destructive reset. `.local/active-evaluation.json` selects it when `PGDATABASE` is not explicitly supplied. The server also reads its `secretDir` unless `SECRET_DIR` is supplied. To inspect the preserved original dataset, stop the preview and run `PGDATABASE=postgres SECRET_DIR=.secrets PORT=3107 npm start`. To return to the sample-content dataset, restart without those two overrides. Browser drafts are account-scoped: the new dataset has new account IDs, so old unsent drafts remain associated with the preserved original accounts. No old drafts or submitted revisions were deleted.
