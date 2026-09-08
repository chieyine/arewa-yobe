# Known limitations and outstanding work

The core local field-to-review workflow is implemented and exercised. The project must not be represented as a fully deployed, client-accepted production system.

## External / environment checks

- No hosted evaluation or production deployment. No approved provider/region/domain/budget was supplied. The prepared Docker path was not executed because Docker's daemon was unavailable. The next infrastructure check is `docker info`; deployment procedures are in `deployment.md`.
- No physical Android/iPhone device was available. Chromium at 360px and an actual browser-process offline restart were tested; hardware GPS/camera, phone keyboard/safe areas, mobile Safari and screen-reader checks remain pending. Run the walkthrough on a real phone over an approved HTTPS target.
- Managed invitation/recovery delivery is not configured. Local evaluation uses private credential/recovery files; production recovery-file delivery is disabled. No external email has been sent.
- The encrypted restore drill passed locally. Scheduled/off-site backups, key custody, alerting and a recovery SLA remain operational setup work.
- RAWYOD consultation, URS/UI approval, formal UAT, training delivery, contractual handover, language review, retention, incident contacts and support terms have not occurred.

## Explicit implementation limits

- Saved drafts are device-local, not synchronized server drafts. Submitted reports and evidence persist in PostgreSQL/private server storage and are available across authorized sessions. Clearing browser data can lose unsent work.
- Sending occurs in the foreground or by manual retry; no guarantee of closed-browser background sending, exponential retry scheduler or storage-quota recovery across all browsers. Failed/blocked/conflicting payloads are preserved. Multiple-tab server idempotency is enforced.
- Maps show a captured item's actual coordinates only after explicit tile loading. There is no multi-item cluster map or offline tile cache. The accessible item/location list remains available; no coordinates or boundaries are fabricated.
- Exports are synchronous and limited to 20,000 matching reports; there is no persistent export-job service. The activity-log UI shows the latest 500 events while database history is retained.
- Input is JavaScript with syntax checks and behavioral tests, not TypeScript. XLSX uses explicit string cells and a minimal standards-based writer; broad spreadsheet-client compatibility is not claimed. PDF and XLSX structural checks are recorded.
- Photo processing produces canonical JPEGs and strips embedded metadata. It does not prove that an image depicts a real event. Orphaned files from failed readiness registration are inaccessible but scheduled cleanup and long-term retention remain to be configured.
- The active sample-content dataset has 34 items/102 reports with controlled dates. The preserved previous database has 35 items/103 reports and some legacy future-dated observations. Legacy unprocessed evidence remains only in the old store and is not served as ready evidence.
- This is a single-workspace evaluation deployment. Database scope denies cross-workspace reads, but a commercial multi-tenant onboarding/admin product is not implemented.

See `test-results.md` for pass/fail/not-run evidence rather than treating this document as a certification.
