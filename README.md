# Arewa Civic Tracker
## Full working demonstration — product and engineering build specification

**Bidder:** Kredit Technologies Limited  
**Intended client:** Roadmap for Women and Youth Development (RAWYOD)  
**Project:** Voices for Inclusive Civic Engagement and Social Change Towards Open Voting, Oversight, Transparency and Electoral Strengthening (VOICES TO VOTES)  
**EOI reference:** RAWYOD/NYFF/VOICES-TO-VOTES/2026/001  
**Specification version:** 1.0 — 8 September 2026  
**Status:** Instructions for building an evaluation application; not a claim of contract award, client approval, or completed implementation.

---

## Contents

- [1. Mission and instructions to the implementing agent](#1-mission-and-instructions-to-the-implementing-agent)
- [2. Authority, scope, and assumptions](#2-authority-scope-and-assumptions)
- [3. EOI requirements-to-implementation matrix](#3-eoi-requirements-to-implementation-matrix)
- [4. Recommended architecture and dependency policy — P](#4-recommended-architecture-and-dependency-policy--p)
- [5. Roles, account lifecycle and permissions — P](#5-roles-account-lifecycle-and-permissions--p)
- [6. Domain model: items are not reports — P](#6-domain-model-items-are-not-reports--p)
- [7. Reporting form and validation — P](#7-reporting-form-and-validation--p)
- [8. Review, clarification and progress state machines — P](#8-review-clarification-and-progress-state-machines--p)
- [9. Screens and navigation — P](#9-screens-and-navigation--p)
- [10. Visual design and content direction — P](#10-visual-design-and-content-direction--p)
- [11. Offline and limited-connectivity behaviour — P](#11-offline-and-limited-connectivity-behaviour--p)
- [12. Evidence capture, storage and handling — P](#12-evidence-capture-storage-and-handling--p)
- [13. Dashboard and metric definitions — P](#13-dashboard-and-metric-definitions--p)
- [14. Search, exports and summary reporting — P](#14-search-exports-and-summary-reporting--p)
- [15. Location and mapping — P](#15-location-and-mapping--p)
- [16. Database design — P](#16-database-design--p)
- [17. Server/database authorisation and transaction design — P](#17-serverdatabase-authorisation-and-transaction-design--p)
- [18. API contract and error handling — P](#18-api-contract-and-error-handling--p)
- [19. Notifications, freshness and user activity — P](#19-notifications-freshness-and-user-activity--p)
- [20. Security, safeguarding and privacy implementation — P](#20-security-safeguarding-and-privacy-implementation--p)
- [21. Evaluation environment and synthetic seed data — P](#21-evaluation-environment-and-synthetic-seed-data--p)
- [22. Performance, reliability and cost discipline — P](#22-performance-reliability-and-cost-discipline--p)
- [23. Repository structure — P](#23-repository-structure--p)
- [24. Configuration and repeatable local setup — P](#24-configuration-and-repeatable-local-setup--p)
- [25. Test plan and acceptance evidence — P](#25-test-plan-and-acceptance-evidence--p)
- [26. Deployment, backup, recovery and handover — P](#26-deployment-backup-recovery-and-handover--p)
- [27. Required documentation and training materials — P](#27-required-documentation-and-training-materials--p)
- [28. Reviewer walkthrough — P](#28-reviewer-walkthrough--p)
- [29. Implementation milestones and execution order — P](#29-implementation-milestones-and-execution-order--p)
- [30. Definition of done](#30-definition-of-done)
- [31. What the agent must return](#31-what-the-agent-must-return)
- [32. Optional enhancements — O](#32-optional-enhancements--o)
- [33. Open decisions for eventual client confirmation](#33-open-decisions-for-eventual-client-confirmation)
- [34. Sources and technical references](#34-sources-and-technical-references)

## 1. Mission and instructions to the implementing agent

Build a **complete, working, deployable Arewa Civic Tracker**, not a marketing website, static dashboard, clickable mock-up, or frontend connected to fabricated responses.

The application will accompany Kredit Technologies Limited's bid. Evaluators must be able to sign in with different authorised accounts, submit a fictional field report, upload evidence, review it, request clarification, respond, verify and approve it, record follow-up, and inspect the resulting dashboard and exports. Data must persist across reloads, sessions, and devices.

Kredit's founder has several years of software-engineering experience. Treat this as a professional engineering assignment. Prioritise a reliable product, readable implementation, reproducible deployment, and testable claims. Do not replace delivery with a lengthy plan or stop after scaffolding the screens.

### Non-negotiable delivery rules

1. Every core visible action must work against the real development/evaluation backend. No fake success toasts, local arrays masquerading as server persistence, invented chart totals, or buttons that do nothing.
2. Implement the full required workflow and the tests that prove it. A disabled optional integration is acceptable only when clearly identified; an unfinished core feature is not complete.
3. Enforce permissions at the server and database, not just in navigation or client components.
4. Use fictional evaluation records and private evidence storage. Never populate the application with real allegations, personal data, or material from unrelated Kredit products.
5. Maintain an explicit distinction between locally saved work and information successfully received by the server.
6. Distinguish report verification from the progress of the underlying issue. Verification is a recorded review decision, not a guarantee of truth.
7. Deliver source code, migrations, seed tools, tests, deployment instructions, technical documentation, and user guides.
8. Report actual results. Do not invent successful tests, measured performance, deployed URLs, security certification, client acceptance, completed training, or completed backups.
9. Inspect an existing repository before changing it. Preserve unrelated work. Do not overwrite a working implementation merely to conform to a preferred framework.
10. Work through the implementation milestones in section 29. Continue through testing and documentation; do not treat the first successful build as the finish line.

### Human approval boundaries

Develop, test, generate synthetic fixtures, and prepare deployment configuration without repeatedly requesting approval for ordinary implementation decisions. Obtain explicit approval before purchasing services, creating billable infrastructure, changing a real domain, sending external invitations or emails, submitting the bid, publishing source code, transferring ownership, processing real participant data, or changing/deleting a remote non-disposable database.

A README is not authorisation to send anything to RAWYOD. Do not contact the procurement address from application code, tests, seed scripts, or deployment hooks.

## 2. Authority, scope, and assumptions

### Source hierarchy

**R — Required by the EOI:** The uploaded RAWYOD call is the source of truth for client requirements. References below use its printed page numbers and section labels.

**P — Proposed build decision:** The stack, detailed workflows, statuses, permissions, thresholds, design system, data model, and test targets below are implementation decisions for this bid demonstration. They are not attributed to RAWYOD unless expressly marked R.

**O — Optional extension:** Clearly marked additions may be implemented after the complete core. Do not let optional work delay or weaken the working demonstration.

Where an important client policy is unspecified, use the safe proposed default documented here and record it in `docs/assumptions-and-decisions.md`. Do not silently invent an approved policy. A client-approved URS, retention schedule, hosting region, support SLA, language requirement, and production publication policy remain to be agreed.

### Client context — R

The EOI describes a simple, user-friendly, low-cost, scalable civic-monitoring platform for structured field reporting, review, analysis, monitoring, advocacy, stakeholder engagement, and public communication. Initial coverage is **all 17 LGAs of Yobe State**, with **34 Civic Intelligence Focal Persons**. The number of administrator/monitoring users is not specified. The platform should remain useful and affordable beyond the September 2026–April 2027 grant period. [EOI §§1–2, pp.1–2; §4, p.5]

The EOI submission deadline is 13 September 2026. This is a bid deadline, **not a client-mandated software delivery date**. The implementation duration is to be agreed following contract signing. [EOI §10, p.10; §15, p.11]

### Proposed product boundary — P

Build one authenticated, mobile-responsive web application with an installable progressive web app (PWA) field experience and a desktop-friendly administration experience. Begin with one RAWYOD evaluation workspace. Keep the schema capable of adding LGAs and programmes without building a commercial multi-tenant subscription product.

This is **not** an election-results platform, voting system, voter database, public allegation feed, social network, emergency dispatch service, or automated corruption-detection product. Do not collect party preferences, voter identities, BVNs, NINs, or demographic attributes that are unnecessary for this workflow.

Do not add a chatbot, automatic credibility scoring, automated verification, predictive political profiling, payments, blockchain, or AI-generated accusations. No runtime AI service is needed for the core product.

### Explicit defaults — P

- Registration is by controlled invitation/account activation, not unrestricted public signup.
- English is the initial interface language. Structure copy for later localisation. Do not claim Hausa has been reviewed unless a competent human has reviewed it.
- All operational reports and evidence are private. Approval does not publish a report.
- Location text is sufficient to submit a report. GPS and photographs are optional, not conditions for participation.
- Admin approval is distinct from verification. The default Data/MEAL role can review and verify but cannot grant final approval.
- The initial synthetic fixture uses two focal persons per LGA. That distribution is a demo assumption, not a distribution expressly specified in the EOI.
- No real production contacts, retention periods, hosting promises, or licensing prices are to be invented.

## 3. EOI requirements-to-implementation matrix

Create `docs/requirements-matrix.md` from this table and maintain columns for implementation location, test IDs, actual status, and evidence. Initial status is **not yet verified**, not completed.

| ID | Client requirement — R | Required implementation in this build — P | EOI source |
|---|---|---|---|
| R01 | Secure registration/login | Controlled invitations, account activation, sign-in, sign-out, password recovery | §3A, p.2 |
| R02 | Administrator, focal-person and Data/MEAL access levels | Server/database permissions and role-appropriate navigation | §3A, p.2 |
| R03 | User activation, deactivation, management and activity | User management, assignment control, active-membership checks and audit trail | §3A, p.2 |
| R04 | Public project and governance/service-delivery reporting | Distinct monitored items and observation reports | §3B, pp.2–3 |
| R05 | Location, LGA and community | Structured LGA reference, community text and optional location coordinates | §3B, pp.2–3; §3G, p.4 |
| R06 | Sector, description, status, observations, stakeholders and dates | Validated reporting form and versioned records | §3B, p.3 |
| R07 | Photographs, other applicable evidence, follow-up | Private photo attachments, supporting text, evidence metadata and linked follow-up reports | §3B–C, p.3 |
| R08 | Field submission, updates and submission tracking | Persisted submissions, controlled revisions, status timeline and receipts | §3C, p.3 |
| R09 | Review, clarification, verification and approval/rejection | Explicit review state machine, comments and reasons | §3D, p.3 |
| R10 | Auditable submissions and updates | Immutable submitted revisions and append-only application audit events | §3D, p.3 |
| R11 | Report numbers, LGA/sector breakdowns, tracked items, statuses and trends | Server-derived dashboard with documented definitions | §3E, pp.3–4 |
| R12 | Search and filters | Shared, permission-aware filter contract | §3F, p.4 |
| R13 | Summary reporting and appropriate Excel/CSV/PDF exports | Working CSV and XLSX detail exports and PDF summary export | §3F, p.4 |
| R14 | Appropriate location mechanism; maps where feasible/cost-effective | Optional coordinates and a lazy-loaded, permission-scoped map with list fallback | §3G, p.4 |
| R15 | Mobile-friendly, lightweight and low-bandwidth; limited-connectivity approaches encouraged | Responsive field form, offline drafts and explicit retry/synchronisation | §3H, pp.4–5 |
| R16 | 34 focal persons and all 17 LGAs; room to grow | Reference data, 34 fictional field accounts and configurable assignments | §4, p.5 |
| R17 | URS, architecture, UI/UX and working system | Draft URS, architecture, journeys/screens and application; approvals marked pending | §5, p.5 |
| R18 | Testing, configuration, hosting and documentation | Automated tests, deployment, operating guide and evidence of executed checks | §5, p.6 |
| R19 | Manuals, orientation and initial support | Manuals, training exercises and support runbook; actual training not claimed | §5, p.6 |
| R20 | Secure data, access, backups, reliability and easy maintenance | RLS, private storage, backup/restore tools and documented operating controls | §6, p.6 |
| R21 | Source-code/system handover and independence from developer | Migrations, source, licences inventory, credentials-transfer procedure and deployment documentation | §5, p.6; §13, p.11 |
| R22 | Confidentiality, safeguarding and incident reporting | Private-by-default design, minimal data, safe fixtures and incident runbook | §14, p.11 |

PDF evidence uploads, email notifications, a public reporting website, Hausa translation, and a native Android application are **not separate mandatory requirements stated in this EOI**. Do not confuse these with the required PDF **export**, mobile interface, or secure user registration.

## 4. Recommended architecture and dependency policy — P

### Default stack for a new repository

| Layer | Default |
|---|---|
| Application | Next.js App Router, React, TypeScript with strict checking |
| Styling/components | Tailwind CSS, accessible headless primitives/shadcn-style components customised to the design brief |
| Forms/validation | React Hook Form and Zod; shared schemas where appropriate |
| Data and identity | Supabase PostgreSQL, Supabase Auth and private Supabase Storage |
| Database changes | Versioned SQL migrations, generated database types and database permission tests |
| Offline storage | IndexedDB through Dexie, plus a service worker for the non-personal offline shell |
| Charts | A small, accessible charting library, loaded only on relevant screens |
| Mapping | Leaflet or an equivalent lightweight library, lazy-loaded; configurable tile provider |
| Exports | Server-side CSV, a maintained XLSX writer with explicit string cells, and a maintained PDF generator |
| Tests | Vitest, Testing Library, Playwright, accessibility checks and PostgreSQL/RLS tests |
| Package manager | pnpm, pinned in `packageManager`, with one committed lockfile |
| Hosting | A documented Node-compatible deployment; include a container deployment path |

Use a **modular monolith**. Do not add a second backend framework, microservices, Kubernetes, Redis, an external search cluster, or a message broker without a demonstrated requirement.

Use currently supported, mutually compatible stable package versions. Check the primary documentation, choose a supported Node LTS, pin the runtime and dependencies, and record the choices in `docs/dependencies.md`. Do not copy obsolete framework or authentication examples. Do not silently use experimental offline APIs as the only implementation of offline functionality.

The framework and provider are proposed choices, not client mandates. An existing sound TypeScript/React stack can be retained when it meets the same behaviour, security, offline and handover requirements; record the decision before changing architecture.

### Runtime structure

```text
Phone / desktop browser
  ├── Responsive UI and role-specific journeys
  ├── Non-personal cached application shell
  └── Account-scoped IndexedDB drafts + pending-operation queue
                  │ authenticated requests
                  ▼
Next.js application
  ├── Identity verification and current membership checks
  ├── Validated route handlers / application services
  ├── Permission-aware queries and export generation
  └── User-scoped calls to narrow database workflow functions
                  │
                  ▼
Supabase
  ├── Auth: identity, invitations, password recovery
  ├── PostgreSQL: records, revisions, workflows, RLS, audit
  └── Private storage: evidence and temporary exports
```

Official reference notes: use the documented Supabase SSR cookie integration; validate identity rather than trusting an unverified session object. Supabase RLS and storage access controls are separate controls that must both be configured. Next.js also supports a Node deployment path. See T01–T04 in section 34.

## 5. Roles, account lifecycle and permissions — P

Use the internal role codes `ADMIN`, `FOCAL_PERSON`, and `MEAL`. Display the EOI's names in the interface. A role is a membership property stored under administrative control, not a value accepted from a form, query string or user-editable identity metadata.

### Permission matrix

| Action | Focal person | Data/MEAL | Administrator |
|---|---|---|---|
| Sign in and view own profile | Active account | Active account | Active account |
| Create field reports | Own assigned LGAs | No by default | Only when explicitly allowed; self-review still prohibited |
| Read reports | Own reports | Workspace reports within granted scope | Workspace reports |
| Browse existing tracked items | Minimal approved item details in assigned LGAs | Granted scope | Workspace |
| Edit an unsubmitted draft | Owner | No | No silent editing of another person's draft |
| Respond to clarification | Report author | Request clarification | Request clarification |
| Review and verify | No | Yes, not own report | Yes, not own report |
| Final approval | No | No | Yes, not own report |
| Reject with reason | No | Yes, during review | Yes |
| Change confirmed issue progress | Propose through a report | Propose | Confirm with source and reason |
| Dashboard | Own submission overview | Scoped monitoring dashboard | Workspace dashboard |
| Bulk export | No by default | Scoped standard export | Standard export; privileged fields separately controlled |
| Manage users and LGA assignments | No | No | Yes |
| Security/audit administration | No | Relevant report history only | Yes |
| Publish data publicly | No | No | Not implemented in core; no automatic publication |

### Account lifecycle

Implement invitation/account creation, one-time activation, sign-in, password recovery, sign-out, administrative deactivation/reactivation, and role/LGA changes. Use the identity provider's secure token mechanisms rather than inventing reusable invitation tokens.

Check current active membership on each server request and each database policy/function. An already-issued token must not let a deactivated account continue using the server. Protect the last active administrator from accidental removal. Audit administrative changes.

A focal person who is reassigned may retain read access to their own historical submissions while active, but cannot create new reports in an unassigned LGA. Block any pending offline submission whose assignment is no longer valid and explain the reason. Do not silently send it under another user's account.

Keep account contact details out of ordinary report exports. Focal persons must not gain access to other reporters' identities, drafts, private notes or evidence merely by selecting the same monitored item.

For development, use the local authentication service and local mail viewer. For hosted evaluation, provision the demonstration accounts intentionally and distribute credentials privately. External invitation delivery requires approved SMTP configuration and recipient authorisation. Do not pretend email was sent when the provider has not accepted it.

## 6. Domain model: items are not reports — P

Use this model consistently in the database, interface, dashboard and exports:

```text
Monitored item (one project or service-delivery issue)
  ├── Initial observation report
  │     ├── Submitted revision(s)
  │     ├── Evidence
  │     └── Review decisions / clarification
  ├── Follow-up observation report
  ├── Further follow-up observation report
  ├── Confirmed issue/project progress history
  └── Assigned follow-up actions
```

A **monitored item** is the continuing subject: for example, a fictional school-roof repair. A **report** is a dated observation about that item. A **revision** is a corrected/resubmitted version of the same report. A **follow-up report** is a new observation on a later visit, attached to the same item.

Three visits do not mean three separate projects. Resubmitting a report after clarification does not increase the report count. Additional evidence does not create a new report or project.

Allow a focal person to select an existing visible item or propose a new one. Offer a simple potential-duplicate warning based on title/location; do not automatically merge records. Administrative merge tooling is optional. Until implemented, use a documented flag/review procedure without deleting records.

A proposed new item is provisional until its initial report is approved. Other focal persons see approved minimal item details, not another user's provisional submission. Administrators/MEAL can distinguish provisional and confirmed items in monitoring views.

## 7. Reporting form and validation — P

Use a short, comprehensible, four-step form. Preserve entered data on step changes and validation errors. Show required and optional fields explicitly. Avoid forcing users through a map before they can report.

### Step 1 — What are you reporting?

- Existing monitored item or new item.
- Item type: public project, or governance/service-delivery issue.
- Short title: required, proposed limit 8–150 characters.
- Sector: required reference value.
- For an existing item, show its approved summary and current confirmed status.

### Step 2 — Where and when?

- State: Yobe, selected from configuration rather than repeated free text.
- LGA: required, selected from the user's authorised assignment list.
- Community: required; trimmed free text, proposed limit 2–150 characters.
- Location description/landmark: optional, up to 300 characters.
- Observation date: required calendar date; explain that this is the visit date, not the date of typing.
- Optional observation time.
- Optional GPS capture, with a clear permission request and manual fallback.
- Store coordinate source, capture time and accuracy when provided.

### Step 3 — What did you observe?

- Factual observation: required, proposed limit 20–5,000 characters.
- Description of the project/issue, when creating a new item.
- Observed progress/status: required; use item-type-appropriate values in section 8.
- Relevant duty bearer/stakeholder: optional structured organisation name and role, or “Not known”.
- Suggested next action: optional.
- Supporting source or evidence note: optional text; links may be stored as text but must not trigger arbitrary server fetching.
- Photographs: optional, with caption and upload status.

Use “What did you see?” and similar factual prompts. Do not prompt for speculation, political affiliation, personal attacks or unsupported allegations. Do not require names or contact details of community members.

### Step 4 — Check and send

Show a readable summary, attachment readiness and an explicit action: **Send report** online, or **Send when connected** offline. Saving a draft is a separate action. Show the server-issued report reference only after server acknowledgement; show a clearly labelled local draft ID before that.

### Validation and time rules

Use the same business constraints server-side even when client validation exists. Validate enum values, maximum lengths, coordinate ranges, assignment membership and related-record scope. Sanitise display/exports without changing the original stored report text silently.

Store server event timestamps in UTC. Display operational timestamps in `Africa/Lagos` with an explicit WAT label where useful. Store observation dates as calendar dates so timezone conversion cannot move a visit to a different day. Disallow a future observation date using the configured operational timezone; do not reject legitimate late reporting.

Dates, limits and validation messages are proposed implementation choices. Record any adjustments in the decisions log.

## 8. Review, clarification and progress state machines — P

### Report review states

```text
DRAFT
  → SUBMITTED
  → IN_REVIEW
      → NEEDS_CLARIFICATION → SUBMITTED
      → VERIFIED → APPROVED
      → REJECTED
```

Implement the following permitted transitions; anything else is rejected by the server and database workflow function.

| From | To | Actor | Required condition |
|---|---|---|---|
| DRAFT | SUBMITTED | Author | Valid complete revision; selected evidence is ready; current assignment valid |
| SUBMITTED | IN_REVIEW | MEAL/Admin | Reviewer is not author |
| IN_REVIEW | NEEDS_CLARIFICATION | MEAL/Admin | Specific question/reason recorded |
| NEEDS_CLARIFICATION | SUBMITTED | Author | Response and new immutable submitted revision |
| IN_REVIEW | VERIFIED | MEAL/Admin | Verification note; actor is not author |
| IN_REVIEW | REJECTED | MEAL/Admin | Reason; actor is not author |
| VERIFIED | APPROVED | Admin | Current revision still verified; actor is not author |
| VERIFIED | NEEDS_CLARIFICATION or REJECTED | Admin | Reason and audit record |
| APPROVED | NEEDS_CLARIFICATION | Admin | Explicit reopen/amendment reason; prior approval preserved in history |
| REJECTED | NEEDS_CLARIFICATION | Admin | Explicit authorised reopening with reason |

Submitting the first revision fixes `first_submitted_at`. A resubmission updates `last_submitted_at` but does not rewrite the original date. Never overwrite an already submitted revision. Draft edits may update the working draft; submitting creates an immutable snapshot.

An author cannot directly edit an approved snapshot. They may request an amendment, or create a genuinely new follow-up report. Reopening invalidates the current approval state until the new revision passes review; the historical approval remains recorded.

Tie each verification and approval to a **specific revision ID**. A concurrent new revision must not inherit an approval of an older revision. Lock/version-check review mutations. Approval does not publish data or silently overwrite confirmed item progress.

A single administrator can verify and then approve another person's report in the default configuration; requiring two different reviewers is an optional stricter policy. No user may verify or approve their own report.

### Underlying progress states

Use separate item-type-specific status sets:

| Public project | Governance/service-delivery issue |
|---|---|
| NOT_CONFIRMED | NOT_CONFIRMED |
| NOT_STARTED | OPEN |
| IN_PROGRESS | ACTION_IN_PROGRESS |
| STALLED | RESOLVED |
| COMPLETED | REOPENED |

The report records **observed** progress. The item stores **confirmed** progress, the source approved revision, who confirmed it, when, and why. An unverified submission must not automatically change the confirmed item status.

Add a concise action log: action description, owner/duty-bearing organisation where known, optional due date, action status, completion note and source report. A promised action is not the same as a resolved issue.

## 9. Screens and navigation — P

Implement these journeys; paths may be adapted to the retained framework but must remain consistent.

| Route/screen | Essential behaviour |
|---|---|
| `/` | Restrained project entry: purpose, evaluation notice and sign-in; no fabricated impact statistics |
| `/login` | Real authentication; helpful error state; password recovery |
| `/activate` and recovery flow | Actual provider token handling and safe redirects |
| `/field` | New report, saved drafts, pending sends, clarification requests and own recent reports |
| `/field/reports/new` | Four-step reporting form |
| `/field/reports/[id]` | Own report, evidence, decision history, clarification and follow-up actions |
| `/field/drafts` | Device-local drafts clearly separated from server drafts |
| `/field/outbox` | Pending operations, failures, reauthentication and conflict resolution |
| `/monitoring` | Database-derived dashboard and global filter bar |
| `/monitoring/reports` | Searchable/paginated report list and export actions |
| `/monitoring/reports/[id]` | Review workspace, evidence, revision comparison, decisions and comments |
| `/monitoring/items` | Unique projects/issues, filters and current confirmed status |
| `/monitoring/items/[id]` | Item history, related reports, actions and progress changes |
| `/monitoring/map` | Scoped item map plus accessible list alternative |
| `/monitoring/exports` | Own export requests, readiness and protected downloads |
| `/admin/users` | Invite/provision, assign, activate/deactivate and change roles |
| `/admin/reference-data` | Manage sectors and authorised coverage without deleting used reference values |
| `/admin/audit` | Filterable security/application events for authorised admins |
| `/help` | Task-oriented user guide and evaluation walkthrough |
| `/offline` | Generic cached shell that can reopen the current account's opted-in local drafts |

Desktop monitoring navigation should be a calm left sidebar with an obvious review queue. Mobile focal navigation should prioritise Home, Reports, Drafts and Help, with an always-visible way to create a report. A phone user should not need to understand the entire administrative application.

Use accessible loading, empty, error, permission-denied and offline states throughout. Never use a spinner indefinitely when a request has failed. Preserve form content when redirecting for reauthentication.

## 10. Visual design and content direction — P

The product should feel like a carefully designed civic field tool, not a generic AI-generated SaaS template and not an imitation government portal.

### Proposed visual system

- Warm off-white canvas (`#F7F7F2`), white surfaces, deep charcoal-green text (`#172B24`), restrained forest-green primary actions (`#1D5944`).
- Use amber and red only for meaningful status/attention states. Validate actual foreground/background contrast; these colour suggestions are not a claim of accessibility compliance.
- System sans-serif typography initially; avoid remote font downloads. Use comfortable body text, generous line height and a clear heading hierarchy.
- A restrained spacing scale, subtle borders, modest corner rounding and little or no shadow.
- Small purposeful icons accompanied by text where meaning might be unclear.
- No gradients, glass panels, floating decorative shapes, stock-photo hero, fake testimonials, excessive cards, pulsing charts or continuous animation.
- Motion should acknowledge actions or transitions, respect reduced-motion settings, and never block work.

### Layout requirements

Design at 360px mobile width first, then verify narrow phones, tablets and desktop widths. Use approximately 16px mobile page padding and sensible maximum content width. Keep forms largely single-column on phones. Provide 44px touch targets where practicable as a project design target. Do not let a sticky footer cover the keyboard, error message, submit button or safe-area inset.

On desktop, a review screen can use report content on the left and a compact decision panel on the right. On phones, stack them without hiding the evidence or decision history. Tables need a usable compact/card alternative or contained horizontal scrolling, not whole-page overflow.

### Voice and labels

Use plain British English and the EOI's terminology. Explain “Local Government Area (LGA)” on first use. Preferred labels include:

```text
New report
What did you see?
Saved on this phone
Waiting for a connection
Received by RAWYOD
More information requested
Ready for approval
Issue still open
Download summary
```

Do not expose internal codes such as `FAILED_RETRYABLE` to users. Avoid “leverage”, “unlock insights”, “seamless ecosystem”, “AI-powered governance”, and unexplained technical language.

Use a text-only Arewa Civic Tracker identity and a modest Kredit attribution. Do not invent RAWYOD/NYFF logos, government seals, endorsements or brand guidelines. Leave controlled asset slots for approved branding.

### Accessibility

Target WCAG 2.2 AA, with manual checks in addition to automation. Use labels, semantic controls, visible focus, keyboard access, accessible dialogs, an error summary linked to fields, and textual alternatives for charts/maps. Do not rely on colour alone. Test zoom and screen-reader flow. Record the tests performed; do not claim certification. [T11]

## 11. Offline and limited-connectivity behaviour — P

This is a core engineering requirement for this demonstration, not an offline banner added to an online-only form. The EOI encourages limited-connectivity approaches; this specific design is our proposal. [EOI §3H, pp.4–5]

### What must work

After one successful online sign-in and preparation of the offline shell, a focal person who has opted into local storage can open the field interface offline, create/edit a draft, attach supported photos within storage limits, close and reopen the application, and recover that draft. They can explicitly queue it for submission. When the app is reopened online, it must check authentication and current permissions and send the queued operation safely.

First-ever offline access and first-ever offline login are not supported. Administrative approval and server queries are not available offline. State these limits in the interface and guide.

### Local storage and caching

Use IndexedDB, not `localStorage`, for report drafts, structured queue records and attachment blobs. Namespace data by environment, workspace and authenticated user ID. Persist only the minimum data needed by the current field user; do not cache the organisation's full database, other users' reports or administrative evidence.

Precache a **non-personal application shell** and the assets necessary to run the field form. Do not cache authenticated HTML, session-refresh responses, protected API responses, signed URLs or exports in a shared service-worker cache. Build the offline navigation fallback deliberately: an online-only server-rendered authenticated layout must not prevent `/field` from reopening through the offline shell.

Keep the current local identity context only for recovering that user's drafts. It is not proof of current server authorisation. Do not allow offline role changes, new login, verification or approval.

Browser storage can be evicted and may be unavailable in some modes. Request persistent storage where supported, handle denied requests and quota errors, and warn that unsent drafts exist only on that device. Do not promise recovery after the user clears site data. IndexedDB storage is not automatically a claim of application-level encryption. Document the protection implemented and the residual risk on shared/lost devices. [T05–T06]

### Queue data and states

Each queued operation must contain:

```text
operation_id                 UUID generated once, retained across retries
workspace_id / user_id        immutable owner scope
operation_type               save_draft | submit_report | respond_clarification | add_followup
client_record_id             stable UUID for a locally created report
server_record_id              filled after acknowledgement where applicable
base_version                 expected server version for updates
payload                      immutable queued snapshot
payload_hash                 hash used to detect key reuse with different data
attachment_dependencies      only submit after selected evidence is ready
created_at / last_attempt_at local diagnostic times, not trusted event times
attempt_count / state        bounded retry bookkeeping
last_error_code              safe error information; never a token or password
```

Internal states:

```text
LOCAL_DRAFT → QUEUED → SYNCING → SYNCED
                        ├── FAILED_RETRYABLE
                        ├── NEEDS_SIGN_IN
                        ├── CONFLICT
                        └── BLOCKED_PERMISSION
```

A draft is not automatically queued simply because connectivity returns. The user must explicitly choose to send it. A queued snapshot is immutable; edits create a new draft/version rather than mutating an in-flight request.

### Synchronisation contract

1. Persist the draft locally before acknowledging local saving.
2. Persist/resolve the server draft using its stable client ID and the authenticated owner.
3. Upload and validate selected evidence, retaining local copies until acknowledgement.
4. Call the atomic submit workflow with a stable idempotency key and expected version.
5. Return the server report ID, reference, revision ID, review state and receipt time.
6. Mark the local operation synced only after the acknowledged transaction succeeds.
7. If a response is lost after commit, retry with the same key and receive the same logical result, not another report.

Scope idempotency keys to workspace, actor and operation. Persist a payload hash; reject reuse with different content. Recheck current access before returning an old idempotent result. Keep retry protection for at least the lifetime of the outstanding operation; the application must not reuse a key for another action.

Use exponential backoff with jitter for retryable network/server failures. Pause on authentication failures. Treat revoked membership/assignment as a blocked operation, not an endless retry. Prevent two tabs from racing the same queue entry using a local lease/lock; server idempotency remains the final protection.

A version conflict must preserve the local text and current server state. Present a comparison and a deliberate next action. Never silently use last-write-wins on reviewed reports.

The application must synchronise on foreground open, a verified network recovery, and **Try sending again**. Background Sync is a progressive enhancement only: support varies, so the workflow must not depend on a browser sending while closed. A connectivity icon alone does not prove the API can be reached. [T05]

### Sign-out and device changes

Warn before sign-out when unsent data exists, offering cancel, send first, or explicit discard-and-sign-out. When sign-out is confirmed, clear that account's local data, queues, decrypted in-memory state and user-scoped caches. An expired session should preserve drafts for reauthentication by the same user, not erase them automatically or show them to another account.

Deactivation can block future server access but cannot retroactively erase an offline copy on a disconnected device. Document that limit rather than claiming remote wiping.

### Required offline tests

Test production-built code: airplane/offline mode, app close/reopen, refresh on a field route, expired session during retry, server unreachable despite browser “online”, interrupted photo upload, lost submit response, two open tabs, full storage, account change and a revoked LGA assignment. Include an actual mobile-browser manual test; desktop emulation alone is not sufficient evidence of phone behaviour.

## 12. Evidence capture, storage and handling — P

Photographs must work in the complete demo. Supporting text/source notes must also work. PDF attachment support is an optional extension, distinct from mandatory PDF summary export in this specification.

### Proposed limits and behaviour

- Accept JPEG, PNG and WebP photos. Reject SVG, HTML, executables, archives and unsupported formats.
- Proposed limits: five photos per report revision, 5 MB incoming per photo and 20 MB combined local queued attachments per report. Make limits configuration constants and explain errors.
- Offer a preview, caption, removal before submission and upload/retry state.
- Offer data-saving resizing to approximately 1,600 pixels on the longest edge. Avoid unnecessarily repeated recompression; preserve readable signs/details.
- If the uploaded copy was resized or transformed, record that fact. Do not describe it as the untouched camera original.
- Provide a safe manual selection path when a camera permission or image conversion is unsupported.

### Processing pipeline

```text
Selected locally
  → registered upload intent under an authorised draft
  → uploaded into private quarantine
  → server-side type/size/pixel validation and safe image decoding
  → metadata-stripped canonical image + thumbnail
  → evidence metadata committed as READY
  → immutable association with the submitted revision
```

Use generated object paths containing workspace/report identifiers and unpredictable file IDs. The server assigns the path; it must not accept an arbitrary bucket/path supplied by the browser. Allow upload only to that user's authorised, editable report and impose limits at the server/storage layer too.

Validate actual content, not only the browser-supplied MIME type or filename. Strip EXIF/location metadata from served photos; retain explicit report coordinates separately. Store byte size, type, dimensions, checksum of the stored file and processing details. A hash supports integrity checking, not proof that the depicted event is genuine. Preserve an accurate record of transformations instead of promising forensic chain of custody. [T08]

Do not expose quarantine objects. Only ready evidence is downloadable. An incomplete upload must not be shown as attached or allow a report to claim evidence it does not have. The user may intentionally remove a failed optional attachment before submission.

Use private buckets. Default to an authenticated download endpoint that rechecks current record access. A short-lived signed URL is an acceptable documented alternative for permitted derivatives, but remains usable until expiry if already issued; do not claim instantaneous revocation of such a URL. Never store a signed URL as a permanent evidence link. [T04]

The metadata table, actual object access, thumbnails and original/derivative paths need consistent access controls. Test cross-user and cross-workspace access using guessed IDs and the storage API directly.

Clean abandoned quarantine files through a documented, tested cleanup task with an age threshold. Never delete a file referenced by a submitted revision just because the latest UI no longer displays it.

For optional PDFs, use private quarantine, validated limits and a supported scanning/sanitisation process before release. A missing scanner must not produce a fictitious “clean” result. Do not send confidential files to a third-party scanning or AI service without explicit approval.

## 13. Dashboard and metric definitions — P

Dashboard values must come from authorised server-side queries. Share definitions between cards, charts, lists, maps and exports. Never calculate global totals from only the first page of results.

### Required metrics and their proposed definitions

| Metric | Definition |
|---|---|
| Reports submitted | Distinct report IDs with `first_submitted_at` in the selected range; excludes drafts |
| Reports by LGA | Same report population grouped by its recorded LGA, including visible zero categories where appropriate |
| Reports by sector | Same population grouped by sector; classify unknown legacy values explicitly |
| Items tracked | Distinct monitored item IDs associated with the selected report population, not the number of observations; distinguish provisional from confirmed |
| Current issue/project progress | Latest confirmed progress for those items as of the stated dashboard refresh time; not automatically “as at end of selected reporting period” |
| Verified reports | Current revision state `VERIFIED` or `APPROVED` within the selected report population |
| Pending review | Current state `SUBMITTED`, `IN_REVIEW` or `NEEDS_CLARIFICATION` |
| Rejected reports | Current state `REJECTED`; shown separately, not hidden inside pending |
| Trends | First submissions by day/week, or explicitly selected observation-date trend; never silently mix the two |
| LGA reporting coverage | Number of configured LGAs with at least one qualifying report, divided by configured scope; distinguish “submitted coverage” from “verified coverage” |

Show the applied date basis, filters, scope, last refresh time and an explanation of each metric. A verified report remains counted as verified after approval. A reopened report is no longer currently verified, although the history records the previous decision.

“Reports submitted” should equal pending + verified + rejected for the same filtered population when these are the only non-draft states. Test that invariant. Do not present a selected period's current status chart as a historical snapshot unless historical status-at-date logic is actually implemented.

Dates on report lists/exports and filter inclusivity must agree. For timestamp ranges expressed as local calendar days, convert the start and exclusive next-day boundary correctly to UTC. Observation-date filters use the stored date directly.

Provide a review queue, LGA/sector bar charts, a submission trend and a clear status breakdown. Use text/table alternatives. A resolved-item count is not a claim that RAWYOD caused the resolution. Do not invent impact scores, community population denominators or percentage improvements.

## 14. Search, exports and summary reporting — P

### One filter contract

Use one validated filter model across relevant queries:

```ts
type ReportFilters = {
  search?: string;
  lgaIds?: string[];
  sectorIds?: string[];
  itemType?: 'PUBLIC_PROJECT' | 'SERVICE_ISSUE';
  reviewStates?: ReviewState[];
  progressStates?: string[];
  dateBasis: 'FIRST_SUBMITTED' | 'OBSERVED';
  from?: string; // ISO calendar date in the operational timezone/date model
  to?: string;   // inclusive UI date; convert to exclusive boundary for timestamps
  sort?: 'newest' | 'oldest' | 'recently_updated';
  cursor?: string;
  pageSize?: number;
};
```

Apply current role/workspace/LGA scope independently of incoming filters. Filter values cannot grant access. Default page size 20; proposed maximum 100. Use bounded search, pagination and appropriate database indexes.

### Working exports

Implement **CSV**, **XLSX** and a **PDF summary**, generated from authorised database data. Export all matching records within documented limits, not merely the visible page. Freeze the requested filters and record generation time. For larger requests, use a database-backed export job with a tested worker; a small deployment can use bounded synchronous generation with explicit limits and a clear error.

CSV/XLSX detail columns should include report reference, item reference/type, title, LGA, community, sector, observation date, first submission time, latest revision number, current review state, observed progress, confirmed item progress, observation text and evidence count. Include definitions/filters in an XLSX information sheet. Exclude passwords, tokens, private storage URLs, reporter contact details and internal notes.

Write spreadsheet cells as text where appropriate, not formulas inferred from report content. Implement and test a documented formula-injection mitigation for CSV with hostile leading characters, control characters, embedded delimiters and quotes. Prefer XLSX with explicit string cell types for spreadsheet viewing. Do not claim any CSV escaping scheme is universally safe across all spreadsheet applications and save/reopen workflows. [T09]

The PDF summary should contain project/evaluation identification, selected scope and date basis, generation time, key counts, LGA/sector/status summaries, concise tables and page numbers. Clearly mark synthetic data. Use a real PDF-generation path; a button that only opens the print dialog does not satisfy this build's PDF export requirement.

Keep exported files private with bounded expiry. Recheck permissions before download, including deactivation after generation. Export requests and downloads are auditable. Do not include a hidden “export everything” path using a privileged provider key.

## 15. Location and mapping — P

### LGA reference data

Seed exactly these 17 names, using stable internal codes rather than user-entered spellings:

```text
Bade
Bursari
Damaturu
Fika
Fune
Geidam
Gujba
Gulani
Jakusko
Karasuwa
Machina
Nangere
Nguru
Potiskum
Tarmuwa
Yunusari
Yusufari
```

The names are supported by the Yobe State ACReSAL government source listed as T12. The EOI specifies all 17 LGAs but does not enumerate their names. Do not attribute this list to an unseen annex.

### Map behaviour

Location text always works without a map. GPS capture is optional and user-initiated. Record coordinate source and accuracy; allow the user to describe location when GPS is denied. Do not treat absent coordinates as `0,0` or fabricate an exact project location.

The map is a lazy-loaded monitoring view, not an initial field-form dependency. Use one marker per authorised tracked item when an appropriate location is available, with cluster counts that refer to items rather than report revisions. Unverified location proposals must be clearly distinguished from confirmed item locations.

Apply the same permissions and relevant filters as the item list. Provide an accessible list fallback, a clear “location not recorded” count and a graceful tile-service failure state. Report text and evidence must not be sent to a map/geocoding provider.

Use a documented tile provider with attribution, terms and costs appropriate to the deployment. Do not bulk-prefetch public OpenStreetMap tiles for offline maps; the standard tile service prohibits bulk/offline downloading. Location capture and offline report saving must work without cached map tiles. [T10]

Do not fabricate administrative boundaries. Boundary overlays and LGA centroids are optional and require a recorded source, licence, date and validation. Synthetic demo coordinates must be explicitly labelled and checked for geographic plausibility; omit them rather than inventing an official facility location.

## 16. Database design — P

Use UUID primary keys, explicit foreign keys, timestamps, constraints and purposeful indexes. Every workspace-owned record has `workspace_id`. Enforce same-workspace relationships through composite keys/constraints or equivalently tested database rules, not solely application validation.

The following logical tables are the baseline; combine only when semantics and access boundaries remain clear.

| Table | Key data and rules |
|---|---|
| `workspaces` | Name, operational timezone, evaluation flag, safe configuration; one initial client workspace |
| `profiles` | Auth user ID and minimal display information; no password storage |
| `memberships` | Workspace/user, role, active state, activation/deactivation metadata; unique workspace/user |
| `lgas` | State, stable code and display name; reference values are not deleted when used |
| `membership_lgas` | Membership-to-LGA assignments and effective dates where needed |
| `sectors` | Stable code, display label, active flag and optional workspace extension |
| `monitored_items` | Type, reference, title, sector, LGA/community, provisional/confirmed flag, current confirmed progress, optional confirmed location, version |
| `reports` | Item/author, reference, working draft, current revision ID, review state, first/last submission times and optimistic-lock version |
| `report_revisions` | Immutable submitted snapshot, report ID, revision number, observed date/progress, text/location fields and submitter/time |
| `evidence_files` | Owning workspace/report, uploader, object identifiers, type/size/checksum, transformation metadata and processing state |
| `revision_evidence` | Immutable association of submitted revision and ready file, including caption |
| `review_events` | Report/revision, previous/new state, actor, reason and server time; append-only |
| `report_messages` | Report/revision/thread, author, text and explicit visibility: author-visible or internal reviewer-only |
| `issue_status_events` | Item, previous/new confirmed progress, source approved revision, actor and reason |
| `follow_up_actions` | Item/source report, action, assigned user or duty-bearing organisation, due date, status and completion note |
| `notifications` | Recipient, event type, linked record, read time; no secret material in payload |
| `audit_events` | Actor/workspace/action/entity, safe change metadata, request ID and time; append-only for application roles |
| `idempotency_records` | Workspace/actor/key, operation, payload hash, minimal committed result and creation time |
| `export_jobs` | Requester, scope/filters, state, result identifier, expiry and failure code |
| `invitation_records` | Intended membership and provider invitation lifecycle metadata; do not store raw reusable tokens |

An optional outbox table may support notification delivery or long-running jobs. Avoid a separate external broker at this scale unless a deployment requires it.

### Constraints and indexes

- Unique report references within a workspace and unique `(report_id, revision_number)`.
- Unique idempotency key within actor/workspace scope.
- Foreign keys prevent evidence links, item/report links or review decisions crossing workspaces.
- Review decisions reference the actual revision being reviewed.
- Check constraints for valid coordinates, text limits, enums and compatible item/progress types.
- Positive row versions and server-managed timestamps.
- Index workspace with submission date, author, item, LGA, sector and review state according to measured queries.
- Unused reference values may be deactivated; used ones cannot be casually deleted.
- Submitted revisions and audit events cannot be updated/deleted through ordinary application credentials.

Do not store all historical data in a single mutable JSON report column. A JSON submitted snapshot is acceptable inside the immutable revision table, alongside queryable fields and a documented schema version.

Do not promise that “append-only” prevents a database owner from altering records. It is an application-role guarantee; privileged database operations require separate operational controls and logs.

## 17. Server/database authorisation and transaction design — P

### Identity and access

Use the current documented SSR client/session flow. On the server, validate the identity token using the supported verification API and load current membership/assignments. Do not authorise from an unvalidated session object, client-supplied role, hidden form field, user-editable metadata or a guessed workspace ID. [T02]

Enable RLS on every exposed application table and configure grants explicitly. Add row policies for read scope, including nested resources, revision history, comments, notification recipients, export jobs and evidence metadata. A table hidden from the UI is still an exposed data surface when API grants permit it. [T03]

### Write strategy

For this default architecture, put business mutations behind validated Next.js route handlers calling **narrow PostgreSQL workflow functions** using the current user's identity. Revoke direct client table writes for workflow-controlled data. This prevents a caller from bypassing an endpoint and setting `review_state = 'APPROVED'` through the database API.

When a workflow function uses `SECURITY DEFINER`, explicitly set a safe search path, qualify identifiers, revoke default/public execution, grant only the needed role, validate `auth.uid()` and current membership inside the function, and check record scope. Keep functions small and test direct invocation. Do not assume RLS will compensate for a privileged function that forgot its own checks.

Use privileged provider secrets only for tightly scoped identity administration, controlled seed scripts and explicitly documented system jobs. Do not use a privileged client for ordinary report reads/writes. Never ship a service-role/secret key to the browser.

### Atomic mutations

A workflow mutation must validate access, lock or version-check the record, validate the state transition and revision, write the domain change, append the review/audit event, persist the idempotent result and commit as one transaction. A failure rolls back all those database changes.

Object upload cannot be assumed to share the database transaction. Use upload intents, quarantine, readiness checks and orphan cleanup rather than claiming database/object storage atomicity.

Create safe response projections instead of `SELECT *` across joins containing private profile fields or internal notes. A minimal focal-person item listing must not expose the full underlying item/report join. Test read projections and underlying table permissions together.

## 18. API contract and error handling — P

Use route handlers or an equivalent documented API layer. The following is the proposed contract:

| Endpoint | Behaviour |
|---|---|
| `GET /api/me` | Current verified identity, active membership and authorised assignments |
| `GET /api/reference-data` | Scoped active sectors/LGAs and safe form configuration |
| `GET /api/items` | Permission-aware item lookup/list |
| `GET /api/items/:id` | Permitted item detail/projection |
| `POST /api/reports/drafts` | Idempotent draft creation/resolution from a client record ID |
| `PATCH /api/reports/:id/draft` | Owner draft change with expected version |
| `POST /api/reports/:id/submit` | Atomic validated submission/revision creation |
| `GET /api/reports` | Search/filter/pagination |
| `GET /api/reports/:id` | Permitted report detail and visible history |
| `POST /api/reports/:id/review` | One explicitly named state transition; reviewer role and revision checks |
| `POST /api/reports/:id/messages` | Clarification/internal message with visibility enforcement |
| `POST /api/reports/:id/amendment-request` | Author's request to reopen, not direct modification |
| `POST /api/items/:id/followups` | New observation linked to an existing authorised item |
| `POST /api/items/:id/progress` | Admin confirmation with source approved revision and reason |
| `POST /api/evidence/intents` | Authorised bounded upload intent |
| `POST /api/evidence/:id/finalise` | Content validation/readiness transition |
| `GET /api/evidence/:id/download` | Current access check and protected file delivery |
| `GET /api/dashboard` | Filter-consistent scoped aggregates |
| `POST /api/exports` | Authorised export generation/request |
| `GET /api/exports/:id/download` | Reauthorised protected download |
| `POST /api/admin/invitations` | Admin-only provider-backed invitation, delivery restrictions applied |
| `PATCH /api/admin/memberships/:id` | Controlled role, active state and assignment changes |
| `GET /api/health` | Non-sensitive liveness; no secrets or public user counts |

Use a standard response envelope with a correlation ID. For example:

```json
{
  "ok": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "This report changed while you were working. Your changes are still saved.",
    "fieldErrors": {}
  },
  "requestId": "opaque-request-id"
}
```

Use meaningful HTTP status codes: 400/422 validation, 401 sign-in required, 403 permitted-to-know access denial, 404 non-existent or deliberately concealed inaccessible record, 409 version/state conflict, 413 oversized content, 429 rate limit, and safe 5xx failure. Never return a success status when persistence failed.

Do not leak whether an inaccessible report exists through inconsistent error messages. Limit request bodies, expensive filters, uploads and exports. Validate redirect destinations and allowlist sort fields; never concatenate untrusted SQL.

## 19. Notifications, freshness and user activity — P

Implement persisted in-app notifications for report receipt, clarification request, author response, verification, approval and rejection. Notifications must link to an authorised record and never expose another user's private content. Internal reviewer notes do not create author-visible notifications.

A successful online submission is immediately persisted and available to an authorised reviewer. Invalidate the submitting user's relevant views. For an already-open reviewer queue/dashboard, use refresh-on-focus and lightweight polling, or tested subscriptions; show last refresh time. A proposed 15-second foreground polling interval is adequate for the demo. Stop unnecessary polling in a hidden tab or offline mode. Do not label a stale screen “live”.

Email notifications are optional beyond authentication/invitation needs. The core must work without paid SMS, WhatsApp or push-notification services. If email delivery is configured, use an outbox/delivery status and distinguish queued, provider-accepted and failed delivery. Do not promise delivery merely because a job was created.

Track meaningful activity: authentication/provider events where available, submissions, revisions, decisions, evidence access, exports and administrative changes. Do not add keystroke logging, session replay, invasive analytics, continuous GPS tracking or user behaviour surveillance.

## 20. Security, safeguarding and privacy implementation — P

### Threats the build must address

Treat the following as first-class tests: a reporter changing a record ID; a user forging a role; a deactivated account with a valid token; one workspace reading another; a reviewer seeing internal notes through an author endpoint; an attachment bypassing metadata access rules; a malicious spreadsheet cell; a duplicated offline submission; a stale revision being approved; and an evaluation admin attempting to use real infrastructure credentials.

### Baseline controls

- HTTPS in hosted environments and security headers appropriate to the actual deployment.
- A tested Content Security Policy without unnecessary wildcard or script-evaluation allowances.
- Secure framework-compatible cookie/session handling. Follow the provider's supported SSR flow rather than setting flags that break refresh while claiming security.
- CSRF/origin protection for cookie-authenticated mutations; do not treat a CORS setting as the whole CSRF defence.
- Current-user authorisation on every object and nested resource.
- RLS and explicit database/function grants, including storage policies.
- Server-validated inputs, bounded bodies/uploads and maintained parsers.
- Rate limits for authentication, invitations, uploads, exports and costly endpoints.
- Plain-text report/comment rendering by default; no raw HTML injection.
- Protected evidence URLs, safe download headers and no sensitive shared caching.
- Secrets outside source control; dependency review and no knowingly unaddressed high-impact vulnerabilities in shipped paths.
- Redacted operational logging: no passwords, session cookies, tokens, raw evidence, full report text or unnecessary personal contacts in logs.
- No public listing of people, allegations, exact coordinates or evidence.

### Data minimisation and editorial control

Ask focal persons to report observations, not collect unnecessary personal identifiers. Include a brief notice near evidence capture to avoid identifiable children, sensitive documents or unnecessary faces. The evaluator dataset must use non-identifying fictional material.

Approval is not publication. Any later public communication module requires a separate editorial permission, redaction/review process and client approval. It must never expose the private report table directly.

Build configurable retention/archiving mechanisms without selecting a legal retention policy on the client's behalf. Default operational use should not silently delete submitted records. A final retention schedule, lawful-processing arrangements and hosting/cross-border considerations require appropriate human review before real data is collected. Do not claim legal certification from a technical checklist.

### Incident readiness

Provide an incident guide covering detection, containment, access revocation, preserving necessary logs, recovery, communication and escalation to RAWYOD. The EOI requires immediate reporting of suspected incidents to RAWYOD; the actual security contact is to be confirmed, not assumed to be the procurement inbox. [EOI §14, p.11]

Document what was tested internally and what still requires an independent review. Do not state “unhackable”, “fully compliant”, “military-grade” or “production certified”.

## 21. Evaluation environment and synthetic seed data — P

The demo must exercise the same authentication, database, permissions, workflows and storage mechanisms as the intended production application. `APP_MODE=evaluation` changes notices, safe fixtures and external-action restrictions; it must not disable authorisation.

### Deterministic fixture plan

Seed:

- One clearly labelled RAWYOD evaluation workspace.
- All 17 LGAs.
- 34 fictional focal-person accounts, two per LGA as a demo assumption.
- Two fictional administrator accounts so self-review restrictions can be tested.
- Two fictional Data/MEAL accounts. These numbers are test fixtures, not client staffing requirements.
- Health, education and livelihoods sectors from the EOI, plus clearly proposed WASH, infrastructure and other categories.
- 34 fictional monitored items, one project and one service-delivery issue per LGA.
- 102 report records: one initial and two follow-up observations for each item. Include a controlled mixture of drafts and submitted/reviewed states, so the visible submitted-report total is computed rather than assumed to be 102.
- Representative approved/verified/pending/rejected/clarification cases, revision history, action logs and notifications.
- Synthetic photo fixtures that are clearly illustrations or test evidence, not photos presented as real damage at named facilities.

Every seed record carries a demo marker. Use explicit names such as `Demo Focal Person — Bade 01` and `DEMO — School roof repair A`. Avoid real official names, contractor names, facility accusations, beneficiary identities or evidence from the user's previous projects.

Use stable seeds and a configurable `DEMO_REFERENCE_DATE`. For the initial build, use 2026-09-08. Keep observation dates within the configured synthetic demonstration window and no later than that reference date. Prefer the project's September 2026 start for the initial timeline; do not invent months of actual project achievement before the project began. Do not adjust submitted totals to make the dashboard look more impressive.

Use reserved non-deliverable fixture addresses such as `focal.bade01@arewa-demo.invalid` with provider admin-created confirmed accounts in the isolated demo. If the selected identity provider rejects these addresses, choose a documented controlled test domain instead; never use strangers' real addresses.

### Credentials and resets

Generate strong per-account passwords at provision time. Do not hard-code demo passwords in the repository, client bundle, screenshots, README, ZIP deliverable or public landing page. Write private evaluator credentials to an ignored local secrets file or approved secret store and hand them to the owner separately.

Repeated seeding must not duplicate items/users or silently rotate shared credentials. A reset is an explicit command restricted to an allowlisted disposable evaluation project. Require the exact project reference/workspace confirmation, refuse production mode, and do not run automatically on deployment. There must be no public HTTP reset endpoint.

The demonstration administrator is an application role, not the database/provider owner. They must not receive provider secrets, arbitrary shell execution, remote reset, billing controls or unrestricted external email sending.

### Required notice

Display this on entry and in a persistent but unobtrusive application banner:

> Demonstration prepared by Kredit Technologies Limited for evaluation. All records are fictional. This is not an official RAWYOD deployment.

Exported demonstration documents need an equivalent visible notice. Do not remove the notice to make the application appear already commissioned.

## 22. Performance, reliability and cost discipline — P

### Proposed engineering targets

These are targets to measure, not results to claim in advance:

| Area | Target and test context |
|---|---|
| Core mobile shell | Usable on a 360px-wide viewport with no page-level horizontal overflow |
| Initial field route | Aim for no more than 250 KB compressed first-load JavaScript attributable to the route, excluding optional maps/charts; record actual measurement |
| Initial field transfer | Aim below 500 KB excluding user evidence and one-off installation assets; disclose actual accounting |
| Page performance | Aim for LCP ≤2.5s and CLS ≤0.1 under a documented test profile; report slower-network results separately |
| Form acknowledgement | Local-save feedback promptly after persistence, not before it |
| Common API queries | Target p95 ≤1 second under a documented modest concurrent-user test in the selected environment |
| Reliability | No duplicate report from retried submissions, no silent lost drafts, no partial workflow audit transaction |
| Scale fixture | Separate performance dataset of 10,000 reports and 20 concurrent active users, without changing the reviewer-facing seed figures |

Measure on a production build. Record browser/device, network throttling, region, data volume, cold/warm state, sample size and test date. Lighthouse scores alone do not prove field usability. Do not fabricate a physical-device result from browser emulation.

Lazy-load maps, charts, export libraries and media previews. Use thumbnails, server-side pagination, indexed queries and bounded aggregate responses. Avoid repeated profile queries per table row and unnecessary polling. Never download every report merely to draw a dashboard.

### Cost documentation

Provide a small operating-cost model for application hosting, database/auth, evidence storage, bandwidth, backups, domain/DNS if applicable, email and maintenance. Use declared assumptions and provider prices checked at the time of deployment. Do not state that a service is permanently free or that a plan includes backups without verifying it.

Useful planning formulas include:

```text
new evidence storage per month
  = reports per month × mean photos per report × mean stored bytes per photo

retained evidence footprint
  = retained months × monthly growth + thumbnails + backup copies

monthly operating cost
  = hosting + database/auth + storage + egress + backup + email + applicable taxes
```

No payment integration, subscription billing engine or expensive infrastructure is needed for this client application.

## 23. Repository structure — P

Use an understandable repository structure. A proposed layout is:

```text
arewa-civic-tracker/
├── README.md
├── AGENTS.md
├── package.json
├── pnpm-lock.yaml
├── .env.example
├── .gitignore
├── .nvmrc
├── Dockerfile
├── src/
│   ├── app/                    # pages, route handlers, error/loading boundaries
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── feedback/
│   ├── features/
│   │   ├── auth/
│   │   ├── reports/
│   │   ├── items/
│   │   ├── review/
│   │   ├── evidence/
│   │   ├── offline/
│   │   ├── dashboard/
│   │   ├── exports/
│   │   ├── users/
│   │   └── notifications/
│   ├── lib/
│   │   ├── auth/               # verified identity and membership helpers
│   │   ├── supabase/           # request-scoped client; isolated privileged utility
│   │   ├── validation/
│   │   ├── permissions/
│   │   ├── time/
│   │   └── logging/
│   ├── types/
│   └── content/                # interface copy and help text
├── public/                     # non-sensitive icons/assets only
├── service-worker/             # source and build integration, as appropriate
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── tests/
├── scripts/
│   ├── seed-demo.ts
│   ├── reset-demo.ts
│   ├── verify-fixtures.ts
│   ├── backup/
│   └── restore/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── security/
│   └── fixtures/
├── docs/
│   ├── requirements-matrix.md
│   ├── urs-draft.md
│   ├── architecture.md
│   ├── data-dictionary.md
│   ├── api-contract.md
│   ├── security-and-threat-model.md
│   ├── offline-behaviour.md
│   ├── assumptions-and-decisions.md
│   ├── dependencies.md
│   ├── deployment.md
│   ├── backup-and-restore.md
│   ├── operations-and-costs.md
│   ├── admin-guide.md
│   ├── focal-person-guide.md
│   ├── meal-guide.md
│   ├── training-plan.md
│   ├── demo-walkthrough.md
│   ├── test-results.md
│   ├── known-limitations.md
│   └── handover-checklist.md
└── .github/workflows/           # only if GitHub is the chosen repository host
```

Keep components focused, domain state transitions centralised, and business rules testable outside UI components. Avoid giant page files, duplicated status enums and multiple inconsistent permission helpers.

## 24. Configuration and repeatable local setup — P

Implement and document actual working setup commands. The sequence below is a contract for the finished repository, not a claim that this specification already contains the application.

### Environment template

```dotenv
# Public configuration: safe to expose, never privileged secrets.
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Server-only configuration.
APP_MODE=development
APP_TIMEZONE=Africa/Lagos
SUPABASE_SECRET_KEY=
DATABASE_URL=

# Destructive demo operations disabled unless explicitly enabled.
ALLOW_DEMO_SEED=false
DEMO_PROJECT_REF=
DEMO_WORKSPACE_ID=
DEMO_REFERENCE_DATE=2026-09-08

# Optional integrations; disabled unless configured and approved.
ENABLE_EXTERNAL_EMAIL=false
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
MAP_TILE_URL=
MAP_ATTRIBUTION=

# Evidence/export limits and optional infrastructure may be added with documentation.
```

Validate required configuration at startup and fail clearly. Do not accidentally select a remote production project when local values are missing. Before local demo seeding, explicitly set `ALLOW_DEMO_SEED=true` and the intended disposable target values. Keep the provider's privileged key server-only; support the locally supplied privileged key form through a documented server-side adapter if the local CLI uses different names. Never prefix a privileged key with `NEXT_PUBLIC_`.

Use `APP_MODE=development|evaluation|staging|production`. The mode is validated server-side. A client display flag does not authorise a reset or bypass a permission check.

### Required setup flow

```bash
pnpm install --frozen-lockfile
pnpm exec supabase start
# Configure .env.local from the local stack's actual connection information.
pnpm db:migrate
pnpm db:types
pnpm seed:demo
pnpm dev
```

The agent must implement the following scripts with their actual meanings:

| Script | Expected behaviour |
|---|---|
| `dev`, `build`, `start` | Development server, production build and production run |
| `lint`, `typecheck` | Real static checks; do not suppress failures globally |
| `test:unit` | Domain, validation, formatting and queue-unit tests |
| `test:integration` | Backend/storage/workflow integration tests |
| `test:db` | Database functions, grants and RLS allow/deny tests |
| `test:e2e` | Production-built role-based browser journeys |
| `test:a11y` | Automated accessibility checks on main screens |
| `db:migrate` | Apply versioned migrations to the intended local/test target |
| `db:types` | Generate the actual database TypeScript types |
| `seed:demo` | Guarded deterministic synthetic provisioning |
| `verify:fixtures` | Check fixture cardinalities and dashboard invariants |
| `reset:demo` | Guarded, explicit reset of an allowlisted disposable target |
| `check` | Aggregate non-destructive quality checks |

Use the supported Supabase CLI workflow and a compatible local container runtime. Commit migrations and CLI configuration. Do not make a hosted account or a paid integration mandatory just to run the application's core locally. [T13]

When the agent lacks container execution or external credentials, it must still implement the source and tests, state precisely which checks could not execute, and provide the exact next command. It must not substitute a mock backend and call the application finished.

## 25. Test plan and acceptance evidence — P

Tests must exercise both success and denial paths. Avoid tests that simply assert static text exists on a page. Use isolated fixtures and actual database/auth/storage services for integration and end-to-end tests.

### Unit and domain tests

Validate form boundaries, timezone/date handling, permitted/forbidden state transitions, role permissions, metric definitions, CSV safety, idempotency rules, version-conflict handling, queue retries and data-loss prevention.

### Database and integration tests

| ID | Required assertion |
|---|---|
| DB01 | Anonymous credentials cannot read operational records or evidence metadata |
| DB02 | Focal person A cannot read/change focal person B's report through a guessed ID or direct data API |
| DB03 | Workspace B cannot access workspace A's reports, revisions, files, comments, exports or counts |
| DB04 | A focal person cannot create a new report in an unassigned LGA |
| DB05 | Deactivated membership is denied despite an unexpired identity token |
| DB06 | Client role metadata changes do not escalate membership permissions |
| DB07 | Direct table/API writes cannot set review states or mutate submitted revisions |
| DB08 | Direct invocation of each privileged workflow function still checks actor/scope/transition |
| DB09 | A user cannot verify or approve their own report |
| DB10 | MEAL can verify but cannot grant final approval |
| DB11 | Approval is tied to the current revision; stale approval attempt fails |
| DB12 | Repeated identical idempotency key produces one logical report/revision/event |
| DB13 | Same key with a different payload fails safely |
| DB14 | Workflow failure does not leave a state change without its audit/review event |
| DB15 | Internal comments are absent from author endpoints and direct reads |
| DB16 | Evidence metadata and actual storage-object permissions agree |
| DB17 | A guessed object path or thumbnail URL cannot bypass record access |
| DB18 | Dashboard counts, filtered lists and export populations agree |
| DB19 | Pagination does not cause undercounted aggregates or partial “all matching” exports |
| DB20 | Reset tooling refuses a non-allowlisted/production target |
| DB21 | A deactivated user cannot download an export generated earlier through the protected endpoint |
| DB22 | Submitted evidence cannot be reassigned to another report or silently overwritten |
| DB23 | Last active administrator protection and membership-change audit both work |

### Browser and mobile journeys

| ID | Required journey |
|---|---|
| UI01 | Field account signs in, creates a report with a photo and receives a genuine server receipt |
| UI02 | Reload and second-device sign-in reveal the same persisted report |
| UI03 | MEAL requests clarification; author sees only the intended question and responds with a new revision |
| UI04 | MEAL verifies; Admin approves; both decisions name the correct revision |
| UI05 | A later visit creates a follow-up on the same item without increasing the item count |
| UI06 | Admin confirms item progress from an approved source; verification and progress remain separate |
| UI07 | Every required dashboard breakdown updates from actual data |
| UI08 | CSV/XLSX/PDF downloads open correctly, respect filters and exclude privileged columns |
| UI09 | Offline draft survives refresh and close/reopen after initial online preparation |
| UI10 | Queued submission retries after lost response without duplication |
| UI11 | Reauthentication preserves the same user's draft; switching users does not reveal it |
| UI12 | Failed/oversized/unsupported evidence has a clear error and no false readiness |
| UI13 | Map denial/unavailability does not prevent reporting or list access |
| UI14 | Keyboard navigation, zoom, errors and focus work across the principal forms and dialogs |
| UI15 | Phone layout works with keyboard open; important controls are not covered |
| UI16 | A version conflict preserves local work and requires an explicit choice |
| UI17 | No public role-switching shortcut, default password or URL parameter bypasses authentication |

Also test hostile report text in exports, stored script strings, oversized filters, rate limits, expired evidence links, and failed backend calls. The user should receive safe errors without stack traces or lost work.

### Test evidence format

`docs/test-results.md` must record:

```text
Commit/build identifier
Environment and database migration state
Test command or manual procedure
Date and tool/browser/device versions
Pass / fail / not run
Observed result and evidence path
Known limitation or remediation
```

Never label an unrun test “passed”. Screenshots and recorded traces must use synthetic data and exclude credentials. Run the offline tests against the production build, not solely a development server whose service worker is disabled.

## 26. Deployment, backup, recovery and handover — P

### Deployment

Provide both a local path and a chosen hosted evaluation path. Use TLS, explicit environment variables, tested migrations, private buckets, permitted auth redirect URLs and a documented runtime/region. Include a Dockerfile or equivalent portable Node deployment. Do not assume a serverless host supports a long-running job, large body or image-processing library without testing it.

Keep evaluation, staging and production data/secrets separate. Production seeding must not import demonstration accounts or records accidentally. Disable external demonstration admin actions and destructive reset utilities in production. Use client-controlled accounts for eventual production hosting/domain/database after approval; no undocumented dependency on the developer's personal account.

Document deploy, rollback, migration compatibility and smoke checks. Do not “roll back” a database by blindly dropping tables. Before a remote migration, identify the target, backup status and approval boundary.

### Backups and restore

Database backup and evidence-object backup are separate requirements. Supabase's database backups do not include the stored file objects, only associated database metadata. Provider backup availability also depends on the selected plan. Verify the actual arrangement rather than assuming it. [T07]

Provide a procedure for encrypted, access-controlled backup of the application schema/data, relevant auth/membership recovery information, storage metadata, evidence objects, and required configuration references. Secret values belong in an approved secret-management process, not in ordinary user exports or public backup logs.

Proposed operating targets, pending agreement, are a maximum 24-hour data recovery point and restoration within four hours for a small deployment. These are design targets, not achieved SLAs. Record the real restore-test result and adjust estimates.

Before marking backup readiness complete, restore a test backup into a separate disposable environment and verify account access, report/revision counts, permissions, sample evidence checksums and exports. Record the result. A scheduled job definition without an executed backup and restore test is not proof of recoverability.

### Handover

The EOI calls for relevant source code, database structure, documentation, UI/UX assets, administrative credentials and deployment/configuration information, with final ownership/confidentiality terms defined by the contract. [EOI §13, p.11]

Prepare a clean handover package with source/migrations, dependency and licence inventory, deployment/backup guides, manuals, support contact placeholders and a credentials-transfer checklist. Preserve required third-party licence notices. Do not add an open-source licence to proprietary client deliverables or promise rights the project does not own without authorisation.

Do not retain an undisclosed backdoor administrator, developer account or private dependency required for operation. Removing Kredit branding or transferring approved infrastructure must not break the system.

## 27. Required documentation and training materials — P

Deliver documents that describe the implemented system, not only the planned one:

| Document | Minimum content |
|---|---|
| Draft URS | Source requirements, proposed decisions and outstanding questions; client consultations/approval marked pending |
| Architecture | Components, trust boundaries, auth flow, storage, queue and deployment |
| Data dictionary | Tables, fields, statuses, metrics and data ownership |
| API contract | Inputs/outputs, access rules, error codes and idempotency |
| Security/threat model | Threats, implemented controls, test results and residual risks |
| Offline guide | Preparation, supported browser behaviour, limitations, failure/recovery and shared-device advice |
| Focal-person guide | Sign-in, new report, photos, saving, sending, clarification and follow-up |
| MEAL guide | Review, internal versus shared messages, verification, dashboard filters and exports |
| Administrator guide | Accounts, assignments, final approval, reference data, audit and escalation |
| Training plan | Practical exercises for field, MEAL and admin users; do not claim delivery has happened |
| Operations guide | Health checks, costs, dependencies, updates, logs and support |
| Backup/restore guide | Actual procedure, target environment controls and restore evidence |
| Requirements matrix | Each EOI requirement mapped to code, tests and implementation state |
| Known limitations | Precise gaps, impact, workarounds and next steps; never hide a core failure |
| Handover checklist | Source, database, assets, configuration, ownership and credential transfer |

Include a proposed initial maintenance approach, bug-triage procedure and escalation route. Do not invent a client-approved support period, response-time guarantee or assigned RAWYOD contact.

## 28. Reviewer walkthrough — P

Create `docs/demo-walkthrough.md` and a short in-app help version. Use the actual seeded record references and privately provisioned accounts.

### Main scenario: fictional school-roof repair

1. Sign in as a focal person assigned to the relevant LGA.
2. Create a new fictional project observation with community, date, sector, factual notes and a test image.
3. Submit and note the server-generated reference.
4. In a separate browser profile, sign in as MEAL and find the new report in the review queue.
5. Request a specific clarification. Add a separate internal note and verify that the author cannot see it.
6. Return as the author, respond and resubmit. Show the preserved earlier revision.
7. Verify as MEAL and approve as a different authorised administrator.
8. Show that the project's issue progress has not magically become resolved because the report was verified.
9. Add a later observation to the same item. Confirm progress from an approved revision using the admin action.
10. Apply the LGA/sector filters, inspect counts, and generate CSV, XLSX and PDF outputs.

### Connectivity scenario

Prepare offline access while online, disconnect, create a draft, close/reopen, recover it, queue it explicitly, reconnect and send. Reproduce one safe failed attempt and show recovery without duplicate reports. Explain that sending while the browser is closed is not guaranteed.

### Access-control scenario

Show that a focal person cannot access another reporter's report, that MEAL cannot grant approval, and that deactivation blocks server access. Do not demonstrate provider secrets or expose production infrastructure.

The walkthrough is written; no prerecorded application video is required by this build brief. Any screenshots are generated from the implemented application, not fabricated renderings.

## 29. Implementation milestones and execution order — P

Complete vertical slices in this order. Phases are an internal build sequence, not contractual duration estimates. Keep the application runnable and commit coherent increments where repository access permits.

### Milestone 0 — Inspect and establish the project

Inspect repository, stack and existing tests. Record decisions and the source matrix. Configure the runtime, package manager, local backend, environment validation and test harness. Establish the non-personal design shell without spending the first day on decoration.

**Exit evidence:** clean install, local app start, migration/test connection, no secret leakage.

### Milestone 1 — Identity, schema and permissions

Implement memberships/LGAs/sectors, auth/account flows, active-user enforcement, RLS/function grants and synthetic accounts. Build the negative permission tests before adding a large amount of UI.

**Exit evidence:** three real roles can sign in; forbidden direct API/database access is denied.

### Milestone 2 — Real report and evidence submission

Implement items, drafts, server receipts, photo processing/private storage and immutable submission revisions. Connect the mobile form to the actual backend.

**Exit evidence:** report created on one device is visible on another with the same authorised account and to the reviewer.

### Milestone 3 — Review, clarification and follow-up

Implement the state machines, permissions, messages, revision comparisons, action history and confirmed progress. Add transaction/idempotency tests.

**Exit evidence:** the main reviewer scenario works end to end and stale/self-approval fails.

### Milestone 4 — Offline recovery and synchronisation

Implement IndexedDB, offline shell, persistent drafts, explicit queue, evidence dependencies, retries, idempotency and conflict UI. Test in production build and on a phone.

**Exit evidence:** close/reopen offline recovery and lost-response retry are demonstrated without data loss or duplication.

### Milestone 5 — Monitoring, search, maps and exports

Implement shared filters, database aggregates, item views, map/list fallback and all three export formats. Verify definitions against independent database queries.

**Exit evidence:** every required metric and export matches its scoped source population.

### Milestone 6 — Usability, accessibility, security and performance

Refine field copy, mobile review, errors and visual consistency. Execute security/permission, browser and performance checks. Fix critical failures rather than suppressing them.

**Exit evidence:** recorded results, no known critical access/data-loss failures, usable phone workflows.

### Milestone 7 — Deploy and prepare evaluation/handover

Deploy only to an approved target, run smoke checks, configure/test backup/restore, provision private reviewer access, finish manuals and requirements matrix, and generate a clean build report.

**Exit evidence:** actual deployment URL if deployed, reproducible setup, private access instructions and honest feature/test status. Client URS approval, formal UAT acceptance, training delivery and contract handover remain pending until actually performed.

## 30. Definition of done

Do not mark this build complete until the following have evidence:

- [ ] Clean checkout can install, configure the local backend, migrate, seed and run using the documented commands.
- [ ] All three roles use real authentication and tested server/database permissions.
- [ ] All 17 LGAs and 34 synthetic focal persons are present with correct assignments.
- [ ] Field reports and images persist across sessions/devices.
- [ ] Review, clarification, immutable revisions, verification, approval/rejection and follow-up work.
- [ ] Report review state and item progress remain separate, with correctly scoped counts.
- [ ] Offline draft recovery and safe, idempotent sending work within the documented browser limits.
- [ ] Search, required dashboard metrics and filtered CSV/XLSX/PDF exports work against actual data.
- [ ] Mapping/location functionality is usable without making maps or GPS mandatory.
- [ ] Submitted data/evidence is private and the critical denial-path tests pass.
- [ ] Mobile layouts, accessibility and failure states have been checked.
- [ ] Seed/reset controls cannot target production accidentally and no credentials are committed.
- [ ] The production build passes; lint/type checks and relevant test suites have real results.
- [ ] Deployment and backup/restore status are documented with executed evidence or explicitly marked pending.
- [ ] Manuals, draft URS, architecture, requirements matrix, cost assumptions and handover materials exist.
- [ ] All known limitations are stated and no requirement is falsely marked delivered or client-approved.

A complete **application build** and a completed **client contract** are different. Do not claim client approval or delivered training simply because documentation is ready.

## 31. What the agent must return

At handoff, provide:

1. The implemented repository/branch and commit/build identifier.
2. The actual evaluation URL, only if deployment succeeded.
3. Exact local setup and run commands.
4. A private mechanism for evaluator credentials, without putting secrets into public output.
5. Features completed, linked to the requirements matrix.
6. Test commands actually run, pass/fail/not-run results and evidence paths.
7. Known limitations and external approvals/configuration still needed.
8. Operating-cost assumptions and the deployment/backup arrangement.
9. A short guide to the demonstration workflow and where the documentation lives.

Do not respond only with screenshots, a design summary, “production-ready”, or a list of things that could be built later. If blocked, state the exact blocker and what is implemented; continue with non-blocked work.

## 32. Optional enhancements — O

Only after the complete core is working:

- Human-reviewed Hausa localisation, keeping language selection explicit.
- Safe PDF evidence processing when the supported quarantine/scanning path is available.
- Advanced duplicate-item review/merge with full traceability.
- Approved, redacted public summaries with separate editorial permission and publication workflow.
- Stronger device-local encryption/managed-device controls following a reviewed threat model.
- Configurable two-person verification/approval segregation.
- Carefully scoped email reminders or approved push notifications.
- Additional states/programmes after the initial Yobe implementation.

Do not add these to the required EOI scope or a financial commitment without explicitly identifying them as proposed options.

## 33. Open decisions for eventual client confirmation

Do not block the evaluation build on these; use the defaults above and record pending confirmation:

- Final registration/onboarding method and named administrators.
- Exact MEAL permissions, geographic scopes and reviewer separation rules.
- Required languages and approved translations.
- Final categories, project/issue progress labels and verification guidance.
- Hosting region, provider plan, operational budget and client-owned accounts.
- Retention/archiving schedule, confidentiality rules, offline-device policy and incident contacts.
- Whether a public communication layer is wanted and what may be published.
- Desired original-file retention or evidentiary provenance requirements.
- Training schedule, acceptance criteria, support period and response arrangements.
- Final contractual IP, licence, handover and maintenance terms.

## 34. Sources and technical references

### Client source

**R1:** Uploaded PDF, *Call for Expression of Interest — Development of the Arewa Civic Tracker – Digital Civic Monitoring and Governance Reporting Platform*, RAWYOD, reference RAWYOD/NYFF/VOICES-TO-VOTES/2026/001, issued 7 September 2026, 12 pages. Page/section references in this README refer to its printed pages. The application requirements above are grounded in R1; the detailed engineering choices are proposals. An unchanged copy is included at `reference/RAWYOD_Arewa_Civic_Tracker_EOI.pdf`.

The full EOI remains the source of truth for the bid. Do not treat this engineering README as a replacement for the technical/financial proposal or statutory company documents.

### Primary technical references consulted for this specification

These support the limited technical notes cited above; they do not make our specific design choices client requirements. Recheck the relevant official documentation when installing or upgrading dependencies. Documentation was consulted on 8 September 2026; URLs and package interfaces can change.

```text
T01 — Next.js installation and deployment
https://nextjs.org/docs/app/getting-started/installation
https://nextjs.org/docs/app/getting-started/deploying

T02 — Supabase SSR clients, token verification and cookie integration
https://supabase.com/docs/guides/auth/server-side/creating-a-client

T03 — Supabase PostgreSQL row-level security and grants
https://supabase.com/docs/guides/database/postgres/row-level-security

T04 — Supabase private storage access controls
https://supabase.com/docs/guides/storage/security/access-control

T05 — MDN background synchronisation and IndexedDB
https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

T06 — MDN browser storage quotas and eviction
https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria

T07 — Supabase database backups, plan dependence and exclusion of storage objects
https://supabase.com/docs/guides/platform/backups

T08 — OWASP File Upload Cheat Sheet
https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

T09 — OWASP CSV Injection
https://owasp.org/www-community/attacks/CSV_Injection

T10 — OpenStreetMap Foundation tile usage policy
https://operations.osmfoundation.org/policies/tiles/

T11 — W3C Web Content Accessibility Guidelines 2.2
https://www.w3.org/TR/WCAG22/

T12 — Yobe State ACReSAL, About Yobe: LGA names
https://acresal.yb.gov.ng/about-yobe/

T13 — Supabase local development CLI
https://supabase.com/docs/guides/local-development/cli/getting-started

T14 — Next.js PWA guide
https://nextjs.org/docs/app/guides/progressive-web-apps
```

**Final implementation instruction:** Deliver a coherent application that a reviewer can actually operate. Let its working workflows, clear interface, reliable data and documented tests demonstrate Kredit Technologies Limited's engineering capability.
