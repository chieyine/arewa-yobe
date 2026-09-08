# Requirements matrix — verified implementation review

The source is `reference/RAWYOD_Arewa_Civic_Tracker_EOI.pdf`. R denotes client scope; detailed status names, stack and tests are engineering decisions. “Implemented/tested” refers to the local evaluation, not client acceptance or a hosted production service.

| ID | Requirement | Implementation / evidence | Status |
|---|---|---|---|
| R01 | Secure access and registration | Private provisioning, PostgreSQL authentication, expiring recovery; API/browser sign-in | Local implemented; hosted identity delivery pending |
| R02 | Three access levels | RLS + narrow functions; DB01–DB10, direct bypass tests | Tested |
| R03 | Lifecycle / activity | People & access, assignment controls, last-admin safeguard, audit | Tested at DB/API; browser accessibility checked |
| R04 | Projects and service issues | Separate items/reports; full browser workflow | Tested |
| R05 | LGA/community/location | Required text; optional GPS; scoped references | Implemented; GPS hardware check pending |
| R06 | Structured report details | Four-step form and server/database validation | Tested core fields |
| R07 | Photos/evidence/follow-up | Sharp processing, private downloads, revision evidence, linked visits | API and browser tested |
| R08 | Submission / updates / tracking | Genuine receipts, idempotency, immutable clarification revisions | Tested |
| R09 | Review / clarification / verification / approval | Revision-locked role-specific state machine | API, DB and browser tested |
| R10 | Auditability | Separate append-only revisions/events and transactional changes | Direct mutation denial tested |
| R11 | Counts, breakdowns, statuses, trends | Shared scoped PostgreSQL query functions and charts | Functional tests passed; load measurements recorded separately |
| R12 | Search and filters | Shared population, WAT date basis, pagination | API and unit tested |
| R13 | Exports | CSV/XLSX detail, paginated PDF summary, scoped no-store downloads | Actual files generated and parsed |
| R14 | Location mechanism / feasible maps | Actual optional coordinates, per-item tile map, location list fallback | Implemented; no invented coordinates |
| R15 | Mobile/lightweight/offline | Responsive forms, IndexedDB recovery, explicit sends, generic service worker | 360px browser and restart tested; physical phone pending |
| R16 | 17 LGAs / 34 focal persons / growth | Guarded seed, existing-data import, assignment management | Cardinalities tested; 10,000-report load measured |
| R17 | URS/design/architecture | `urs-draft.md`, architecture, implemented UI and screenshots | Draft/implemented; client consultation and approval pending |
| R18 | Test/configure/host/document | Real suites, versioned migrations, build and container preparation | Local tests executed; hosted deployment and Docker execution pending |
| R19 | Manuals/training/support | Guides, walkthrough, training plan and runbook | Materials prepared; actual training/support contract pending |
| R20 | Security/backups/reliability | Database/storage controls, encrypted consistent snapshot backup and restore drill | Local controls/drill tested; scheduled off-site custody pending |
| R21 | Handover/independence | Source, lockfile, migrations, guides, dependency inventory and private credentials | Reproducible local package; contractual transfer pending |
| R22 | Confidentiality/safeguarding | Private workspace, minimal data, synthetic records, incident guidance | Implemented; client contacts/policy approval pending |

Known departures from the more extensive proposed README implementation (server-draft CRUD, export jobs, automatic retry backoff, multi-item map, TypeScript) are stated in `assumptions-and-decisions.md` and `known-limitations.md`, not silently marked complete.
