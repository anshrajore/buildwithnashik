# NEST Event Operating System

Turning NEST from a community site into a configuration-driven event + community operations platform. This is a large build, so it ships in five phases. Each phase is usable on its own.

## Phase 1 — Foundations (data + access + errors)

**Relational core** replacing the current single-table event model:

```text
users/roles/permissions -> members -> events -> event_organizers
events -> rounds -> round_submissions -> evaluations
events -> registrations -> teams -> team_members
tasks -> task_submissions
audit_logs, email_logs, notifications, credentials
```

- Roles: `founder`, `team_member`, `organizer`, `volunteer`, `participant` (kept in the separate roles table, never on profiles).
- Per-event organizer permissions (view participants, manage rounds, review submissions, shortlist, send email, export, edit event, full access) enforced in the database, so changing an event ID in the URL cannot leak another organizer's dashboard.
- Immutable audit log with actor, target, previous/new value, timestamp, correlation ID.
- Centralized error handling: 500/404/401/403/429 pages showing status, route, friendly message, correlation ID, retry + back-to-dashboard. No stack traces or DB errors surfaced.
- Reusable empty/loading/error state components and the status colour system (green active, amber pending, blue in progress, red rejected, grey draft).

## Phase 2 — Organizer: create & configure events

- Organizer dashboard with event list and a multi-step event builder: basic info, banner upload, venue/online, dates, registration window, links, contacts, FAQs.
- Participation config: individual vs team, min/max team size, team-name rule, eligibility, college restrictions, required documents, custom registration questions with per-field required/optional control.
- Round builder: add/rename/reorder rounds, set dates and submission deadlines, submission requirements, enable/disable, re-open. No hardcoded workflow — hackathon, workshop, startup competition and quiz flows are all just configurations.
- Draft -> Published lifecycle; Register Now only activates when published and inside the registration window.

## Phase 3 — Participants

- Event discovery: browse, search, filter by category, date, participation type, online/offline, registration status. Cards show poster, name, date, location, deadline, participation type, team size, and a state badge (Register now / Closed / Coming soon / Completed).
- Event page with full details, eligibility, deadline countdown, and registration flow: individual or team, member details, team name, document uploads, custom questions, confirmation with a unique registration ID.
- Participant dashboard: my events (upcoming/registered/completed), status per event, current round, submission state, announcements, and an Action Center that surfaces pending work with deadline urgency (approaching / today / passed).

## Phase 4 — Organizer operations

- Per-event dashboard: Overview (registrations, participants, teams, pending submissions, shortlisted, rejected, active round, next deadline, conversion + completion rates), Registrations, Participants, Teams, Rounds, Submissions, Shortlisting, Communication, Analytics, Export, Settings.
- Participant table with search, filters (college, team, round, status, date, submission), sorting, pagination, bulk select.
- Review view per participant/team: registration details, members, documents, submission, round history, internal notes.
- Actions: shortlist, reject, hold, advance round — individually and in bulk.
- CSV and XLSX export for participants, teams, registrations, round data, submissions, shortlist results with clean column headers.
- Email system: registration confirmation, shortlisted, rejected, submission reminder, final selection; custom templates, preview, bulk/selected sends, and full communication history.

## Phase 5 — Community operations

- Task system with role-based My Tasks: title, description, assigner, assignee, priority, deadline, status, attachments, comments, activity history; submissions with text/files/links and approve / reject / request changes + feedback.
- Member management dashboard: profile, role, team, joining date, account status, tasks, events, last login; approve, change role, assign permissions, suspend, reactivate, revoke.
- Credential system issuing accounts with an activation flow instead of exposing passwords; states pending / active / suspended / revoked.
- Expanded NEST page: hero, about, what we do, dynamic upcoming events, past events with stats and winners, ecosystem ladder, live impact counters, volunteer / join / organize CTAs.

## Technical notes

- Backend on Lovable Cloud with row-level security on every table; all privileged reads and writes go through server functions that verify role and per-event permission before acting.
- File uploads (banners, documents, submissions) go to private storage buckets with signed access and type/size validation.
- Existing design language is kept: cream/charcoal with orange, yellow, cobalt and rose accents, chunk display headings, mono micro-labels. Existing pages (`/`, `/nest`, `/events`, swag, admin) stay working; the current Build With Nashik registration data migrates into the new event model.
- Rate limiting and input validation on every public submission endpoint.

## Suggested start

Phase 1 and 2 in the first pass, so events can be created and configured end to end, then Phase 3 registration, then 4 and 5.
