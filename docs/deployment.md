# Deployment status and procedure

The updated evaluation is running locally at http://localhost:3107. This is not an internet deployment or an official RAWYOD system. No hosted URL, domain, billable resource, external invitation, or published source repository has been created.

## Local production build

Use `docs/setup.md`. The production asset directory is `dist/public`. The server needs PostgreSQL and writable private evidence storage. Runtime secrets are limited to the application role and the narrowly scoped image-processing role. The database owner is used only for migrations, seed/import, and backup/restore tools.

## Prepared container path (not executed)

The Dockerfile pins Node 24.11.0. Compose uses PostgreSQL 18.6, a private internal database network, persistent volumes, a separate migration profile, and three distinct database passwords. The app service does not receive the owner password. Supply `PGOWNER_PASSWORD`, `PGPASSWORD`, and `PGPROCESSOR_PASSWORD` privately; do not commit them.

```sh
docker compose up -d database
docker compose --profile setup run --rm migrate
# Provision/import evaluation data through an approved controlled seed procedure.
docker compose up -d arewa
```

The container path is deployment preparation, not a tested deployment. Docker was installed but its daemon was unavailable during this work. The next executable infrastructure check is `docker info`, followed by the commands above. Do not expose an unseeded or incorrectly configured instance publicly.

## Hosted evaluation approval gate

Before deployment choose an owner-controlled target, region, TLS endpoint, database/volume storage and budget; review private evaluator credential delivery, persistent evidence permissions, encrypted backup key custody, and monitoring. Obtain the owner's approval before creating billable resources, changing DNS or publishing source code. No automatic remote reset exists.

For a remote database, the application uses least-privileged passwords. Add verified TLS settings appropriate to the chosen provider; the local Unix-socket defaults must not be copied as an internet database configuration. The prepared migration tool refuses arbitrary remote hosts. Use an explicitly reviewed migration procedure against a named target.

## Release and rollback

Build and test before replacing the running app. Retain the previous source/build and a tested encrypted backup. Migrations are versioned in `db/`; inspect compatibility before rolling back application code. Never drop a database or reverse a migration blindly as a rollback. Run sign-in, scoped report, private evidence, dashboard, export and health smoke checks after deployment.

## Shared evaluator sign-in

For a disposable hosted evaluation with synthetic data, set:

```env
APP_MODE=evaluation
ALLOW_PUBLIC_DEMO_LOGIN=true
```

The login page then fills both fields when an evaluator selects one of the three seeded demo accounts. The ordinary Sign in button still authenticates against the backend; this is not a role-switch bypass. These are deliberately shared credentials, including the demo administrator, so anyone visiting this enabled demo can use those accounts and change synthetic data. Do not enable it on a database containing real information.

The server must have the matching seed-generated `.secrets/demo-credentials.json` (or its `SECRET_DIR` equivalent) in private runtime storage. Do not commit it or bake it into public frontend assets. Default remote autofill is disabled; `APP_MODE=production` and staging reject it even if the opt-in flag is set. Set the flag false to turn off remote autofill. Local loopback evaluation autofill remains available. The Compose service passes this opt-in setting; no hosted deployment was performed by adding it.
