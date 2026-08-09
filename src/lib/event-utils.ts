/** Client-safe helpers shared by organizer, participant and public event surfaces. */

export const ORGANIZER_PERMISSIONS = [
  { key: "view_participants", label: "View participants" },
  { key: "manage_registrations", label: "Manage registrations" },
  { key: "manage_rounds", label: "Manage rounds" },
  { key: "review_submissions", label: "Review submissions" },
  { key: "shortlist", label: "Shortlist participants" },
  { key: "send_emails", label: "Send emails" },
  { key: "export_data", label: "Export data" },
  { key: "manage_volunteers", label: "Manage volunteers" },
  { key: "edit_event", label: "Edit event" },
  { key: "full_access", label: "Full event access" },
] as const;

export const EVENT_CATEGORIES = [
  "Hackathon",
  "Workshop",
  "Meetup",
  "Conference",
  "Bootcamp",
  "Startup Competition",
  "Quiz",
  "Other",
] as const;

export const EVENT_TYPE_PRESETS: Record<string, { label: string; rounds: { name: string; round_type: string; description: string }[] }> = {
  hackathon: {
    label: "Hackathon",
    rounds: [
      { name: "Registration", round_type: "registration", description: "Teams register with their details." },
      { name: "PPT Submission", round_type: "submission", description: "Shortlisted teams upload their idea deck." },
      { name: "Evaluation", round_type: "evaluation", description: "Jury reviews decks and shortlists finalists." },
      { name: "Final Event", round_type: "final", description: "Selected teams build on-ground." },
    ],
  },
  workshop: {
    label: "Workshop",
    rounds: [
      { name: "Registration", round_type: "registration", description: "Participants register." },
      { name: "Confirmation", round_type: "evaluation", description: "Seats confirmed by organisers." },
      { name: "Attendance", round_type: "offline", description: "On-ground attendance." },
    ],
  },
  startup: {
    label: "Startup Competition",
    rounds: [
      { name: "Application", round_type: "registration", description: "Founders apply." },
      { name: "Screening", round_type: "evaluation", description: "Applications screened." },
      { name: "Pitch Deck", round_type: "submission", description: "Deck submission." },
      { name: "Interview", round_type: "evaluation", description: "Panel interview." },
      { name: "Final Pitch", round_type: "final", description: "Demo day pitch." },
    ],
  },
  quiz: {
    label: "Quiz Competition",
    rounds: [
      { name: "Registration", round_type: "registration", description: "Teams register." },
      { name: "Qualifier", round_type: "submission", description: "Online qualifier round." },
      { name: "Semi Final", round_type: "evaluation", description: "Top teams advance." },
      { name: "Final", round_type: "final", description: "On-stage final." },
    ],
  },
  custom: { label: "Custom", rounds: [{ name: "Registration", round_type: "registration", description: "" }] },
};

export const REGISTRATION_STATUSES = [
  "submitted",
  "under_review",
  "shortlisted",
  "on_hold",
  "rejected",
  "advanced",
  "finalist",
  "selected",
  "completed",
  "withdrawn",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/** 🟢 active/completed · 🟡 pending · 🔵 in progress · 🔴 rejected · ⚪ draft */
export type Tone = "success" | "warning" | "info" | "danger" | "neutral";

const TONE_BY_STATUS: Record<string, Tone> = {
  // registrations
  submitted: "warning",
  under_review: "warning",
  shortlisted: "success",
  on_hold: "warning",
  rejected: "danger",
  advanced: "info",
  finalist: "info",
  selected: "success",
  completed: "success",
  withdrawn: "neutral",
  // events
  draft: "neutral",
  published: "success",
  registration_closed: "warning",
  archived: "neutral",
  // tasks
  not_started: "neutral",
  in_progress: "info",
  approved: "success",
  changes_requested: "warning",
  // accounts
  active: "success",
  pending: "warning",
  paused: "warning",
  suspended: "danger",
  revoked: "danger",
  removed: "danger",
  // emails
  queued: "info",
  sent: "success",
  failed: "danger",
  skipped: "neutral",
};

export function statusTone(status: string | null | undefined): Tone {
  if (!status) return "neutral";
  return TONE_BY_STATUS[status] ?? "neutral";
}

export function humanStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------------- lifecycle ---------------- */

export type EventLike = {
  status: string;
  registration_opens_at?: string | null;
  registration_closes_at?: string | null;
  start_at?: string | null;
  end_at?: string | null;
};

export type Lifecycle = {
  state: "draft" | "coming_soon" | "open" | "closed" | "completed";
  label: string;
  tone: Tone;
  canRegister: boolean;
};

export function eventLifecycle(e: EventLike, now = new Date()): Lifecycle {
  if (e.status === "draft") return { state: "draft", label: "Draft", tone: "neutral", canRegister: false };
  if (e.status === "completed" || e.status === "archived")
    return { state: "completed", label: "Event completed", tone: "neutral", canRegister: false };

  const endsAt = e.end_at ? new Date(e.end_at) : null;
  if (endsAt && endsAt < now) return { state: "completed", label: "Event completed", tone: "neutral", canRegister: false };

  const opens = e.registration_opens_at ? new Date(e.registration_opens_at) : null;
  const closes = e.registration_closes_at ? new Date(e.registration_closes_at) : null;

  if (e.status === "registration_closed")
    return { state: "closed", label: "Registration closed", tone: "danger", canRegister: false };
  if (opens && opens > now) return { state: "coming_soon", label: "Coming soon", tone: "info", canRegister: false };
  if (closes && closes < now)
    return { state: "closed", label: "Registration closed", tone: "danger", canRegister: false };
  return { state: "open", label: "Register now", tone: "success", canRegister: true };
}

/* ---------------- deadlines ---------------- */

export type Urgency = "none" | "later" | "soon" | "today" | "passed";

export function deadlineUrgency(iso: string | null | undefined, now = new Date()): Urgency {
  if (!iso) return "none";
  const d = new Date(iso).getTime();
  const diff = d - now.getTime();
  if (diff < 0) return "passed";
  const hours = diff / 3_600_000;
  if (hours <= 24) return "today";
  if (hours <= 24 * 5) return "soon";
  return "later";
}

export function urgencyTone(u: Urgency): Tone {
  switch (u) {
    case "today":
      return "danger";
    case "soon":
      return "warning";
    case "passed":
      return "neutral";
    default:
      return "info";
  }
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function countdown(iso: string | null | undefined, now = new Date()) {
  if (!iso) return null;
  let diff = new Date(iso).getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  diff -= days * 86_400_000;
  const hours = Math.floor(diff / 3_600_000);
  diff -= hours * 3_600_000;
  const minutes = Math.floor(diff / 60_000);
  return { days, hours, minutes };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function eventCodeFrom(name: string) {
  const letters = name.replace(/[^a-zA-Z ]/g, "").split(/\s+/).filter(Boolean);
  const base = (letters.length > 1 ? letters.map((w) => w[0]).join("") : name.replace(/[^a-zA-Z]/g, "").slice(0, 4))
    .toUpperCase()
    .slice(0, 5);
  return (base || "EVT") + Math.floor(10 + Math.random() * 89);
}

/* ---------------- email templates ---------------- */

export const EMAIL_TEMPLATES = [
  {
    key: "registration_confirmation",
    label: "Registration confirmation",
    subject: "Your registration for {{event}} is confirmed",
    body:
      "Hi {{name}},\n\nYour registration for {{event}} has been successfully received.\nRegistration ID: {{code}}\n\nWe'll email you before every round. Keep an eye on your dashboard.\n\n— Team Nest",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    subject: "Congratulations — you're shortlisted for {{event}}",
    body:
      "Hi {{name}},\n\nCongratulations! Your entry ({{code}}) has been shortlisted for the next round of {{event}}.\n\nCheck your dashboard for the round brief and deadline.\n\n— Team Nest",
  },
  {
    key: "rejected",
    label: "Not shortlisted",
    subject: "Update on your {{event}} application",
    body:
      "Hi {{name}},\n\nThank you for participating in {{event}}. Unfortunately your application ({{code}}) was not shortlisted this time.\n\nWe'd love to see you at the next Nest event.\n\n— Team Nest",
  },
  {
    key: "submission_reminder",
    label: "Submission reminder",
    subject: "Deadline approaching for {{event}}",
    body:
      "Hi {{name}},\n\nThis is a reminder that your submission for {{event}} is due soon.\nRegistration ID: {{code}}\n\nSubmit from your dashboard before the deadline.\n\n— Team Nest",
  },
  {
    key: "final_selection",
    label: "Final selection",
    subject: "You're through to the finals of {{event}}",
    body:
      "Hi {{name}},\n\nCongratulations! You have been selected for the final round of {{event}}.\nRegistration ID: {{code}}\n\nFinal instructions are on your dashboard.\n\n— Team Nest",
  },
  {
    key: "custom",
    label: "Custom message",
    subject: "An update about {{event}}",
    body: "Hi {{name}},\n\n\n\n— Team Nest",
  },
] as const;

export function renderTemplate(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (_m, k) => vars[k] ?? "");
}
