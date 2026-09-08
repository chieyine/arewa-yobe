# Instructions for the Arewa Civic Tracker implementing agent

## Read first

Read the root `README.md` build specification in full before implementing. Read `reference/RAWYOD_Arewa_Civic_Tracker_EOI.pdf` for the client source. If this package is being added to an existing repository, preserve its existing operational README and save this build specification as `docs/arewa-build-spec.md`; this instruction then refers to that file instead.

The requested deliverable is a **full working evaluation application** for Kredit Technologies Limited's RAWYOD bid. It is not a proposal to build later, a static frontend, a clickable prototype, or an application running on fake API responses.

## Authority and decisions

The EOI establishes RAWYOD's requirements. The README distinguishes required client scope (R), proposed engineering decisions (P), and optional enhancements (O). Do not attribute our proposed stack, status names, permissions or thresholds to the client. Record changes and assumptions in the decisions log.

Follow the proposed defaults without repeatedly asking the owner to select routine technical details. Preserve an existing sound stack and unrelated work. Escalate a genuine conflict, missing authority, non-resolvable credential requirement, or security-critical ambiguity; continue with unblocked local work.

## Work sequence

Implement the README milestones in order: repository/setup; identity/schema/permissions; real reporting/evidence; review/revisions/follow-up; offline recovery/sending; monitoring/maps/exports; usability/security/performance; deployment/documentation/handover.

Complete vertical slices and keep the project runnable. Do not spend the implementation period polishing dashboard decoration before persistent reporting and authorisation work.

## Non-negotiable engineering constraints

- All operational data persists in the actual backend. IndexedDB is for explicitly account-scoped offline work, not a substitute for the server.
- Permissions are checked at server and database/storage layers. Navigation and client role labels are not security controls.
- Never trust user-editable role metadata. Check current membership and assignments, including deactivation with an existing token.
- Do not use privileged provider credentials for routine user-scoped business operations or ship them to a browser.
- Use narrow, transactional workflow functions. Direct table access must not permit approval, revision mutation or audit tampering.
- Track monitored items separately from dated reports and immutable submitted revisions. Follow-up and clarification must not inflate project/report counts.
- Separate report verification/approval from confirmed item progress. A user may not verify/approve their own report.
- Tie decisions to the revision actually reviewed; stale concurrent approval must fail.
- Keep evidence private, validated and ready before claiming it is attached. Do not expose quarantine files or allow guessed storage paths to bypass access checks.
- Offline drafts survive restart after prior online preparation. Sending is explicit, idempotent and permission-checked. Preserve conflicts rather than silently overwriting data.
- Do not cache personalised HTML, protected API responses, exports, session-refresh responses or private evidence in a shared service-worker cache.
- Background browser sending is optional; foreground/manual retry must work.
- Dashboard totals and filtered CSV/XLSX/PDF exports come from the same scoped data definitions, not constants or a single page of records.
- Do not collect political preferences, national identity numbers or unnecessary personal data. Do not add public allegations, AI credibility scoring or political profiling.

## Demo and visual quality

Use the synthetic fixture plan, real auth and a separate evaluation environment. Generate private evaluator credentials; never commit passwords or add a public role-switch bypass. Keep the evaluation notice visible. Do not claim RAWYOD endorsement, contract award or client acceptance.

Follow the restrained civic-tool design brief: readable mobile forms, natural language, obvious saved/sent states, keyboard access, useful empty/error states, and no generic gradient-heavy SaaS landing page. Do not show unfinished optional controls as if they work.

## Permission to act

Local development, synthetic fixtures, tests, documentation and deployment preparation are authorised by this brief. Ask before purchasing services, creating billable resources, changing real DNS, touching a non-disposable remote database, sending external email/invitations, publishing the repository, transferring ownership, collecting real data or submitting the bid. Do not email RAWYOD from tests or seed scripts.

A remote reset requires an allowlisted disposable evaluation target and explicit confirmation. Never run a destructive reset automatically on deploy.

## Tests and completion

Implement and run the positive/negative test matrix, including direct database/storage bypass attempts, lost submit responses, account changes, stale revisions, export injection, offline restart and actual phone testing when a device is available.

Use actual supported package versions and official documentation; pin dependencies and runtime. Keep one lockfile. Do not hide failures with broad type/lint suppression, skipped security tests or fake integrations.

At handoff report the repository/commit, actual deployment URL if deployed, exact setup commands, private credential-delivery method, completed requirements, tests actually run, failures/not-run checks, known limitations, operating assumptions and documentation locations.

Never fabricate test passes, device checks, performance measurements, delivered emails, deployed URLs, successful restores, client-approved URS, delivered training or completed contract handover. A planned check is not a result. If a required environment/tool is unavailable, implement the test, identify the exact blocker and state the next executable command.

The work is finished when the full workflow is usable, core access/data-integrity checks pass, and the owner receives a reproducible application and honest implementation evidence—not when the first screen renders.
