import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  getEventOps,
  sendEventEmails,
  setRegistrationStatus,
  reviewSubmission,
  logDataExport,
} from "@/lib/events.functions";
import { exportCsv, exportXlsx, type Column } from "@/lib/export-utils";
import {
  EMAIL_TEMPLATES,
  REGISTRATION_STATUSES,
  fmtDateTime,
  humanStatus,
  renderTemplate,
  statusTone,
  type Tone,
} from "@/lib/event-utils";

export const Route = createFileRoute("/_authenticated/organizer/$eventId")({
  head: () => ({
    meta: [
      { title: "Event operations · Team Nest" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EventOpsPage,
});

type Row = Record<string, any>;
type Ops = {
  event: Row;
  rounds: Row[];
  registrations: Row[];
  members: Row[];
  submissions: Row[];
  organizers: Row[];
  emails: Row[];
};

const TONE_CLS: Record<Tone, string> = {
  success: "bg-yellow text-ink",
  warning: "bg-cream text-ink border-ink/40",
  info: "bg-cobalt text-cream",
  danger: "bg-rose text-ink",
  neutral: "bg-cream text-ink/70",
};

function Chip({ status }: { status: string | null | undefined }) {
  return (
    <span className={`ink-border-sm rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${TONE_CLS[statusTone(status)]}`}>
      {humanStatus(status)}
    </span>
  );
}

const mono = "font-mono text-[10px] font-bold uppercase tracking-widest";
const btn = "ink-border-sm rounded-full px-3 py-1.5 disabled:opacity-60";
const field = "ink-border-sm rounded-lg bg-cream px-3 py-2 font-sans text-sm";

function EventOpsPage() {
  const { eventId } = Route.useParams();
  const qc = useQueryClient();
  const opsFn = useServerFn(getEventOps);
  const [tab, setTab] = useState<"registrations" | "rounds" | "emails" | "export">("registrations");

  const { data: ops, isLoading, error, refetch } = useQuery({
    queryKey: ["ops", eventId],
    queryFn: () => opsFn({ data: { event_id: eventId } }) as Promise<Ops>,
    retry: false,
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-cream paper grid place-items-center font-mono text-xs uppercase tracking-widest">
        Loading event operations…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-cream paper grid place-items-center px-4">
        <div className="ink-border-lg max-w-md w-full rounded-2xl bg-white p-8 text-center">
          <div className="font-chunk text-3xl uppercase">Can't open this dashboard</div>
          <p className="mt-2 text-sm text-muted-foreground">
            {(error as Error).message ?? "This event doesn't exist or belongs to another organizer."}
          </p>
          <Link to="/organizer" className="ink-border-sm mt-6 inline-block rounded-full bg-orange px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
            ← Back to my events
          </Link>
        </div>
      </div>
    );

  const ev = ops!.event;
  const regs = ops!.registrations;
  const stats = {
    total: regs.length,
    pending: regs.filter((r) => r.status === "submitted").length,
    shortlisted: regs.filter((r) => ["shortlisted", "advanced", "finalist", "selected", "completed"].includes(r.status)).length,
    rejected: regs.filter((r) => r.status === "rejected").length,
  };

  const tabs = [
    ["registrations", `Registrations (${stats.total})`],
    ["rounds", `Rounds & submissions (${ops!.submissions.length})`],
    ["emails", "Emails"],
    ["export", "Export"],
  ] as const;

  return (
    <div className="min-h-screen bg-cream paper text-ink">
      <Toaster position="top-center" theme="light" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Link to="/organizer" className={mono + " text-ink/60 hover:text-ink"}>← Organizer console</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip status={ev.status} />
              <span className={mono + " text-ink/50"}>{ev.category} · {ev.mode} · {ev.code}</span>
            </div>
            <h1 className="mt-2 font-chunk text-4xl uppercase tracking-tight">{ev.name}</h1>
          </div>
          {ev.status === "published" && (
            <Link to="/events/$slug" params={{ slug: ev.slug }} className={btn + " bg-white " + mono}>View public page ↗</Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([["Registered", stats.total], ["Pending review", stats.pending], ["Shortlisted", stats.shortlisted], ["Rejected", stats.rejected]] as const).map(
            ([label, n]) => (
              <div key={label} className="ink-border-sm rounded-xl bg-white p-4">
                <div className={mono + " text-ink/60"}>{label}</div>
                <div className="font-chunk text-3xl">{n}</div>
              </div>
            ),
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b-2 border-ink pb-3">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`rounded-full px-4 py-2 ${mono} ${tab === key ? "bg-ink text-cream" : "text-ink/70 hover:bg-ink/5"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "registrations" && <RegistrationsTab ops={ops!} eventId={eventId} onRefresh={() => qc.invalidateQueries({ queryKey: ["ops", eventId] })} />}
          {tab === "rounds" && <RoundsTab ops={ops!} onRefresh={() => qc.invalidateQueries({ queryKey: ["ops", eventId] })} />}
          {tab === "emails" && <EmailsTab ops={ops!} eventId={eventId} />}
          {tab === "export" && <ExportTab ops={ops!} eventId={eventId} />}
        </div>
      </div>
    </div>
  );
}

/* ================= registrations ================= */

function RegistrationsTab({ ops, eventId, onRefresh }: { ops: Ops; eventId: string; onRefresh: () => void }) {
  const setStatusFn = useServerFn(setRegistrationStatus);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());

  const byRound = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const s of ops.submissions) {
      const list = m.get(s.round_id) ?? [];
      list.push(s);
      m.set(s.round_id, list);
    }
    return m;
  }, [ops.submissions]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ops.registrations.filter((r) => {
      const okStatus = status === "all" || r.status === status;
      const subs = byRound.get(roundFilter);
      const okRound = roundFilter === "all" || (roundFilter === "none" ? !ops.submissions.some((s) => s.registration_id === r.id) : subs?.some((s) => s.registration_id === r.id));
      const okQ =
        !needle ||
        [r.registration_code, r.team_name, r.lead_name, r.lead_email, r.college, r.city].some((v) => (v ?? "").toString().toLowerCase().includes(needle));
      return okStatus && okRound && okQ;
    });
  }, [ops.registrations, ops.submissions, byRound, q, status, roundFilter]);

  const mutate = useMutation({
    mutationFn: (v: { ids: string[]; status: string }) =>
      setStatusFn({ data: { event_id: eventId, registration_ids: v.ids, status: v.status } as never }),
    onSuccess: async (_r, v) => {
      toast.success(`${v.ids.length} participant${v.ids.length > 1 ? "s" : ""} → ${humanStatus(v.status)}`);
      setSel(new Set());
      onRefresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update"),
  });
  const act = (ids: string[], status: string) => mutate.mutate({ ids, status });

  function toggle(id: string) {
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const enabledRounds = ops.rounds.filter((r) => r.is_enabled);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code, name, team, email…" className={field + " w-full sm:w-72"} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={field + " font-mono text-[10px] uppercase tracking-widest"}>
          <option value="all">All statuses</option>
          {REGISTRATION_STATUSES.map((s) => <option key={s} value={s}>{humanStatus(s)}</option>)}
        </select>
        <select value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)} className={field + " font-mono text-[10px] uppercase tracking-widest"}>
          <option value="all">All rounds</option>
          <option value="none">No submissions yet</option>
          {enabledRounds.map((r) => <option key={r.id} value={r.id}>Submitted · {r.name}</option>)}
        </select>
        <button onClick={onRefresh} className={btn + " bg-white " + mono}>↻ Refresh</button>
      </div>

      {sel.size > 0 && (
        <div className="ink-border-sm sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl bg-yellow p-3">
          <span className={mono}>{sel.size} selected</span>
          <button disabled={mutate.isPending} onClick={() => act([...sel], "under_review")} className={btn + " bg-cream " + mono}>Under review</button>
          <button disabled={mutate.isPending} onClick={() => act([...sel], "shortlisted")} className={btn + " bg-orange text-cream " + mono}>✓ Accept / shortlist</button>
          <button disabled={mutate.isPending} onClick={() => act([...sel], "rejected")} className={btn + " bg-rose " + mono}>✕ Reject</button>
          <button disabled={mutate.isPending} onClick={() => act([...sel], "submitted")} className={btn + " bg-cream " + mono}>↺ Back to pending</button>
          <button onClick={() => setSel(new Set())} className={btn + " bg-white " + mono}>Clear</button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="ink-border-sm rounded-xl bg-white p-10 text-center text-sm text-muted-foreground">No registrations match these filters.</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => {
            const open = openId === r.id;
            const members = ops.members.filter((m) => m.registration_id === r.id);
            const selected = sel.has(r.id);
            return (
              <article key={r.id} className={`ink-border-sm rounded-2xl bg-white p-4 ${selected ? "ring-2 ring-orange" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="flex min-w-0 items-start gap-3">
                    <input type="checkbox" checked={selected} onChange={() => toggle(r.id)} className="mt-1.5 h-4 w-4 accent-orange" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip status={r.status} />
                        <span className={mono + " text-ink/50"}>{r.registration_code} · {new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                      <h3 className="mt-1.5 font-chunk text-xl uppercase leading-tight">
                        {r.participation_type === "team" ? r.team_name || r.lead_name : r.lead_name}
                        {r.participation_type === "team" && <span className="ml-2 font-mono text-[10px] text-ink/50 tracking-widest">TEAM · {r.member_count}</span>}
                      </h3>
                      <p className="mt-0.5 break-all font-mono text-[11px] uppercase tracking-widest text-ink/60">
                        {[r.lead_name, r.college, r.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </label>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <button disabled={mutate.isPending} onClick={() => act([r.id], "shortlisted")} className={btn + " bg-orange text-cream " + mono}>✓</button>
                    <button disabled={mutate.isPending} onClick={() => act([r.id], "rejected")} className={btn + " bg-rose " + mono}>✕</button>
                    <button disabled={mutate.isPending} onClick={() => act([r.id], "under_review")} className={btn + " bg-cobalt text-cream " + mono}>Review</button>
                    <button disabled={mutate.isPending} onClick={() => act([r.id], "submitted")} className={btn + " bg-cream " + mono}>Pending</button>
                    <button onClick={() => setOpenId(open ? null : r.id)} className={btn + " bg-cream " + mono}>{open ? "Close" : "Details"}</button>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 grid gap-4 border-t-2 border-ink pt-4 md:grid-cols-2">
                    <div>
                      <div className={mono + " text-ink/60"}>Contact</div>
                      <p className="mt-1 break-all text-sm">✉ {r.lead_email} · ☎ {r.lead_phone}</p>
                      {r.organizer_notes && <p className="mt-2 text-sm text-ink/70">Note: {r.organizer_notes}</p>}
                    </div>
                    {members.length > 0 && (
                      <div>
                        <div className={mono + " text-ink/60"}>Members ({members.length})</div>
                        <ul className="mt-1 grid gap-1 text-sm">
                          {members.map((m) => (
                            <li key={m.id} className="flex flex-wrap gap-2">
                              <span>{m.is_lead ? "★" : "•"} {m.full_name}</span>
                              {m.role && <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">{m.role}</span>}
                              {m.email && <span className="break-all text-ink/60">{m.email}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Object.keys(r.answers ?? {}).length > 0 && (
                      <div className="md:col-span-2">
                        <div className={mono + " text-ink/60"}>Answers</div>
                        <dl className="mt-1 grid gap-1.5 text-sm">
                          {Object.entries(r.answers as Record<string, string>).map(([k, v]) => (
                            <div key={k}><dt className="font-mono text-[10px] uppercase tracking-widest text-ink/50">{k}</dt><dd>{v}</dd></div>
                          ))}
                        </dl>
                      </div>
                    )}
                    {(r.documents ?? []).length > 0 && (
                      <div className="md:col-span-2">
                        <div className={mono + " text-ink/60"}>Documents</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {(r.documents as Row[]).map((d, i) => (
                            <a key={i} href={d.url ?? "#"} target="_blank" rel="noopener noreferrer" className={btn + " bg-cream " + mono}>
                              {d.label || `File ${i + 1}`} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <div className={mono + " text-ink/60"}>Round submissions</div>
                      {enabledRounds.map((rd) => {
                        const sub = ops.submissions.find((s) => s.round_id === rd.id && s.registration_id === r.id);
                        return (
                          <div key={rd.id} className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-mono text-[10px] uppercase tracking-widest">{rd.name}</span>
                            {sub ? <Chip status={sub.status} /> : <span className="text-ink/40">— not submitted</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================= rounds & submissions ================= */

function RoundsTab({ ops, onRefresh }: { ops: Ops; onRefresh: () => void }) {
  const reviewFn = useServerFn(reviewSubmission);
  const rounds = ops.rounds.filter((r) => r.is_enabled);

  const mutate = useMutation({
    mutationFn: (v: { id: string; status: string; score?: number | null; notes?: string }) =>
      reviewFn({ data: { id: v.id, status: v.status, score: v.score ?? null, reviewer_notes: v.notes || null } as never }),
    onSuccess: () => { toast.success("Submission review saved"); onRefresh(); },
    onError: (e: any) => toast.error(e?.message ?? "Could not save review"),
  });

  if (rounds.length === 0)
    return <div className="ink-border-sm rounded-xl bg-white p-10 text-center text-sm text-muted-foreground">No rounds configured for this event yet.</div>;

  return (
    <div className="grid gap-6">
      {rounds.map((rd) => {
        const subs = ops.submissions.filter((s) => s.round_id === rd.id);
        return (
          <section key={rd.id} className="ink-border-sm rounded-2xl bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="ink-border-sm rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-cream">R{rd.position}</span>
                <h2 className="font-chunk text-2xl uppercase">{rd.name}</h2>
                <span className={mono + " text-ink/50"}>{rd.round_type}</span>
                {rd.submission_deadline && <span className={mono + " text-ink/60"}>Deadline · {fmtDateTime(rd.submission_deadline)}</span>}
              </div>
              <span className={mono + " text-ink/60"}>{subs.length} submission{subs.length === 1 ? "" : "s"}</span>
            </div>
            {rd.description && <p className="mt-1 text-sm text-ink/70">{rd.description}</p>}

            {subs.length === 0 ? (
              <p className="mt-4 rounded-xl bg-cream p-4 text-center font-mono text-[10px] uppercase tracking-widest text-ink/50">No submissions yet for this round</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {subs.map((s) => <SubmissionRow key={s.id} s={s} ops={ops} disabled={mutate.isPending} onSave={(v) => mutate.mutate(v)} />)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SubmissionRow({ s, ops, disabled, onSave }: { s: Row; ops: Ops; disabled: boolean; onSave: (v: { id: string; status: string; score?: number; notes?: string }) => void }) {
  const reg = ops.registrations.find((r) => r.id === s.registration_id);
  const [score, setScore] = useState(s.score != null ? String(s.score) : "");
  const [notes, setNotes] = useState(s.reviewer_notes ?? "");
  return (
    <div className="ink-border-sm rounded-xl bg-cream p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip status={s.status} />
            <span className={mono + " text-ink/60"}>{reg?.registration_code ?? "—"}</span>
          </div>
          <h3 className="mt-1 font-chunk text-lg uppercase">{reg ? (reg.participation_type === "team" ? reg.team_name || reg.lead_name : reg.lead_name) : "Unknown participant"}</h3>
        </div>
        <span className={mono + " text-ink/50"}>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("en-IN") : ""}</span>
      </div>
      {s.text_response && <p className="mt-2 whitespace-pre-wrap text-sm">{s.text_response}</p>}
      {s.link_url && (
        <a href={s.link_url} target="_blank" rel="noopener noreferrer" className={btn + " mt-2 inline-block bg-white " + mono}>Open link ↗</a>
      )}
      {(s.files ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(s.files as Row[]).map((f, i) => (
            <a key={i} href={f.url ?? "#"} target="_blank" rel="noopener noreferrer" className={btn + " bg-white " + mono}>{f.label || `File ${i + 1}`} ↗</a>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="number" min={0} max={100} placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)}
          className={field + " w-24 font-mono text-xs"}
        />
        <input placeholder="Reviewer notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={field + " flex-1 min-w-40"} />
        <button disabled={disabled} onClick={() => onSave({ id: s.id, status: "approved", score: score === "" ? undefined : Number(score), notes })} className={btn + " bg-orange text-cream " + mono}>✓ Approve</button>
        <button disabled={disabled} onClick={() => onSave({ id: s.id, status: "rejected", notes })} className={btn + " bg-rose " + mono}>✕ Reject</button>
        <button disabled={disabled} onClick={() => onSave({ id: s.id, status: "changes_requested", notes })} className={btn + " bg-yellow " + mono}>Changes asked</button>
      </div>
    </div>
  );
}

/* ================= emails ================= */

function EmailsTab({ ops, eventId }: { ops: Ops; eventId: string }) {
  const sendFn = useServerFn(sendEventEmails);
  const [templateKey, setTemplateKey] = useState<string>(EMAIL_TEMPLATES[0].key);
  const [status, setStatusF] = useState<string>("submitted");
  const [roundFilter, setRoundFilter] = useState<string>("all");
  const [subject, setSubject] = useState<string>(EMAIL_TEMPLATES[0].subject);
  const [body, setBody] = useState<string>(EMAIL_TEMPLATES[0].body);
  const tpl = EMAIL_TEMPLATES.find((t) => t.key === templateKey) ?? EMAIL_TEMPLATES[0];

  const audience = useMemo(() => {
    return ops.registrations.filter((r) => {
      const okStatus = status === "all" || r.status === status;
      const okRound =
        roundFilter === "all" ||
        (roundFilter === "none" ? !ops.submissions.some((s) => s.registration_id === r.id) : ops.submissions.some((s) => s.round_id === roundFilter && s.registration_id === r.id));
      return okStatus && okRound && Boolean(r.lead_email);
    });
  }, [ops.registrations, ops.submissions, status, roundFilter]);

  const sample = { name: "Aarav Sharma", event: ops.event.name, code: "XXXX-000000" };

  const mutate = useMutation({
    mutationFn: () =>
      sendFn({
        data: { event_id: eventId, registration_ids: audience.map((r) => r.id), template: templateKey, subject, body },
      }),
    onSuccess: (res: any) => {
      if (res?.ok) toast.success(`${res.queued} email${res.queued === 1 ? "" : "s"} queued for delivery`);
      else toast.error(res?.message ?? "Could not queue emails");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not queue emails"),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-4">
        <div className="ink-border-sm rounded-2xl bg-white p-5">
          <h2 className="font-chunk text-2xl uppercase">Compose</h2>
          <label className="mt-3 grid gap-1">
            <span className={mono + " text-ink/60"}>Template</span>
            <select
              value={templateKey}
              onChange={(e) => {
                setTemplateKey(e.target.value);
                const t = EMAIL_TEMPLATES.find((x) => x.key === e.target.value)!;
                setSubject(t.subject);
                setBody(t.body);
              }}
              className={field}
            >
              {EMAIL_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </label>
          <label className="mt-3 grid gap-1">
            <span className={mono + " text-ink/60"}>Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={field} />
          </label>
          <label className="mt-3 grid gap-1">
            <span className={mono + " text-ink/60"}>Message (use {"{{name}}"}, {"{{event}}"}, {"{{code}}"})</span>
            <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} className={field + " font-mono text-xs"} />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Emails are personalized per participant and queued with a delivery log — see history below.
          </p>
        </div>

        <div className="ink-border-sm rounded-2xl bg-white p-5">
          <h2 className="font-chunk text-2xl uppercase">Audience</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className={mono + " text-ink/60"}>Status</span>
              <select value={status} onChange={(e) => setStatusF(e.target.value)} className={field + " font-mono text-[10px] uppercase tracking-widest"}>
                <option value="all">Everyone registered</option>
                {REGISTRATION_STATUSES.map((s) => <option key={s} value={s}>{humanStatus(s)}</option>)}
              </select>
            </label>
            <label className="grid gap-1">
              <span className={mono + " text-ink/60"}>Round filter</span>
              <select value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)} className={field + " font-mono text-[10px] uppercase tracking-widest"}>
                <option value="all">Any round</option>
                <option value="none">No submissions yet</option>
                {ops.rounds.filter((r) => r.is_enabled).map((r) => <option key={r.id} value={r.id}>Submitted · {r.name}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-3 text-sm">
            <span className="font-chunk text-2xl">{audience.length}</span> <span className={mono + " text-ink/60"}>recipients match</span>
          </p>
          <div className="mt-2 max-h-32 overflow-y-auto font-mono text-[11px] text-ink/70">
            {audience.slice(0, 12).map((r) => r.lead_email).join(" · ")}
            {audience.length > 12 && ` · +${audience.length - 12} more`}
          </div>
          <button
            disabled={mutate.isPending || audience.length === 0 || !subject.trim() || !body.trim()}
            onClick={() => mutate.mutate()}
            className={`ink-border-sm mt-4 w-full rounded-full bg-orange px-6 py-3 ${mono} text-cream disabled:opacity-50`}
          >
            {mutate.isPending ? "Queueing…" : `Send to ${audience.length} participant${audience.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="ink-border-sm rounded-2xl bg-white p-5">
          <h2 className="font-chunk text-2xl uppercase">Preview</h2>
          <div className="mt-3 rounded-xl bg-cream p-4">
            <div className={mono + " text-ink/50"}>Subject</div>
            <p className="font-medium">{renderTemplate(subject, sample) || "(empty)"}</p>
            <div className={`${mono} mt-3 text-ink/50`}>Body</div>
            <p className="whitespace-pre-wrap text-sm">{renderTemplate(body, sample) || "(empty)"}</p>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink/40">
            Template · {tpl.label} · each recipient gets their own name/code filled in
          </p>
        </div>

        <div className="ink-border-sm rounded-2xl bg-white p-5">
          <h2 className="font-chunk text-2xl uppercase">History</h2>
          {ops.emails.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No emails sent for this event yet.</p>
          ) : (
            <div className="mt-3 max-h-96 overflow-y-auto grid gap-2">
              {ops.emails.slice(0, 60).map((e) => (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate">{e.subject}</div>
                    <div className="break-all font-mono text-[10px] uppercase tracking-widest text-ink/50">
                      {e.template} · {e.recipient_email} · {new Date(e.created_at).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Chip status={e.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= export ================= */

const FILE_TS = () => new Date().toISOString().slice(0, 10);

function ExportTab({ ops, eventId }: { ops: Ops; eventId: string }) {
  const logFn = useServerFn(logDataExport);
  const regById = useMemo(() => new Map(ops.registrations.map((r) => [r.id, r])), [ops.registrations]);
  const roundById = useMemo(() => new Map(ops.rounds.map((r) => [r.id, r])), [ops.rounds]);

  const SHORTLISTED = ["shortlisted", "advanced", "finalist", "selected", "completed"];

  const datasets: { key: string; label: string; detail: string; rows: Record<string, any>[]; columns: Column<any>[] }[] = useMemo(() => {
    const regCols: Column<Row>[] = [
      { header: "Registration code", value: (r) => r.registration_code },
      { header: "Team name", value: (r) => r.team_name ?? "" },
      { header: "Participation", value: (r) => r.participation_type },
      { header: "Lead name", value: (r) => r.lead_name },
      { header: "Lead email", value: (r) => r.lead_email },
      { header: "Lead phone", value: (r) => r.lead_phone },
      { header: "College", value: (r) => r.college ?? "" },
      { header: "City", value: (r) => r.city ?? "" },
      { header: "Members", value: (r) => r.member_count ?? "" },
      { header: "Status", value: (r) => r.status },
      { header: "Organizer notes", value: (r) => r.organizer_notes ?? "" },
      { header: "Registered at", value: (r) => (r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "") },
    ];
    return [
      {
        key: "participants",
        label: "Participants",
        detail: "Every participant and team member, one row per person",
        rows: ops.registrations.flatMap((r) =>
          (ops.members.filter((m) => m.registration_id === r.id).length
            ? ops.members.filter((m) => m.registration_id === r.id)
            : [{}]
          ).map((m) => ({
            registration_code: r.registration_code,
            team_name: r.team_name ?? "",
            participation: r.participation_type,
            full_name: m.full_name ?? r.lead_name,
            is_lead: m.is_lead ? "Yes" : (m.full_name ? "No" : ""),
            email: m.email ?? r.lead_email,
            phone: m.phone ?? r.lead_phone,
            college: m.college ?? r.college ?? "",
            role: m.role ?? "",
            status: r.status,
          })),
        ),
        columns: [
          { header: "Registration code", value: (r) => r.registration_code },
          { header: "Team name", value: (r) => r.team_name },
          { header: "Participation", value: (r) => r.participation },
          { header: "Full name", value: (r) => r.full_name },
          { header: "Is lead", value: (r) => r.is_lead },
          { header: "Email", value: (r) => r.email },
          { header: "Phone", value: (r) => r.phone },
          { header: "College", value: (r) => r.college },
          { header: "Role", value: (r) => r.role },
          { header: "Status", value: (r) => r.status },
        ],
      },
      {
        key: "teams",
        label: "Teams",
        detail: "Team registrations with member counts and leads",
        rows: ops.registrations.filter((r) => r.participation_type === "team"),
        columns: [
          { header: "Team name", value: (r) => r.team_name ?? "" },
          { header: "Registration code", value: (r) => r.registration_code },
          { header: "Member count", value: (r) => r.member_count ?? "" },
          { header: "Lead", value: (r) => r.lead_name },
          { header: "Lead email", value: (r) => r.lead_email },
          { header: "Lead phone", value: (r) => r.lead_phone },
          { header: "College", value: (r) => r.college ?? "" },
          { header: "Status", value: (r) => r.status },
          { header: "Registered at", value: (r) => (r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "") },
        ],
      },
      {
        key: "registrations",
        label: "All registrations",
        detail: "Full registration records including custom answers",
        rows: ops.registrations,
        columns: [
          ...regCols,
          { header: "Answers", value: (r) => JSON.stringify(r.answers ?? {}) },
          { header: "Documents", value: (r) => ((r.documents ?? []) as Row[]).map((d) => d.label ?? d.path).join("; ") },
        ],
      },
      {
        key: "submissions",
        label: "Round-wise submissions",
        detail: "Every submission mapped to its round and participant",
        rows: ops.submissions.map((s) => {
          const r = regById.get(s.registration_id);
          const rd = roundById.get(s.round_id);
          return {
            round_position: rd?.position ?? "",
            round_name: rd?.name ?? "",
            registration_code: r?.registration_code ?? "",
            participant: r ? (r.participation_type === "team" ? r.team_name || r.lead_name : r.lead_name) : "",
            email: r?.lead_email ?? "",
            status: s.status,
            score: s.score ?? "",
            text_response: s.text_response ?? "",
            link_url: s.link_url ?? "",
            files: ((s.files ?? []) as Row[]).map((f) => f.label ?? f.path).join("; "),
            reviewer_notes: s.reviewer_notes ?? "",
            submitted_at: s.submitted_at ? new Date(s.submitted_at).toLocaleString("en-IN") : "",
          };
        }),
        columns: [
          { header: "Round #", value: (r) => r.round_position },
          { header: "Round", value: (r) => r.round_name },
          { header: "Registration code", value: (r) => r.registration_code },
          { header: "Participant", value: (r) => r.participant },
          { header: "Email", value: (r) => r.email },
          { header: "Status", value: (r) => r.status },
          { header: "Score", value: (r) => r.score },
          { header: "Text response", value: (r) => r.text_response },
          { header: "Link", value: (r) => r.link_url },
          { header: "Files", value: (r) => r.files },
          { header: "Reviewer notes", value: (r) => r.reviewer_notes },
          { header: "Submitted at", value: (r) => r.submitted_at },
        ],
      },
      {
        key: "shortlist",
        label: "Shortlist results",
        detail: "Participants shortlisted, advanced or selected",
        rows: ops.registrations.filter((r) => SHORTLISTED.includes(r.status)),
        columns: [
          { header: "Registration code", value: (r) => r.registration_code },
          { header: "Participant", value: (r) => (r.participation_type === "team" ? r.team_name || r.lead_name : r.lead_name) },
          { header: "Email", value: (r) => r.lead_email },
          { header: "Team size", value: (r) => r.member_count ?? 1 },
          { header: "College", value: (r) => r.college ?? "" },
          { header: "Status", value: (r) => r.status },
          { header: "Current round", value: (r) => (r.current_round_id ? roundById.get(r.current_round_id)?.name ?? "" : "") },
        ],
      },
    ];
  }, [ops, regById, roundById]);

  function download(key: string, label: string, rows: Record<string, any>[], columns: Column<any>[], fmt: "csv" | "xlsx") {
    const name = `${ops.event.slug || "event"}-${key}-${FILE_TS()}`;
    if (fmt === "csv") exportCsv(name, rows, columns);
    else exportXlsx(name, label, rows, columns);
    logFn({ data: { event_id: eventId, dataset: `${key}:${fmt}`, rows: rows.length } }).catch(() => {});
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Downloads are generated from this event's live data. Every export is recorded in the audit trail.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {datasets.map((d) => (
          <div key={d.key} className="ink-border-sm flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4">
            <div className="min-w-0">
              <div className="font-chunk text-xl uppercase">{d.label}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{d.detail}</p>
              <p className={mono + " mt-1 text-ink/60"}>{d.rows.length} row{d.rows.length === 1 ? "" : "s"}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button disabled={!d.rows.length} onClick={() => download(d.key, d.label, d.rows, d.columns, "csv")} className={btn + " bg-cream " + mono}>CSV ↓</button>
              <button disabled={!d.rows.length} onClick={() => download(d.key, d.label, d.rows, d.columns, "xlsx")} className={btn + " bg-ink text-cream " + mono}>Excel ↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
