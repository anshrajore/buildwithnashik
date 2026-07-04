import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TRACKS = ["AI", "Healthcare", "Education", "Climate", "Agriculture", "FinTech", "Cyber Security", "Web3", "Open Innovation"];

const schema = z.object({
  team_name: z.string().trim().min(2, "Min 2 chars").max(80),
  track: z.string().min(1, "Pick a track"),
  project_idea: z.string().trim().max(500).optional().or(z.literal("")),
  lead_name: z.string().trim().min(2).max(80),
  lead_email: z.string().trim().email().max(255),
  lead_phone: z.string().trim().min(5).max(20),
  member_count: z.coerce.number().int().min(2).max(4),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  members: z.string().trim().max(500).optional().or(z.literal("")),
});

export function RegisterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setSubmitting(true);
    const members = parsed.data.members
      ? parsed.data.members.split(",").map((m) => m.trim()).filter(Boolean).map((name) => ({ name }))
      : [];
    const { error } = await supabase.from("teams").insert({
      team_name: parsed.data.team_name,
      track: parsed.data.track,
      project_idea: parsed.data.project_idea || null,
      lead_name: parsed.data.lead_name,
      lead_email: parsed.data.lead_email,
      lead_phone: parsed.data.lead_phone,
      member_count: parsed.data.member_count,
      members,
      city: parsed.data.city || null,
    });
    setSubmitting(false);
    if (error) {
      const dup =
        error.code === "23505" ||
        /duplicate key|teams_team_name_ci_unique|unique constraint/i.test(error.message ?? "");
      if (dup) {
        toast.error(`"${parsed.data.team_name}" is already taken — pick another team name.`);
      } else {
        toast.error("Could not register. Try again in a moment.");
      }
      return;
    }
    setDone(true);
    toast.success("Team registered. We'll be in touch soon.");
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream">
        <div className="flex items-center justify-between border-b-2 border-ink bg-orange px-6 py-4 text-cream">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-80">Build With Nashik · 2026</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">Register Your Team</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream font-bold">✕</button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="font-script text-7xl text-orange">You're in!</div>
            <p className="mt-4 text-muted-foreground">Your team is registered. We'll email you with next steps and dates as soon as they're locked.</p>
            <button onClick={onClose} className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">Back to site</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Team name" name="team_name" required />
            <Field label="City" name="city" placeholder="Nashik" />

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">Track</label>
              <select name="track" required className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans">
                <option value="">Choose a track…</option>
                {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <Field label="Lead name" name="lead_name" required />
            <Field label="Lead email" name="lead_email" type="email" required />
            <Field label="Lead phone" name="lead_phone" required />
            <Field label="Team size (2–4)" name="member_count" type="number" min={2} max={4} defaultValue={3} required />

            <Field className="sm:col-span-2" label="Other members (comma-separated names)" name="members" placeholder="Vedant, Aaryan, Rupali" />

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">Project idea (optional)</label>
              <textarea name="project_idea" rows={3} maxLength={500} className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans" placeholder="One paragraph on what you'd build." />
            </div>

            <div className="sm:col-span-2 mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">By submitting, you agree to receive event updates from Team Nest.</p>
              <button disabled={submitting} className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60">
                {submitting ? "Submitting…" : "Lock my spot →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder, className = "", min, max, defaultValue }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
  className?: string; min?: number; max?: number; defaultValue?: string | number;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">{label}{required && <span className="text-orange"> *</span>}</label>
      <input
        name={name} type={type} required={required} placeholder={placeholder}
        min={min} max={max} defaultValue={defaultValue}
        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-orange"
      />
    </div>
  );
}
