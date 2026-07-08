import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EXPERTISE = [
  "AI / ML",
  "LLM Ops",
  "Frontend / Web",
  "Backend / Cloud",
  "Mobile",
  "Product / UX",
  "Design Systems",
  "DevOps / SRE",
  "Security",
  "Databases",
  "Systems / Low-level",
  "Data / Analytics",
  "Web3 / Blockchain",
  "Hardware / IoT",
  "Robotics",
  "AR / VR",
  "Gaming",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Open Source",
  "Community",
  "Startup / Fundraising",
  "Growth / GTM",
];

const schema = z.object({
  application_type: z.enum(["mentor", "judge"]),
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(5).max(20),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  current_title: z.string().trim().min(2, "Add your current title").max(120),
  organization: z.string().trim().min(1, "Add your organization").max(120),
  linkedin_url: z.string().trim().url("Add a valid URL").max(255).optional().or(z.literal("")),
  expertise: z.string().trim().min(2, "Pick at least one area").max(300),
  experience_years: z.coerce.number().int().min(0).max(60),
  bio: z.string().trim().min(20, "20+ chars please").max(1000),
  availability: z.string().trim().max(200).optional().or(z.literal("")),
  motivation: z.string().trim().max(800).optional().or(z.literal("")),
});

export function MentorJudgeDialog({
  open,
  onClose,
  defaultType = "mentor",
}: {
  open: boolean;
  onClose: () => void;
  defaultType?: "mentor" | "judge";
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [type, setType] = useState<"mentor" | "judge">(defaultType);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [customTag, setCustomTag] = useState<string | null>(null);
  const [customDraft, setCustomDraft] = useState("");

  if (!open) return null;

  function togglePick(a: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  function addCustom() {
    const v = customDraft.trim();
    if (v.length < 2 || v.length > 30) return;
    if (EXPERTISE.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    setCustomTag(v);
    setPicked((prev) => new Set(prev).add(v));
    setCustomDraft("");
  }

  function removeCustom() {
    if (!customTag) return;
    setPicked((prev) => {
      const n = new Set(prev);
      n.delete(customTag);
      return n;
    });
    setCustomTag(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const expertiseCsv = Array.from(picked).join(", ");
    const parsed = schema.safeParse({ ...raw, application_type: type, expertise: expertiseCsv });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("mentor_judge_applications").insert({
      application_type: parsed.data.application_type,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      city: parsed.data.city || null,
      current_title: parsed.data.current_title,
      organization: parsed.data.organization,
      linkedin_url: parsed.data.linkedin_url || null,
      expertise: parsed.data.expertise,
      experience_years: parsed.data.experience_years,
      bio: parsed.data.bio,
      availability: parsed.data.availability || null,
      motivation: parsed.data.motivation || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Try again in a moment.");
      return;
    }
    setDone(true);
    toast.success("Application received. Team Nest will reach out.");
  }

  const isMentor = type === "mentor";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="ink-border-lg relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-cream"
      >
        <div className={`flex items-center justify-between border-b-2 border-ink px-6 py-4 ${isMentor ? "bg-cobalt text-cream" : "bg-rose text-ink"}`}>
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-widest opacity-80">Build With Nashik · 2026</div>
            <div className="font-chunk text-3xl uppercase tracking-tight truncate">
              {isMentor ? "Apply as Mentor" : "Apply as Judge"}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 font-bold ${isMentor ? "border-cream" : "border-ink"}`}
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="font-script text-6xl text-orange">Thank you.</div>
            <p className="mt-4 text-muted-foreground">
              Your {isMentor ? "mentor" : "judge"} application is in. We'll review and reach out within a week.
            </p>
            <button
              onClick={onClose}
              className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream"
            >
              Back to site
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid max-h-[calc(92vh-72px)] gap-4 overflow-y-auto p-6 sm:grid-cols-2">
            {/* role switch */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-widest">
                Applying as <span className="text-orange">*</span>
              </label>
              <div className="ink-border-sm inline-flex rounded-full bg-cream p-1">
                {(["mentor", "judge"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setType(k)}
                    className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
                      type === k ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"
                    }`}
                  >
                    {k === "mentor" ? "🧭 Mentor" : "⚖ Judge"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {isMentor
                  ? "Mentors join for the 36-hour build — help teams debug, scope, and ship."
                  : "Judges come in on day 2 for demos — score projects and pick winners."}
              </p>
            </div>

            <MField label="Full name" name="full_name" required />
            <MField label="City" name="city" placeholder="Nashik" />
            <MField label="Email" name="email" type="email" required />
            <MField label="Phone" name="phone" required />

            <MField label="Current title" name="current_title" placeholder="Senior Engineer, Founder…" required />
            <MField label="Organization" name="organization" placeholder="Company / university / self" required />
            <MField label="LinkedIn URL" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/…" />
            <MField label="Years of experience" name="experience_years" type="number" min={0} max={60} required defaultValue={3} />

            {/* expertise pick */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-widest">
                Areas of expertise <span className="text-orange">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EXPERTISE.map((a) => {
                  const on = picked.has(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => togglePick(a)}
                      className={`ink-border-sm rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        on ? "bg-orange text-cream" : "bg-cream text-ink hover:bg-yellow"
                      }`}
                      aria-pressed={on}
                    >
                      {on ? "✓ " : "+ "}
                      {a}
                    </button>
                  );
                })}
                {customTag && (
                  <button
                    type="button"
                    onClick={removeCustom}
                    className="ink-border-sm rounded-full bg-orange px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
                    aria-pressed
                  >
                    ✓ {customTag} ✕
                  </button>
                )}
              </div>
              {!customTag && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustom();
                      }
                    }}
                    maxLength={30}
                    placeholder="Add your own tag (e.g. Quantum, MLOps)…"
                    className="ink-border-sm rounded-full bg-cream px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={addCustom}
                    className="ink-border-sm rounded-full bg-ink px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
                  >
                    + Add
                  </button>
                </div>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">Pick as many as apply — plus one custom tag if none fit. We match teams by these tags.</p>
            </div>


            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">
                Short bio <span className="text-orange">*</span>
              </label>
              <textarea
                name="bio"
                rows={3}
                maxLength={1000}
                required
                className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans"
                placeholder="Two lines on who you are and what you've shipped."
              />
            </div>

            <MField
              className="sm:col-span-2"
              label={isMentor ? "Availability during the 36 hours" : "Availability on demo day"}
              name="availability"
              placeholder={isMentor ? "e.g. Sat 6pm–midnight, Sun morning" : "e.g. Sunday 3pm–8pm on-ground / online"}
            />

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">
                Why do you want to {isMentor ? "mentor" : "judge"}? (optional)
              </label>
              <textarea
                name="motivation"
                rows={2}
                maxLength={800}
                className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans"
                placeholder="One paragraph on why this event, why Nashik."
              />
            </div>

            <div className="sm:col-span-2 mt-2 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                We'll review and reach out within a week. Selection is by fit + track needs.
              </p>
              <button
                disabled={submitting}
                className={`ink-border-sm shrink-0 rounded-full px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest disabled:opacity-60 ${
                  isMentor ? "bg-cobalt text-cream" : "bg-rose text-ink"
                }`}
              >
                {submitting ? "Sending…" : isMentor ? "Apply as mentor →" : "Apply as judge →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function MField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  className = "",
  min,
  max,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  defaultValue?: string | number;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">
        {label}
        {required && <span className="text-orange"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        defaultValue={defaultValue}
        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-orange"
      />
    </div>
  );
}
