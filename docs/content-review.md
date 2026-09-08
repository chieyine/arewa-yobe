# Sample content and language review

The application now uses plain Nigerian English and practical field-report scenarios. The active sample dataset contains 38 accounts, 34 monitored items and 102 reports across the 17 LGAs. Titles, locations, observations, responsible offices and follow-up actions are drawn from six illustrative scenarios: classroom roofs, health-centre waiting areas, market drainage, borehole supply, health-centre water storage and training equipment.

The observations do not claim photographs exist where none were uploaded. Generic site descriptions avoid identifying real facilities. A visible sample-data notice remains: these are not verified community reports. This is realistic sample content, not evidence of actual works, incidents or client approval.

The previous database, credentials and submitted history were preserved. The active database and credential directory are selected by `.local/active-evaluation.json`; explicit `PGDATABASE` and `SECRET_DIR` settings override it. Existing demo email/password combinations were retained. Account IDs are fresh, which keeps account-scoped browser work separate. See `setup.md` for switching back to the original dataset.

The seeder produces the improved content for clean future installations as well. `scripts/sample-content.mjs` defines the scenarios. `scripts/prepare-content-evaluation.mjs` creates a new local evaluation without altering prior report revisions. Creation evidence: `evidence/content-dataset-check.json`. Workflow results: `evidence/content-workflow-check.txt`.

Verification completed: `npm run check` passed — 4 unit, 14 database, 4 HTTP integration and 5 browser tests. The browser run took 2.2 minutes. The 14-route desktop/360px layout check also passed with no browser errors or horizontal page overflow. These are local checks, not physical-phone or client acceptance results.
