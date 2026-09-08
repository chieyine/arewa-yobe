# Administrator guide

Administrators can review reports across the workspace, approve verified current revisions, reopen with a reason, confirm item progress, manage accounts and sectors, and inspect activity. They cannot review their own report. Approval does not publish a record.

People & access shows role, activation state and LGA assignments. Changes are enforced on subsequent server/database requests, including already-issued sessions. At least one administrator must remain active. A private evaluator account is provisioned into an ignored credential file; no email is sent. Share it privately and assign the intended LGAs. Local recovery links expire after 30 minutes and revoke old sessions after use.

To confirm project/issue progress, open the item and select an approved source report, the intended type-appropriate progress and a reason. The source revision and item version must still match. Keep action-log entries separate from progress decisions.

Sectors can be added or deactivated. Deactivation prevents new use without deleting historical reports. The Activity log contains the latest 500 recorded actions and supports text filtering. Backend audit records remain preserved beyond this view.

Keep private secrets and the database owner separate from evaluator access. The application administrator has no billing, DNS, shell, provider-owner or public-reset capability. Use the operating and incident guides for backup/recovery and escalation.
