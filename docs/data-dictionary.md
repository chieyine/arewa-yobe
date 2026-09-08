# Data dictionary and metric definitions

All operational records live in the `civic` PostgreSQL schema. Every report belongs to one continuing item. Its submitted revisions and review events are append-only for application roles. Follow-up visits create a new report for the same item; clarification creates a new revision for the existing report.

| Table | Meaning |
|---|---|
| accounts | Minimal identity and bcrypt password hash; no application-role SELECT |
| memberships | Workspace, role, active state, LGA assignments |
| sessions / recovery | Hashed, expiring authentication and recovery tokens |
| reference_data | Stable LGA/sector IDs and display metadata |
| items | Continuing project or service issue, location, provisional state, confirmed progress/version |
| reports | Author, item, reference, review state, current revision, first/latest submission timestamps |
| revisions | Immutable dated observation snapshots |
| evidence / revision_evidence | Canonical private file metadata and immutable revision associations |
| messages | Explicit AUTHOR or INTERNAL visibility |
| review_events | Revision-bound decision, reason, actor, time |
| actions | Item progress confirmations and follow-up action entries |
| notifications | Per-user event/read records |
| audit | Append-only security and business action log |
| idempotency | Actor + operation + stable key, payload hash and committed result |
| schema_migrations | Applied migration versions |

## Metrics

The scoped report population excludes DRAFT and applies the same search/LGA/sector/review/type/progress/date filters for dashboard, lists and exports. Date basis is FIRST_SUBMITTED by default or OBSERVED when explicitly selected. Calendar date boundaries use Africa/Lagos.

- Reports submitted: distinct qualifying report IDs.
- Items tracked: distinct item IDs associated with those reports.
- Verified: current review state VERIFIED or APPROVED.
- Pending: SUBMITTED, IN_REVIEW or NEEDS_CLARIFICATION.
- Rejected: REJECTED, reported separately.
- LGA coverage: qualifying LGAs divided by the currently configured/assigned scope.
- Sector/LGA breakdowns: counts over exactly that same report population.
- Trend: first submissions grouped by WAT calendar day; not silently changed to observation dates.
- Confirmed progress: current item progress for distinct qualifying items. It is not a historical end-of-period snapshot or a claim of attributable impact.

Invariant: submitted = pending + verified + rejected. Tests verify it against filtered exports and pagination. Imported synthetic data is preserved, so its totals need not equal a clean 34-item/102-report seed.
