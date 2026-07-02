import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ROLES = [
  "Operations",
  "Tech / Engineering",
  "Design",
  "Content & Social",
  "Photography / Video",
  "Community Outreach",
  "Sponsorship",
  "Logistics",
  "Anywhere I'm needed",
];

const schema = z.object({
  full_name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(20),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  role_interest: z.string().min(1),
  skills: z.string().trim().max(300).optional().or(z.literal("")),
  availability: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(600).optional().or(z.literal("")),
});

export function VolunteerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    setSubmitting(true);
    const { error } = await supabase.from("volunteer_signups").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      city: parsed.data.city || null,
      role_interest: parsed.data.role_interest,
      skills: parsed.data.skills || null,
      availability: parsed.data.availability || null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Try again in a moment.");
      return;
    }
    setDone(true);
    toast.success("You're in. Team Nest will reach out.");
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream">
        <div className="flex items-center justify-between border-b-2 border-ink bg-yellow px-6 py-4 text-ink">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-80">Join Team Nest</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">Become a Volunteer</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink font-bold">✕</button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="font-script text-7xl text-orange">Welcome aboard!</div>
            <p className="mt-4 text-muted-foreground">Your application is in. We'll reach out with onboarding + next steps.</p>
            <button onClick={onClose} className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">Back to site</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <VField label="Full name" name="full_name" required />
            <VField label="City" name="city" placeholder="Nashik" />
            <VField label="Email" name="email" type="email" required />
            <VField label="Phone" name="phone" required />

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">Where do you want to help? <span className="text-orange">*</span></label>
              <select name="role_interest" required defaultValue="" className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans">
                <option value="">Pick a track…</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <VField className="sm:col-span-2" label="Skills / tools" name="skills" placeholder="React, Figma, video editing, community, etc." />
            <VField className="sm:col-span-2" label="Availability" name="availability" placeholder="Weekends · 5–10 hrs / week · on-ground on event day" />

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">Anything else? (optional)</label>
              <textarea name="message" rows={3} maxLength={600} className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans" placeholder="Tell us why you want to help build this." />
            </div>

            <div className="sm:col-span-2 mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">We'll reply with next steps within a few days.</p>
              <button disabled={submitting} className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60">
                {submitting ? "Sending…" : "Join the crew →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function VField({ label, name, type = "text", required, placeholder, className = "" }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">{label}{required && <span className="text-orange"> *</span>}</label>
      <input name={name} type={type} required={required} placeholder={placeholder}
        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-orange" />
    </div>
  );
}
