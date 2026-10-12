-- Reporter names for report lists, exports and downloads.
-- Returns a name only for reports the signed-in user is already allowed to read.
CREATE OR REPLACE FUNCTION civic.report_authors(p_ids text[]) RETURNS TABLE(report_id text, author_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,civic AS $$
 SELECT r.id, a.display_name FROM civic.reports r JOIN civic.accounts a ON a.id=r.author_id WHERE r.id=ANY(p_ids) AND civic.can_report(r.id)
$$;
REVOKE ALL ON FUNCTION civic.report_authors(text[]) FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='arewa_app') THEN
    GRANT EXECUTE ON FUNCTION civic.report_authors(text[]) TO arewa_app;
  END IF;
END $$;
INSERT INTO civic.schema_migrations(version) VALUES('009_report_authors') ON CONFLICT DO NOTHING;
