# Implemented API

JSON responses use `{ok,data}` or `{ok:false,error:{code,message}}`. Responses include an `X-Request-ID` header. Protected JSON and downloads use no-store headers. Mutations require JSON and reject foreign Origins. Session identity is an HttpOnly cookie.

| Endpoint | Purpose / access |
|---|---|
| POST `/api/auth/login` | Real account/password sign-in; rate limited |
| POST `/api/auth/logout` | Invalidate the presented session |
| POST `/api/auth/recovery/request` | Non-enumerating local recovery; no external email |
| POST `/api/auth/recovery/reset` | One-use token; replaces password and revokes sessions |
| GET `/api/me` | Current active identity, scope and reference data |
| GET `/api/reports` | Scoped, paginated submitted reports |
| POST `/api/reports` | Atomic initial/follow-up submission; stable clientRecordId and ready evidence IDs |
| GET `/api/reports/:id` | Authorized detail, visible messages, immutable revisions, evidence and decisions |
| POST `/api/reports/:id/review` | Current revisionId + version, valid transition, reason and authorized reviewer |
| POST `/api/reports/:id/respond` | Author's new revision; current revision/version and stable operationId |
| POST `/api/reports/:id/messages` | Author-visible or authorized internal note |
| POST `/api/reports/:id/amendment-request` | Notify administrators; does not edit a submitted snapshot |
| GET `/api/items`, `/api/items/:id` | Scoped item projection and permitted history/actions |
| POST `/api/items/:id/progress` | Admin confirmation using an approved source revision and item version |
| POST `/api/items/:id/actions` | Reviewer follow-up action log |
| POST `/api/evidence` | Author-only canonical image processing; stable upload ID |
| GET `/evidence/:id` | Reauthorized private JPEG download |
| GET `/api/dashboard` | SQL aggregates from shared filtered population |
| GET `/api/exports?format=csv\|xlsx\|pdf` | Reviewer/admin, same scope/filters, at most 20,000 reports |
| GET/POST `/api/admin/users` | Admin list/private evaluator provisioning |
| PATCH `/api/admin/users/:id` | Role, active state and assignments; last-admin protection |
| POST `/api/admin/reference-data` | Admin sector creation/deactivation |
| GET `/api/admin/audit` | Latest 500 admin-visible audit records |
| GET `/api/notifications`; POST `/api/notifications/:id` | Own notifications and read marking |
| GET `/api/health` | Actual database connectivity |

Filters: search (80 characters), lga, sector, state, itemType, progress, dateBasis (`FIRST_SUBMITTED` or `OBSERVED`), from/to (inclusive WAT calendar dates), page and pageSize (1–100; default 20). SQL values are bound parameters. Export scope excludes page and pageSize.

The API does not implement the originally proposed stored export jobs, a separate server-draft CRUD API, public registration, or public publication. See the decisions and limitations registers.
