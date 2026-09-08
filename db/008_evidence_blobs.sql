CREATE TABLE IF NOT EXISTS civic.evidence_blobs (
  id text PRIMARY KEY REFERENCES civic.evidence(id) ON DELETE CASCADE,
  content bytea NOT NULL,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

DO $$ BEGIN
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='arewa_processor') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON civic.evidence_blobs TO arewa_processor;
  END IF;
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='arewa_app') THEN
    GRANT SELECT ON civic.evidence_blobs TO arewa_app;
  END IF;
END $$;

INSERT INTO civic.schema_migrations(version) VALUES('008_evidence_blobs') ON CONFLICT DO NOTHING;
