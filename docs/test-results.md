# Executed verification — 8 September 2026

Application version 0.2.0, source build `11dd0cd10de00c4a`. The final `npm run check` exited successfully. Raw output is in `evidence/verification.txt`; browser results and screenshots are in `evidence/`.

| Check | Executed result |
|---|---|
| JavaScript syntax and production build | PASS |
| Unit checks | 4 passed |
| Real PostgreSQL authorization and integrity checks | 14 passed |
| Real HTTP/upload/export integration checks | 4 passed |
| Chromium end-to-end checks | 5 passed; final browser run 40.1 seconds |
| Production dependency audit | 0 reported vulnerabilities |
| Encrypted backup and restore drill | PASS, including sign-in, focal scope, anonymous denial, one evidence checksum and three export formats |
| Local dashboard load test | 10,000 reports, 20 concurrent queries; p50 728 ms, p95 764 ms, maximum 766 ms |
| Final visual review | Desktop sign-in/dashboard, 360px dashboard/forms/reports/users; no browser errors or horizontal page overflow in recorded visual run |
| Export inspection | Actual 103-row CSV/XLSX, zero formula cells; two-page PDF rendered and visually inspected |

The 27 automated tests cover photo decoding and private access, immutable submitted revisions, clarification, verification, approval, item progress and follow-up; unauthorized direct writes, forged roles, deactivation with an existing session, cross-workspace/LGA access, self-review, stale approvals, concurrency, transactional rollback and internal comments; offline browser-process restart, lost-response retry without duplicate submission, account isolation, keyboard skip navigation and automated accessibility checks on principal screens. These are behavior checks against real local services, not source-string assertions.

`evidence/performance.json` measures complete database dashboard queries including connection checkout. It is not an HTTP, hosted network, LCP or physical-phone measurement. `evidence/asset-sizes.json` records static shell byte sizes; reverse-proxy compression still needs deployment configuration.

`evidence/restore-drill.json` records an executed disposable-database drill. Scheduled/off-site backups and production key custody are not configured. The evidence checksum fixture is synthetic, not a claim of a real field photograph.

## Not run / not claimed

Hosted deployment/TLS and infrastructure recovery; Docker execution (daemon unavailable; next check `docker info`); physical Android/iPhone camera/GPS/offline checks; Safari and screen-reader testing; real constrained-network Web Vitals; external identity/email delivery; independent penetration testing; client UAT, training or acceptance. See `known-limitations.md` and `deployment.md` for remaining prerequisites. No security tests were skipped to obtain these results.

Reproduce with the commands in `setup.md`. Tests use disposable local databases and preserve the working evaluation records. No Git commit exists in this workspace.
