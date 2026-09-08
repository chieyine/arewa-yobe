# Operations and costs

No hosted services have been purchased or provisioned. Local PostgreSQL and Node are the executed environment. Container deployment is prepared but not tested. Therefore no live provider price, free-plan guarantee, hosted region, monthly bill or client support SLA is asserted.

Operating costs to confirm at deployment are Node hosting, PostgreSQL, persistent image storage, bandwidth, encrypted backups/off-site custody, domain/TLS management if applicable, identity email delivery and maintenance. Estimate image growth as reports/month × mean photos/report × mean stored image bytes; include derivatives, retention and backup copies. Canonical JPEGs are capped at 1,600 px on the longest edge. Incoming limits are 5 MB/photo, 5 photos and 20 MB local total per report.

Check `/api/health`, service errors, database disk space, evidence growth, sign-in failures and backup age. Keep session/credential values, raw observations and image contents out of logs. Back up before an approved migration and run the restore drill regularly against a separate target. Backups are encrypted but not scheduled or off-site until an operator configures that arrangement.

Run `npm ci`, `npm run check` and dependency advisories before releasing changes. Keep the lockfile and runtime pins aligned. Review narrowly scoped database-function grants after migrations; never solve an access failure by giving the runtime the database-owner password.

Proposed triage: first address exposed private data or lost/duplicated submissions, then broken report/review flows, then usability and minor defects. Client escalation contacts, response times, retention and maintenance duration remain to be agreed.

Performance measurements are in `docs/evidence/performance.json`; they describe the exact local fixture and concurrency. A measured result is not an uptime or recovery promise.
