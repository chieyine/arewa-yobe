-- Force RLS even for table owners / superusers and ensure policies apply to all roles
ALTER TABLE civic.messages FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_read_all ON civic.messages;
CREATE POLICY message_read_all ON civic.messages FOR SELECT
USING(civic.can_report(report_id) AND (data->>'visibility'='AUTHOR' OR (civic.actor()).role IN ('MEAL','ADMIN')));

ALTER TABLE civic.actions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS action_read_all ON civic.actions;
CREATE POLICY action_read_all ON civic.actions FOR SELECT
USING(civic.can_item(item_id) AND ((civic.actor()).role IN ('ADMIN','MEAL') OR data->>'visibility'='AUTHOR'));

INSERT INTO civic.schema_migrations(version) VALUES('010_enforce_rls') ON CONFLICT DO NOTHING;
