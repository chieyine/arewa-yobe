# Assumptions and decisions

## 2026-09-08 completion and visual review

- The client EOI is the requirements authority. The root README is the proposed build specification, not proof of client acceptance.
- Inspection found a working Node/vanilla-JavaScript UI with a SQLite `app_state` table containing one mutable JSON document. Its source-text assertions did not verify database security. Keeping that persistence model would conflict with the non-negotiable database requirements.
- Retained Node and the lightweight browser architecture; replaced persistence with local PostgreSQL 18, real RLS, restricted workflow functions, transactional revisions, and explicit grants. This is an engineering choice, not a client-mandated stack. Hosted Supabase/Next.js is not required to run this implementation.
- Preserved the old SQLite database and its private credentials. Imported 38 accounts, 35 items, 103 reports, revision/review history, messages, and audit entries without resetting the evaluation. Corrected item titles containing the accidental literal `[object Object]`. Legacy files were not imported as ready evidence because the previous upload path did not decode or sanitize them.
- Some imported fixture observation dates extend past the original 8 September reference date. They are retained as legacy data, identified by `verify:fixtures`; new submissions reject future dates and clean seeding uses the configured demonstration window. Existing synthetic history was not silently rewritten to make the dashboard prettier.
- Sign-in uses PostgreSQL pgcrypto bcrypt and opaque server sessions. Local provisioning/recovery deliberately deliver through private files. No email has been sent. Managed identity delivery for hosted operation is an outstanding deployment decision.
- Draft saving is explicitly device-local. It does not silently create server drafts or promise cross-device recovery of unsent work. This is a deviation from the README's more extensive proposed server-draft API, and is reflected in the UI and limitations.
- The Node/JavaScript implementation has real syntax checks and behavioral tests. It does not claim TypeScript typechecking; the misleading former `typecheck`, `db:types`, and placeholder migration commands were replaced/removed.
- Export scope is shared between lists, dashboard and downloads. Exports are bounded, synchronous, protected no-store responses; no stored export-job system is claimed. Focal persons do not receive bulk-export permission.
- Mapping uses only captured coordinates, with an explicit per-item map load and a full location list fallback. Removed the invented marker distribution. A multi-item interactive map is not claimed.
- Source text and design assets are original to this evaluation except third-party dependencies and the preserved client brief. No RAWYOD logo, endorsement, government seal, real allegations, political profiling, or public role switch was added.
- English and WAT are the initial defaults. Client consultation, URS approval, hosting ownership/region, retention, languages, support agreement, device testing, training, and formal handover remain distinct from application implementation.

## 8 September 2026 — Field Signal visual redesign

The owner explicitly rejected the earlier restrained template appearance and requested a bold, memorable animated design. The entrance now uses oversized sans-serif typography, charcoal/acid-yellow/orange accents, a bespoke abstract SVG contour sculpture, animated line drawing and pointer-responsive CSS perspective. The sculpture is labeled abstract and does not assert geographic accuracy. No official endorsement, fabricated metrics or public data was added. The working interface shares the sharper typography and metrics treatment while preserving existing form controls and workflows. Reduced-motion preference disables decorative motion. No new remote asset, tracking, dependency or billable service was introduced.
