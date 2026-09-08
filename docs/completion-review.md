# Completion and visual review

Reviewed 8 September 2026. Version 0.2.0, content build `11dd0cd10de00c4a`.

The core local evaluation application is working and substantially redesigned. It is not yet a hosted, client-accepted production system. The current preview is http://localhost:3107.

## Delivered

- A restrained forest-green civic interface with editorial typography, readable mobile forms, responsive navigation, clear saved/sent states, accessible focus and useful empty/error screens.
- Actual PostgreSQL persistence, database-enforced permissions, current membership checks, private validated photographs, and immutable submitted revisions.
- Reporting, clarification, verification, approval, separately confirmed item progress, follow-up, internal notes, notifications, account/assignment administration and audit history.
- Account-scoped offline drafts that survive browser restart, explicit sending, preserved conflicts and idempotent retry after a lost response.
- Real scoped monitoring totals, filters, location lists, optional per-item coordinate maps and consistent CSV/XLSX/PDF exports.
- Pinned dependencies, migrations, synthetic fixtures, private evaluator credentials, guarded local setup and encrypted backup/restore tooling.

The final verification passed 27 tests: four unit, fourteen database, four HTTP integration and five browser tests. Automated accessibility, mobile overflow and keyboard checks passed on the tested screens. The local 10,000-report dashboard test achieved 764 ms p95 with twenty concurrent queries. An encrypted restore drill passed. Production dependency audit reported zero vulnerabilities. Full evidence and measurement boundaries are in `test-results.md`.

## Reproduce and access

Source directory: `/Users/macbookpro/Documents/Arewa_Civic_Tracker_Agent_Pack`. No Git repository or commit existed; no remote publication is claimed. `dist/build.json` identifies the application content.

```sh
npm ci
npm run db:start
npm run db:migrate
npm run build
PORT=3107 npm start
```

Node 24.11.0 and PostgreSQL 18 binaries are required. The existing preview already runs on port 3107. Clean-checkout instructions and test commands are in `setup.md`.

Evaluator accounts are delivered through the ignored, private `.secrets/demo-credentials.json` file. Share only selected entries through an approved private channel. Passwords are not included here. No external invitations were sent.

The working synthetic evaluation preserves 38 accounts, 35 items and 103 reports. Legacy future-dated observations remain documented; legacy unprocessed evidence is not served as ready evidence. The original SQLite store is preserved.

## Remaining before full completion

Hosted deployment, approved infrastructure/domain, managed identity delivery, scheduled/off-site backups, physical-phone checks, client consultation/UAT and training/handover remain outstanding. Docker preparation has not been executed because its daemon was unavailable. No hosted URL, client endorsement or acceptance is claimed.

Implementation limits include device-local drafts, foreground/manual retry, synchronous exports capped at 20,000 records, JavaScript rather than TypeScript, and per-item maps rather than a clustered monitoring map. These are explicit departures, not completed features. See `known-limitations.md`, `requirements-matrix.md` and `assumptions-and-decisions.md`.

Operational documentation: `setup.md`, `deployment.md`, `backup-and-restore.md`, `security-and-threat-model.md`, `offline-behaviour.md`, role guides, `demo-walkthrough.md` and `handover-checklist.md`. Client-facing requirements remain a draft in `urs-draft.md`.
