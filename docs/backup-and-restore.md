# Encrypted backup and restore

Backups include a PostgreSQL custom-format dump (accounts, memberships, sessions, workflow records and configuration) plus ready evidence objects and checksums. An exported REPEATABLE READ snapshot keeps the dump and selected evidence metadata consistent. The backup is encrypted using AES-256-GCM. The owner must keep its 32-byte key in a separate approved secret store; losing the key loses the backup.

The scripts require PostgreSQL 18 tools and an access-controlled directory. Pass secrets through the environment privately; do not put actual key values in documentation or shell history.

```sh
# BACKUP_KEY is a private 64-character hexadecimal key; BACKUP_DIR is separate storage.
node scripts/backup.mjs
```

The command prints the backup filename and non-secret counts, never the key or passwords. Backups are not automatically uploaded, scheduled, or kept off-site by this repository.

Restore accepts only a new local database named `arewa_restore_*`, evaluation mode, an authenticated backup and a new separate evidence directory. It refuses overwriting an existing database/directory or using a remote socket.

```sh
# Set APP_MODE=evaluation, RESTORE_DATABASE=arewa_restore_<unique>,
# BACKUP_FILE, BACKUP_KEY and RESTORE_EVIDENCE_DIR privately.
node scripts/restore.mjs
```

After restoring, verify sign-in, membership scope, counts, sample evidence checksums, denied anonymous access and exports. The implemented drill is:

```sh
node scripts/restore-drill.mjs
```

It creates disposable source and destination databases, backs up with an ephemeral key, restores, verifies 38 accounts/102 reports/102 revisions, focal-person scope, anonymous denial and a sample evidence checksum, then removes the disposable targets. The actual result is in `docs/evidence/restore-drill.json`. This proves that particular local drill, not scheduled production recoverability, off-site custody, or a client-approved recovery SLA.
