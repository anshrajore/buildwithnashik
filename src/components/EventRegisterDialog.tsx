import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerForEvent } from "@/lib/events.functions";

type EventShape = {
  id: string;
  name: string;
  participation_type: string;
  team_min: number;
  team_max: number;
  team_name_required: boolean;
  eligibility: string | null;
  college_restriction: string | null;
  required_participant_fields: unknown;
  required_documents: unknown;
  custom_questions: unknown;
};

type Question = { id: string; label: string; type: "text" | "textarea" | "select"; options: string[]; required: boolean };
type Doc = { label: string; required: boolean };
type Member = { full_name: string; email: string; phone: string; college: string; role: string };

const emptyMember = (): Member => ({ full_name: "", email: "", phone: "", college: "", role: "" });

export function EventRegisterDialog({
  open,
  onClose,
  event,
  defaults,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  event: EventShape;
  defaults?: { name?: string | null; email?: string | null };
  onDone?: () => void;
}) {
  const questions = (Array.isArray(event.custom_questions) ? event.custom_questions : []) as Question[];
  const docs = (Array.isArray(event.required_documents) ? event.required_documents : []) as Doc[];
  const fields = (Array.isArray(event.required_participant_fields) ? event.required_participant_fields : []) as string[];

  const allowTeam = event.participation_type !== "individual";
  const allowSolo = event.participation_type !== "team";
  const [mode, setMode] = useState<"individual" | "team">(allowTeam && !allowSolo ? "team" : allowSolo ? "individual" : "team");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const [lead, setLead] = useState({
    lead_name: defaults?.name ?? "",
    lead_email: defaults?.email ?? "",
    lead_phone: "",
    college: "",
    city: "",
    team_name: "",
  });
  const [members, setMembers] = useState<Member[]>([emptyMember()]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, { label: string; path: string; url?: string }>>({});
  const [agree, setAgree] = useState(false);

  const teamSize = mode === "team" ? members.filter((m) => m.full_name.trim()).length + 1 : 1;
  const steps = useMemo(
    () => ["Your details", ...(mode === "team" ? ["Team"] : []), ...(questions.length ? ["Questions"] : []), ...(docs.length ? ["Documents"] : []), "Confirm"],
    [mode, questions.length, docs.length],
  );

  if (!open) return null;

  async function upload(docLabel: string, file: File) {
    if (file.size > 10 * 1024 * 1024) return toast.error("Files must be under 10 MB");
    const path = `${event.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error } = await supabase.storage.from("event-files").upload(path, file, { upsert: false });
    if (error) return toast.error("Upload failed — try again");
    setFiles((f) => ({ ...f, [docLabel]: { label: docLabel, path } }));
    toast.success(`${docLabel} uploaded`);
  }

  const register = useServerFn(registerForEvent);

  async function submit() {
    if (!agree) return toast.error("Please confirm the declaration");
    if (mode === "team" && (teamSize < event.team_min || teamSize > event.team_max))
      return toast.error(`Team size must be ${event.team_min}–${event.team_max} (including you)`);
    if (mode === "team" && event.team_name_required && !lead.team_name.trim()) return toast.error("Team name is required");
    for (const q of questions) if (q.required && !answers[q.id]?.trim()) return toast.error(`Answer required: ${q.label}`);
    for (const d of docs) if (d.required && !files[d.label]) return toast.error(`Upload required: ${d.label}`);
    for (const f of fields) {
      if (f === "college" && !lead.college.trim()) return toast.error("College is required");
      if (f === "city" && !lead.city.trim()) return toast.error("City is required");
    }

    setBusy(true);
    const res = await register({
      data: {
        event_id: event.id,
        participation_type: mode,
        team_name: mode === "team" ? lead.team_name.trim() || null : null,
        lead_name: lead.lead_name.trim(),
        lead_email: lead.lead_email.trim(),
        lead_phone: lead.lead_phone.trim(),
        college: lead.college.trim() || null,
        city: lead.city.trim() || null,
        members:
          mode === "team"
            ? members
                .filter((m) => m.full_name.trim())
                .map((m) => ({
                  full_name: m.full_name.trim(),
                  email: m.email.trim() || null,
                  phone: m.phone.trim() || null,
                  college: m.college.trim() || null,
                  role: m.role.trim() || null,
                }))
            : [],
        answers,
        documents: Object.values(files),
      },
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.message);
    setCode(res.registration_code ?? null);
    onDone?.();
  }

  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg my-8 w-full max-w-3xl overflow-hidden rounded-2xl bg-cream">
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink bg-orange px-6 py-4 text-cream">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">{event.name}</div>
            <div className="font-chunk text-2xl uppercase tracking-tight md:text-3xl">Registration</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream font-bold">
            ✕
          </button>
        </div>

        {code ? (
          <div className="p-10 text-center">
            <div className="font-script text-6xl text-orange">You're in!</div>
            <p className="mt-4 text-ink/70">Your registration is confirmed. Keep this ID handy.</p>
            <div className="ink-border-sm mx-auto mt-5 inline-block rounded-xl bg-white px-6 py-4 font-mono text-2xl font-bold tracking-widest">
              {code}
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-ink/50">
              Round briefs and deadlines appear in your dashboard
            </p>
            <button
              onClick={onClose}
              className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink bg-white px-6 py-3">
              {steps.map((s, i) => (
                <span
                  key={s}
                  className={`ink-border-sm rounded-full px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${
                    i === step ? "bg-ink text-cream" : i < step ? "bg-yellow text-ink" : "bg-cream text-ink/50"
                  }`}
                >
                  {i + 1}. {s}
                </span>
              ))}
            </div>

            <div className="grid gap-4 p-6">
              {step === 0 && (
                <>
                  {allowTeam && allowSolo && (
                    <div className="flex gap-2">
                      {(["individual", "team"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`ink-border-sm flex-1 rounded-xl px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest ${
                            mode === m ? "bg-ink text-cream" : "bg-white"
                          }`}
                        >
                          {m === "individual" ? "Solo entry" : `Team (${event.team_min}–${event.team_max})`}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full name" value={lead.lead_name} onChange={(v) => setLead({ ...lead, lead_name: v })} required />
                    <Input label="Email" type="email" value={lead.lead_email} onChange={(v) => setLead({ ...lead, lead_email: v })} required />
                    <Input label="Phone" value={lead.lead_phone} onChange={(v) => setLead({ ...lead, lead_phone: v })} required />
                    <Input label="College / organisation" value={lead.college} onChange={(v) => setLead({ ...lead, college: v })} required={fields.includes("college")} />
                    <Input label="City" value={lead.city} onChange={(v) => setLead({ ...lead, city: v })} required={fields.includes("city")} />
                  </div>
                  {(event.eligibility || event.college_restriction) && (
                    <div className="ink-border-sm rounded-xl bg-yellow/40 p-4 text-sm">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-widest">Eligibility</div>
                      <p className="mt-1 text-ink/80">{event.eligibility}</p>
                      {event.college_restriction && <p className="mt-1 text-ink/70">Restricted to: {event.college_restriction}</p>}
                    </div>
                  )}
                </>
              )}

              {steps[step] === "Team" && (
                <>
                  <Input
                    label="Team name"
                    value={lead.team_name}
                    onChange={(v) => setLead({ ...lead, team_name: v })}
                    required={event.team_name_required}
                  />
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
                    Team size {teamSize} / allowed {event.team_min}–{event.team_max} (you included)
                  </div>
                  {members.map((m, i) => (
                    <div key={i} className="ink-border-sm grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-2">
                      <div className="sm:col-span-2 flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Member {i + 2}</span>
                        <button
                          onClick={() => setMembers(members.filter((_, j) => j !== i))}
                          className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose"
                        >
                          Remove
                        </button>
                      </div>
                      <Input label="Name" value={m.full_name} onChange={(v) => setMembers(members.map((x, j) => (j === i ? { ...x, full_name: v } : x)))} />
                      <Input label="Email" value={m.email} onChange={(v) => setMembers(members.map((x, j) => (j === i ? { ...x, email: v } : x)))} />
                      <Input label="Phone" value={m.phone} onChange={(v) => setMembers(members.map((x, j) => (j === i ? { ...x, phone: v } : x)))} />
                      <Input label="College" value={m.college} onChange={(v) => setMembers(members.map((x, j) => (j === i ? { ...x, college: v } : x)))} />
                    </div>
                  ))}
                  {teamSize < event.team_max && (
                    <button
                      onClick={() => setMembers([...members, emptyMember()])}
                      className="ink-border-sm rounded-full bg-cream px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                    >
                      + Add member
                    </button>
                  )}
                </>
              )}

              {steps[step] === "Questions" &&
                questions.map((q) => (
                  <div key={q.id}>
                    <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest">
                      {q.label}
                      {q.required && <span className="text-orange"> *</span>}
                    </label>
                    {q.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans"
                      />
                    ) : q.type === "select" ? (
                      <select
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans"
                      >
                        <option value="">Choose…</option>
                        {q.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans"
                      />
                    )}
                  </div>
                ))}

              {steps[step] === "Documents" &&
                docs.map((d) => (
                  <div key={d.label} className="ink-border-sm flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4">
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-widest">
                        {d.label}
                        {d.required && <span className="text-orange"> *</span>}
                      </div>
                      <div className="mt-1 text-xs text-ink/60">{files[d.label] ? "Uploaded ✓" : "PDF, PPT, image or ZIP · max 10 MB"}</div>
                    </div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void upload(d.label, f);
                      }}
                      className="font-mono text-[10px]"
                    />
                  </div>
                ))}

              {last && (
                <div className="ink-border-sm rounded-xl bg-white p-5">
                  <div className="font-chunk text-xl uppercase tracking-tight">Review</div>
                  <dl className="mt-3 grid gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink/70">
                    <div>Entry · {mode === "team" ? `Team of ${teamSize}` : "Individual"}</div>
                    {mode === "team" && lead.team_name && <div>Team · {lead.team_name}</div>}
                    <div>Lead · {lead.lead_name || "—"}</div>
                    <div>Email · {lead.lead_email || "—"}</div>
                    <div>Docs · {Object.keys(files).length} uploaded</div>
                  </dl>
                  <label className="mt-4 flex items-start gap-2 text-xs text-ink/70">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
                    All details are correct and I agree to receive event updates from Team Nest.
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t-2 border-ink bg-white px-6 py-4">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="ink-border-sm rounded-full bg-cream px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
              >
                ← Back
              </button>
              {last ? (
                <button
                  onClick={submit}
                  disabled={busy}
                  className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cream disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Confirm registration →"}
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                  className="ink-border-sm rounded-full bg-ink px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
                >
                  Next →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest">
        {label}
        {required && <span className="text-orange"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-orange"
      />
    </div>
  );
}
