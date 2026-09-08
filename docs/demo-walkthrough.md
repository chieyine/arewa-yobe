# Evaluation walkthrough

Use the private account entries supplied in `.secrets/demo-credentials.json`. Open the updated local build at http://localhost:3107. Do not put passwords in a recording, screenshot or public document.

1. Sign in as a Bade focal person and prepare offline drafts on a private device.
2. Create a fictional school-roof observation, choose Education, enter community/visit date, describe visible details and attach a non-identifying test image. Send and note the genuine report reference.
3. Sign in separately as MEAL. Open the same report, begin review and request a specific clarification. Add a separate internal note.
4. Return as the author. Confirm the internal note is not visible. Update the observation, respond and submit a second revision.
5. As MEAL, review and verify the current revision. As administrator, approve it.
6. Open the item. Confirm that approval did not automatically set project progress. Confirm progress from the approved source with a reason.
7. As the focal person, add a later follow-up visit to that same item. Observe that there are now two reports but one item.
8. Filter the monitoring views by LGA/sector/date and download CSV, Excel and PDF summaries. The filtered counts and complete export populations agree.
9. Save another draft, close/reopen the prepared browser offline, recover/edit it, choose Send when connected and reconnect. The app must be open to send.
10. Show that another focal account cannot read the first author's private report/evidence, MEAL cannot approve, and deactivation invalidates subsequent requests.

The Playwright suite executes the principal workflow, offline restart, lost-response retry and account-change scenarios using disposable synthetic data. Screenshots are generated from the implemented app. This document is a walkthrough, not evidence that client training or UAT has occurred.
