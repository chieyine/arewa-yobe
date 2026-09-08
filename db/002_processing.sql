DO $$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='arewa_processor') THEN CREATE ROLE arewa_processor LOGIN; END IF; END $$;
GRANT USAGE ON SCHEMA civic TO arewa_processor;
REVOKE EXECUTE ON FUNCTION civic.register_evidence(text,jsonb) FROM arewa_app;
GRANT EXECUTE ON FUNCTION civic.register_evidence(text,jsonb) TO arewa_processor;
CREATE OR REPLACE FUNCTION civic.record_export(p_format text,p_filters jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,civic AS $$ BEGIN PERFORM civic.log_event('EXPORT_'||p_format,NULL,p_filters); END $$;
GRANT EXECUTE ON FUNCTION civic.record_export(text,jsonb) TO arewa_app;
INSERT INTO civic.schema_migrations(version) VALUES('002_processing') ON CONFLICT DO NOTHING;
