# Plan — Admin Dashboard, Tabbed Landing, Expertise Upgrade

## 1. Expertise picker upgrade (MentorJudgeDialog)
- Expand the built-in tag list (add: Fintech, Healthtech, Edtech, Gaming, AR/VR, Robotics, Design Systems, Community, Open Source, Systems / Low-level, LLM Ops, Databases).
- Add a "+ Add custom" input that lets the user append exactly ONE custom tag to their selection (validated: 2–30 chars, dedup against list).
- Store as CSV like today — no schema change needed.

## 2. Split the long landing into tabbed sections
Keep `/` as the marketing hero, but add an in-page top tab bar (sticky) with anchor-driven tabs so the page feels shorter and navigable:
- **Overview** — Hero + Legacy + Community + CTA
- **Builders** — Founder dossier (Ansh) + Builder Manifesto + Register CTA
- **Teams** — Registered teams strip + Change members + Sponsors
- **Timeline** — Schedule & Rounds with countdowns + Mentors/Judges apply

Implementation: single route, one `activeTab` state, each tab renders its section group. Smooth scroll to top of section on switch. URL hash sync (`#builders`, `#teams`, `#timeline`) for shareable deep-links. Mobile: horizontal scroll tab bar.

## 3. Admin dashboard
New protected route tree:
- `/admin/login` — email+password sign in (Lovable Cloud auth).
- `/_authenticated/admin/*` — gated by the managed auth layout AND an `admin` role check.

### Auth & roles
- Add `app_role` enum + `user_roles` table + `has_role()` SECURITY DEFINER (per platform user-roles knowledge).
- Trigger grants `admin` role automatically to verified emails on a domain we set (default: the founder's email — configurable). Otherwise admins are inserted manually via migration.
- RLS on all existing tables extended with an "admins can select all" policy using `has_role(auth.uid(),'admin')` so the dashboard can list rows.

### Dashboard pages
Sidebar layout with tabs:
1. **Teams** — list with search by team name / lead email, columns: name, lead, size, created, members-changed flag. Row click → drawer with full members JSON.
2. **Mentor & Judge Applications** — filter by type (mentor/judge) and status. Actions: Approve / Reject (updates a new `status` column: pending|approved|rejected). Detail drawer shows bio, expertise chips, LinkedIn.
3. **Sponsor Inquiries** — table + detail drawer.
4. **Volunteer Signups** — table + detail drawer.
5. **PPT / Submissions** — placeholder table wired to existing submission fields on teams (if any). If no submission column exists yet, add `ppt_url` + `submission_notes` to teams (nullable) so it can display.
6. **Overview** — counts per table + recent activity list.

### Schema additions (single migration)
- `app_role` enum (`admin`, `moderator`, `user`).
- `public.user_roles` table + GRANTs + RLS + `has_role()` function.
- `ALTER TABLE mentor_judge_applications ADD COLUMN status text DEFAULT 'pending'` + admin update policy.
- Admin SELECT policies on `teams`, `sponsor_inquiries`, `volunteer_signups`, `mentor_judge_applications` using `has_role`.
- Optional `ppt_url` / `submission_notes` on `teams`.

### Frontend
- `/admin/login` public route with email+password form.
- `_authenticated/admin/route.tsx` — checks `has_role` via a server fn (`requireSupabaseAuth`), redirects non-admins to `/`.
- `_authenticated/admin/index.tsx` — overview.
- `_authenticated/admin/teams.tsx`, `applications.tsx`, `sponsors.tsx`, `volunteers.tsx`, `submissions.tsx`.
- Shared `AdminLayout` with sidebar + top bar with sign-out.
- All data fetched through `createServerFn` + `requireSupabaseAuth`, using RLS-scoped queries (no service role).

## Technical notes
- No changes to existing dialogs' submit flows.
- Tab bar is presentation-only; SEO stays intact because content still renders on `/`.
- First admin: after this ships, the user signs up on `/admin/login`, then we insert their `user_id` into `user_roles` via a follow-up insert (or set a verified-domain rule if preferred).

## Open question
Which email/domain should auto-receive the `admin` role on signup? If you'd rather grant it manually to a specific email after signup, say so and I'll skip the trigger.
