# Implemented architecture

The application is a modular Node HTTP service with a plain JavaScript browser client. PostgreSQL is the operational source of truth. `src/db.mjs` manages scoped transactions, `src/query.mjs` supplies shared filter/query definitions, and `src/exports.mjs` writes CSV/XLSX/PDF. `public/offline.js` isolates local draft persistence.

## Identity and database boundary

Passwords are bcrypt hashes produced by PostgreSQL pgcrypto. Successful sign-in creates a random 256-bit session token; only its SHA-256 digest is stored in PostgreSQL. Cookies are HttpOnly and SameSite=Strict, with Secure enabled in staging/production. Sessions expire after eight hours and survive an application process restart. Password recovery is a separate one-use, 30-minute token and invalidates existing sessions.

Each request opens a database transaction using the `arewa_app` role and sets the digest of the presented token in transaction-local context. The database resolves the current active membership from the session; changing a client role label or supplying another user ID does not confer authority. RLS protects reads. Routine operations never connect as the database owner.

Writes use narrow SECURITY DEFINER functions with explicit search paths, revoked PUBLIC execution, and current actor/role/scope checks. Direct application-role table writes are revoked. Workflow changes, revisions, audit records, and idempotency results commit together. Review and response functions lock the report and check its current revision/version.

## Data and evidence

Items, reports, revisions, evidence, revision associations, messages, review events, actions, notifications, sessions, and audit events are separate tables. Immutable submitted snapshots are JSONB rows with indexed relationship fields; the database no longer stores the entire application as one mutable JSON object. Composite foreign keys constrain item/report/author workspace relationships and review-event revision ownership.

Incoming photos remain server memory until Sharp safely decodes them, checks the format/pixel limit, auto-orients, resizes, strips metadata, and produces canonical JPEG bytes. A separate `arewa_processor` role can register that processing result; the normal application database role cannot claim a file is ready. File writes precede database readiness, and submitted associations are immutable. A failed metadata registration may leave an inaccessible orphan file; no quarantine/orphan file is publicly served.

Evidence is read through an authenticated endpoint that rechecks membership and record access, emits no-store headers, and records access. An unpredictable filename is not used as an authorization substitute.

## Browser and offline work

The client presents role-specific navigation, a four-step field form, review history, item follow-up, user management, and filtered monitoring. Only the generic application shell is service-worker cached. IndexedDB stores account/workspace-scoped drafts, attachment copies, and explicit send queues. Reopening offline is possible only after online preparation. Recovery identity is not server authorization. A fresh identity/assignment check precedes sending; idempotent transactions prevent duplicate submissions after a lost response.

## Deployment boundary

The running evaluation is local. A container path is prepared but not executed because Docker was not running. A hosted target, TLS/reverse proxy, protected persistent storage, identity delivery, and scheduled backup custody require deployment configuration and approval. See `docs/deployment.md` and the limitations register.
