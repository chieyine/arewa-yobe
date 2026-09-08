# Security implementation and remaining boundaries

## Implemented and tested controls

- Real password sign-in, expiring server sessions, one-use recovery and current active membership lookup.
- Bound SQL values, explicit role/LGA/workspace checks, RLS on exposed records, no direct application-role workflow writes.
- Narrow transactional workflow functions with explicit search paths and PUBLIC execution revoked. Database tests caught and corrected PostgreSQL's global default function-execution grant.
- Self-review denial, MEAL approval denial, revision/version conflict checks, actor-scoped payload-hash idempotency and rollback of partial workflow changes.
- Immutable submitted revisions, review events, audit events and evidence associations; same-workspace relationship constraints.
- Internal reviewer notes denied to focal persons through direct database reads and HTTP projections.
- Current-access private evidence downloads; Sharp decoding/format/pixel limits, EXIF removal and canonical image metadata. Only the image-processing role can register processing results.
- Protected response no-store headers, generic-only service-worker cache, plain-text user content, explicit spreadsheet string cells, CSV prefix mitigation, CSRF Origin checks and JSON-only writes.
- Last-active-administrator protection and audited role/assignment changes.
- Private secrets excluded from source/container build context; no public reset, role switch, secret-bearing export or external-email test path.

See `test-results.md` for actual commands and `tests/security.test.mjs` for executable negative cases. The test suite is not a certification or an exhaustive independent penetration test.

## Trust boundaries

The database owner, local OS account and image-processing service are privileged operators. Application-role immutability does not prevent a database owner from deliberately altering controls. The local PostgreSQL socket uses OS-private directory access and must not be exposed to other users. A remote deployment needs distinct credentials, verified TLS and owner-controlled infrastructure.

Offline IndexedDB is account-scoped but not encrypted at application level. A disconnected or compromised device cannot be remotely wiped by deactivation. Browser data eviction can lose unsent work. Files left after a failed metadata registration are not served; scheduled orphan cleanup/retention policy remains an operating task.

Local account recovery writes a private file and is disabled outside development/evaluation. Hosted identity delivery, deployment hardening, scheduled/off-site backup custody and physical-device evaluation remain pending.

## Safeguarding and incidents

Use only fictional observations in this evaluation. Do not collect political preferences, identity numbers, unnecessary contact details or real allegations. On a suspected incident, restrict affected access, preserve relevant logs and evidence, identify scope, recover into a controlled environment and communicate through the designated client incident channel once agreed. Do not assume the procurement email is an incident contact, and do not send external test notifications.
