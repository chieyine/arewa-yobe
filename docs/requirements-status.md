# Client requirements status — 8 September 2026

**Not all client deliverables are complete.** The local evaluation application implements the core reporting and monitoring workflow; it is not yet hosted or client-accepted.

Source: `reference/RAWYOD_Arewa_Civic_Tracker_EOI.pdf`. Detailed mapping: `requirements-matrix.md`. Engineering departures: `known-limitations.md` and `assumptions-and-decisions.md`.

## Implemented and locally exercised

Three account roles and scoped permissions; monitored projects/service issues; LGA/community and optional coordinates; structured reporting and private photographs; submitted revisions, clarification, verification and approval; follow-up and item progress; audit history; scoped dashboard counts/trends; search/filters; CSV/XLSX/PDF exports; responsive forms and account-scoped offline drafts. Existing evaluation records cover 17 LGAs and 34 focal persons. Prior automated database/API/browser and restore evidence is retained under `evidence/`; later visual changes have their own recorded checks.

## Outstanding client delivery and operating requirements

- Approved hosting and live evaluation/deployment URL, HTTPS and deployment validation.
- Production account invitation/recovery delivery.
- Actual phone camera/GPS/browser checks, constrained-network validation and client UAT.
- Scheduled off-site backups, key custody, alerts and an agreed recovery/support process.
- Client consultation and acceptance of the URS, design and configuration.
- Training delivery, support terms, safeguarding/incident contacts and contractual source/administration handover.

These are not complete simply because guides or deployment files exist.

## Implementation limits to disclose

Drafts are device-local; automatic closed-browser sending and retry scheduling are not guaranteed. Mapping is per-item, without a multi-item overview map. Exports are synchronous and capped at 20,000 matching reports. JavaScript is used instead of the README's proposed TypeScript approach. Some imported synthetic reports have legacy future observation dates. These are documented engineering limits, not necessarily verbatim EOI requirements. The EOI frames map visualization as feasible/cost-effective and encourages connectivity approaches rather than prescribing a particular implementation.

## Demo access

The guarded seeder preserves existing records. The evaluation login page lists one synthetic focal, MEAL and administrator account and fills the selected email. Passwords remain in the private ignored `.secrets/demo-credentials.json`; the listing never authenticates a user or changes their role. It is disabled outside evaluation mode and does not list real user accounts.

A complete bid also needs the requested technical/financial submission and firm/team evidence. This application review does not establish that those procurement documents are complete or that RAWYOD has accepted the work. No bid has been submitted from this task.

### Update: evaluator password autofill

At the owner's explicit request, selecting one of the three listed demo accounts now fills its password through a runtime endpoint. Local evaluation permits this; hosted evaluation requires `ALLOW_PUBLIC_DEMO_LOGIN=true` with `APP_MODE=evaluation`. Production/staging block it. The normal sign-in process and database authorization remain enforced. Shared public demo access must use fictional data only. Verification passed for all three real sign-ins, field autofill, hosted opt-in/default denial, production denial, unlisted accounts and cross-origin rejection. See `deployment.md` for configuration. No credentials were committed and no remote deployment was performed.
