import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthUser, signInWithGoogle } from "@/hooks/use-auth-user";

export const NEST_TRACKS = [
  {
    id: "builder",
    label: "Builder",
    blurb: "Students & developers shipping projects. Hack nights, mentor gates, events board.",
    tint: "bg-yellow",
  },
  {
    id: "campus_lead",
    label: "Campus Lead",
    blurb: "Run Nest programming inside your college. Playbooks, budget templates, speakers.",
    tint: "bg-cobalt text-cream",
  },
  {
    id: "volunteer",
    label: "Volunteer Crew",
    blurb: "On-ground ops during events. Admin issues you a private crew dashboard login.",
    tint: "bg-orange text-cream",
  },
  {
    id: "mentor",
    label: "Mentor / Judge",
    blurb: "Industry folks reviewing builds and judging demo days.",
    tint: "bg-rose",
  },
] as const;

export type NestTrackId = (typeof NEST_TRACKS)[number]["id"];

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(5, "Enter a valid phone").max(20),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  organisation: z.string().trim().max(120).optional().or(z.literal("")),
  skills: z.string().trim().max(400).optional().or(z.literal("")),
  portfolio_url: z.string().trim().max(500).optional().or(z.literal("")),
  motivation: z.string().trim().min(20, "Tell us at least a couple of sentences").max(1200),
});

export function JoinNestDialog({
  open,
  onClose,
  track,
}: {
  open: boolean;
  onClose: () => void;
  track: NestTrackId;
}) {
  const { user } = useAuthUser();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [trackId, setTrackId] = useState<NestTrackId>(track);

  if (!open) return null;

  const meta = NEST_TRACKS.find((t) => t.id === trackId) ?? NEST_TRACKS[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("nest_membership_applications").insert({
      track: trackId,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      city: parsed.data.city || null,
      organisation: parsed.data.organisation || null,
      skills: parsed.data.skills || null,
      portfolio_url: parsed.data.portfolio_url || null,
      motivation: parsed.data.motivation,
      status: "pending",
      submitted_by: user?.id ?? null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Try again in a moment.");
      return;
    }
    setDone(true);
    toast.success("Application received.");
  }

  const field = "ink-border-sm w-full rounded-lg bg-white px-4 py-3 font-sans text-sm";
  const label = "font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="ink-border-lg relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-cream"
      >
        <div className={`flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-4 ${meta.tint}`}>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">Join Team Nest</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">{meta.label}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink font-bold">
            ✕
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="font-script text-6xl text-orange">You're in the queue!</div>
            <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
              The Nest crew reviews applications within a few working days. If you're approved for{" "}
              <strong>{meta.label}</strong>, you'll get an email — volunteer crew also receive a private dashboard login.
            </p>
            <button
              onClick={onClose}
              className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream"
            >
              Back to Nest
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 p-6">
            <div>
              <div className={label}>Track</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {NEST_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrackId(t.id)}
                    className={`ink-border-sm rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                      trackId === t.id ? "bg-ink text-cream" : "bg-white text-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink/60">{meta.blurb}</p>
            </div>

            {!user && (
              <div className="ink-border-sm flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <p className="text-xs text-ink/70">
                  Sign in with Google to track your application status in your member dashboard (optional).
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await signInWithGoogle();
                    if (res.error) toast.error(res.error);
                  }}
                  className="ink-border-sm rounded-full bg-cream px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest"
                >
                  Google sign-in
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className={label}>Full name *</span>
                <input name="full_name" required defaultValue={(user?.user_metadata as any)?.full_name ?? ""} className={field} />
              </label>
              <label className="grid gap-1">
                <span className={label}>Email *</span>
                <input name="email" type="email" required defaultValue={user?.email ?? ""} className={field} />
              </label>
              <label className="grid gap-1">
                <span className={label}>Phone *</span>
                <input name="phone" required className={field} />
              </label>
              <label className="grid gap-1">
                <span className={label}>City</span>
                <input name="city" className={field} />
              </label>
              <label className="grid gap-1">
                <span className={label}>College / Organisation</span>
                <input name="organisation" className={field} />
              </label>
              <label className="grid gap-1">
                <span className={label}>Portfolio / LinkedIn / GitHub</span>
                <input name="portfolio_url" className={field} />
              </label>
            </div>

            <label className="grid gap-1">
              <span className={label}>Skills / what you bring</span>
              <input name="skills" placeholder="React, ops, design, video, community…" className={field} />
            </label>

            <label className="grid gap-1">
              <span className={label}>Why do you want to join? *</span>
              <textarea name="motivation" required rows={4} className={field} />
            </label>

            <button
              disabled={submitting}
              className="ink-border-sm mt-1 rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Submit application"}
            </button>
            <p className="text-[11px] text-ink/55">
              Nest never charges students. We only use these details to contact you about Nest programmes.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
