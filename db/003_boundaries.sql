-- PostgreSQL's global default EXECUTE grant must be revoked explicitly.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA civic FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION civic.immutable(),civic.log_event(text,text,jsonb),civic.assert_payload(jsonb),civic.register_evidence(text,jsonb) FROM arewa_app;
ALTER TABLE civic.items ADD CONSTRAINT item_workspace_key UNIQUE(workspace_id,id);
ALTER TABLE civic.memberships ADD CONSTRAINT membership_workspace_key UNIQUE(workspace_id,user_id);
ALTER TABLE civic.reports ADD CONSTRAINT report_item_workspace FOREIGN KEY(workspace_id,item_id) REFERENCES civic.items(workspace_id,id);
ALTER TABLE civic.reports ADD CONSTRAINT report_author_workspace FOREIGN KEY(workspace_id,author_id) REFERENCES civic.memberships(workspace_id,user_id);
ALTER TABLE civic.review_events ADD CONSTRAINT reviewed_revision_report FOREIGN KEY(report_id,revision_id) REFERENCES civic.revisions(report_id,id);
INSERT INTO civic.schema_migrations(version) VALUES('003_boundaries');
