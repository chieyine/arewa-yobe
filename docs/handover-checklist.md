# Evaluation handover checklist

- Source: this workspace, version 0.2.0; no Git repository existed, so no commit or remote URL is claimed. `dist/build.json` contains a content-derived build identifier.
- Build specification and source: root README and unchanged client PDF under `reference/`.
- Implementation: `server.mjs`, `src/`, `public/`, versioned PostgreSQL migrations in `db/`.
- Reproducibility: package/runtime pins, single npm lockfile, local setup, guarded seed/import and private account generation.
- Documentation: draft URS, architecture, data/API definitions, security, offline behavior, role guides, demonstration walkthrough, operations, backups, deployment preparation, tests and limitations.
- Private credential delivery: ignored `.secrets/demo-credentials.json`; share only selected evaluator entries through an approved private channel. No passwords are part of the handover prose or screenshots.
- Evaluation URL: local http://localhost:3107 only. Hosted URL, client-owned infrastructure, TLS and scheduled backup custody remain pending.
- Verification: consult `test-results.md` and `docs/evidence/` for actual results. No physical-phone check, client acceptance, completed training or contract ownership transfer is claimed.
- Approval boundaries: do not buy services, modify real DNS/database, publish code, send external invitations or submit the bid without explicit owner authority.
