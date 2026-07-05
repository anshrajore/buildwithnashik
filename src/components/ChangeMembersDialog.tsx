import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { requestMemberChange } from "@/lib/team-members.functions";
import { toast } from "sonner";


const schema = z.object({
  team_name: z.string().trim().min(2).max(80),
  lead_email: z.string().trim().email().max(255),
  lead_phone: z.string().trim().min(5).max(20),
  member_count: z.coerce.number().int().min(2).max(4),
  members: z
    .string()
    .trim()
    .min(1, "Add at least one other member")
    .max(500),
});

export function ChangeMembersDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    const members = parsed.data.members
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    setSubmitting(true);
    const { data, error } = await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: { ok: boolean; code?: string; message?: string } | null; error: { message: string } | null }>)(
      "request_member_change",
      {
        p_team_name: parsed.data.team_name,
        p_lead_email: parsed.data.lead_email,
        p_lead_phone: parsed.data.lead_phone,
        p_members: members,
        p_member_count: parsed.data.member_count,
      },
    );
    setSubmitting(false);

    if (error) {
      toast.error("Could not process request. Try again.");
      return;
    }
    if (!data?.ok) {
      const map: Record<string, string> = {
        not_found: "No team found with that name.",
        verify_failed: "Lead email or phone doesn't match our records.",
        already_changed: "Members were already updated once. Further changes are locked.",
        invalid_count: "Team size must be between 2 and 4.",
        invalid_members: "Members list is invalid.",
      };
      toast.error(map[data?.code ?? ""] ?? data?.message ?? "Request rejected.");
      return;
    }
    setDone(true);
    toast.success("Members updated. This change is final.");
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream">
        <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-6 py-4 text-cream">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-orange">Team update · One-time</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">Change Team Members</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream font-bold">✕</button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="font-script text-6xl text-orange">Locked in.</div>
            <p className="mt-4 text-muted-foreground">Your team roster has been updated. This change is final — further edits are disabled.</p>
            <button onClick={onClose} className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">Back to site</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2 rounded-xl border-2 border-dashed border-ink/30 bg-yellow/40 p-3 font-mono text-[11px] uppercase tracking-widest text-ink/80">
              ⚠ Members can be updated exactly once. Verify carefully before submitting.
            </div>

            <Field label="Team name" name="team_name" required />
            <Field label="Team size (2–4)" name="member_count" type="number" min={2} max={4} defaultValue={3} required />
            <Field label="Lead email (on record)" name="lead_email" type="email" required />
            <Field label="Lead phone (on record)" name="lead_phone" required />

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">New member list (comma-separated names)</label>
              <textarea name="members" rows={3} maxLength={500} required className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans" placeholder="Vedant, Aaryan, Rupali" />
            </div>

            <div className="sm:col-span-2 mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">We verify against the lead email + phone from registration.</p>
              <button disabled={submitting} className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60">
                {submitting ? "Updating…" : "Update roster →"}
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
