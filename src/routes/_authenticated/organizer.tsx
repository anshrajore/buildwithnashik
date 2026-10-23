import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { createEvent } from "@/lib/events.functions";
import { listMyEventSummaries } from "@/lib/organizer.functions";
import { EVENT_CATEGORIES, EVENT_TYPE_PRESETS, eventCodeFrom, fmtDate, humanStatus, slugify, statusTone } from "@/lib/event-utils";

export const Route = createFileRoute("/_authenticated/organizer")({
  head: () => ({
    meta: [
      { title: "Organizer console · Team Nest" },
      { name: "description", content: "Your event operations console — registrations, rounds, emails and exports." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrganizerHome,
});

type Row = Record<string, any>;

function OrganizerHome() {
  const list = useServerFn(listMyEventSummaries);
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer", "summaries"],
    queryFn: () => list() as Promise<{ rows: Row[] }>,
  });
  const rows = data?.rows ?? [];
  const totals = rows.reduce(
    (a, e) => ({
      registrations: a.registrations + (e.total_registrations ?? 0),
      pending: a.pending + (e.pending_registrations ?? 0),
      shortlisted: a.shortlisted + (e.shortlisted_registrations ?? 0),
    }),
    { registrations: 0, pending: 0, shortlisted: 0 },
  );

  return (
    <div className="min-h-screen bg-cream paper text-ink">
      <Toaster position="top-center" theme="light" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/dashboard" className="font-mono text-[10px] uppercase tracking-widest text-ink/60 hover:text-ink">
              ← Back to hub
            </Link>
            <h1 className="mt-2 font-chunk text-4xl uppercase tracking-tight">Organizer console</h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink/50">
              Only events you created or co-organize appear here
            </p>
          </div>
          <NewEventButton />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {([["Total registrations", totals.registrations], ["Awaiting review", totals.pending], ["Shortlisted", totals.shortlisted]] as const).map(
            ([label, n]) => (
              <div key={label} className="ink-border-sm rounded-xl bg-white p-4">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">{label}</div>
                <div className="font-chunk text-3xl">{n}</div>
              </div>
            ),
          )}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="ink-border-sm rounded-xl bg-white p-10 text-center font-mono text-xs uppercase tracking-widest">Loading your events…</div>
          ) : error ? (
            <div className="ink-border-sm rounded-xl bg-white p-10 text-center text-sm text-muted-foreground">
              {(error as Error).message ?? "Could not load your events."}
            </div>
          ) : rows.length === 0 ? (
            <div className="ink-border-sm rounded-xl bg-white p-10 text-center">
              <div className="font-chunk text-2xl uppercase">No events yet</div>
              <p className="mt-2 text-sm text-muted-foreground">Create your first event to open its operations dashboard.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rows.map((e) => (
                <article key={e.id} className="ink-border-sm rounded-2xl bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`ink-border-sm rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                            statusTone(e.status) === "success"
                              ? "bg-yellow text-ink"
                              : statusTone(e.status) === "danger"
                                ? "bg-rose text-ink"
                                : statusTone(e.status) === "info"
                                  ? "bg-cobalt text-cream"
                                  : "bg-cream text-ink"
                          }`}
                        >
                          {humanStatus(e.status)}
                        </span>
                        {!e.is_owner && (
                          <span className="font-mono text-[9px] uppercase tracking-widest text-ink/50">Co-organizer</span>
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                          {e.category} · {e.mode} · {e.code}
                        </span>
                      </div>
                      <h2 className="mt-2 font-chunk text-2xl uppercase leading-tight">{e.name}</h2>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink/60">
                        {[e.city, e.start_at ? fmtDate(e.start_at) : null, `${e.round_count} rounds`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        to="/events/$slug"
                        params={{ slug: e.slug }}
                        className="ink-border-sm rounded-full bg-cream px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest"
                      >
                        Public page ↗
                      </Link>
                      <Link
                        to="/organizer/$eventId"
                        params={{ eventId: e.id }}
                        className="ink-border-sm rounded-full bg-orange px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
                      >
                        Open dashboard →
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-widest text-ink/60">
                    <div><span className="font-chunk text-xl text-ink">{e.total_registrations}</span> registered</div>
                    <div><span className="font-chunk text-xl text-ink">{e.pending_registrations}</span> pending</div>
                    <div><span className="font-chunk text-xl text-ink">{e.shortlisted_registrations}</span> shortlisted</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- create event ---------------- */

function NewEventButton() {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="ink-border-sm rounded-full bg-ink px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
      >
        + New event
      </button>
    );
  return <CreateEventDialog onClose={() => setOpen(false)} />;
}

function CreateEventDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createEvent);
  const saveRoundsFn = useServerFn(require("@/lib/events.functions").saveRounds);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    category: "Hackathon" as string,
    event_type: "hackathon",
    mode: "offline",
    city: "Nashik",
    start_at: "",
    end_at: "",
    registration_closes_at: "",
    participation_type: "both",
    team_min: 1,
    team_max: 4,
    description: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const mutate = useMutation({
    mutationFn: async () => {
      const slug = slugify(form.name);
      const res: any = await create({
        data: {
          name: form.name,
          slug,
          tagline: form.tagline || null,
          description: form.description,
          category: form.category,
          event_type: form.event_type,
          mode: form.mode,
          city: form.city || null,
          venue: null,
          maps_url: null,
          online_url: null,
          start_at: form.start_at || null,
          end_at: form.end_at || null,
          registration_opens_at: null,
          registration_closes_at: form.registration_closes_at || null,
          website_url: null,
          register_url: null,
          links: [],
          faqs: [],
          contact_name: null,
          contact_email: null,
          contact_phone: null,
          participation_type: form.participation_type,
          team_min: Number(form.team_min) || 1,
          team_max: Number(form.team_max) || 4,
          team_name_required: form.participation_type !== "individual",
          capacity: null,
          eligibility: null,
          college_restriction: null,
          required_participant_fields: [],
          required_documents: [],
          custom_questions: [],
          highlights: [],
          stats: [],
          code: eventCodeFrom(form.name),
        },
      });
      if (res?.ok && res.id) {
        const preset = EVENT_TYPE_PRESETS[form.event_type]?.rounds ?? [];
        await saveRoundsFn({
          data: {
            event_id: res.id,
            rounds: preset.map((r, i) => ({
              position: i + 1,
              name: r.name,
              round_type: r.round_type as any,
              description: r.description,
              starts_at: null,
              ends_at: null,
              submission_deadline: null,
              submission_requirements: [],
              allow_file: true,
              allow_link: true,
              allow_text: true,
              is_enabled: true,
              submissions_open: r.round_type !== "registration",
            })),
          },
        });
      }
      return res;
    },
    onSuccess: async (res: any) => {
      if (res?.ok) {
        toast.success("Event created — open its dashboard to publish");
        await qc.invalidateQueries({ queryKey: ["organizer", "summaries"] });
        onClose();
        navigate({ to: "/organizer/$eventId", params: { eventId: res.id } });
      } else toast.error(res?.message ?? "Could not create the event");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not create the event"),
  });

  const field = "ink-border-sm w-full rounded-lg bg-cream px-3 py-2 font-sans text-sm";
  const label = "font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div
        className="ink-border-lg max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-cream p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-chunk text-2xl uppercase">Create event</h2>
          <button onClick={onClose} className="font-mono text-[10px] uppercase tracking-widest text-ink/60">Close ✕</button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); mutate.mutate(); }}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <label className={`grid gap-1 sm:col-span-2`}><span className={label}>Event name *</span>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={field} placeholder="Build With Nashik 2026" />
          </label>
          <label className="grid gap-1 sm:col-span-2"><span className={label}>Tagline</span>
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={field} placeholder="36 hours. 500+ builders." />
          </label>
          <label className="grid gap-1"><span className={label}>Category</span>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={field}>
              {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="grid gap-1"><span className={label}>Format preset</span>
            <select value={form.event_type} onChange={(e) => set("event_type", e.target.value)} className={field}>
              {Object.entries(EVENT_TYPE_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label className="grid gap-1"><span className={label}>Mode</span>
            <select value={form.mode} onChange={(e) => set("mode", e.target.value)} className={field}>
              {["offline", "online", "hybrid"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="grid gap-1"><span className={label}>City</span>
            <input value={form.city} onChange={(e) => set("city", e.target.value)} className={field} />
          </label>
          <label className="grid gap-1"><span className={label}>Starts at</span>
            <input type="datetime-local" value={form.start_at} onChange={(e) => set("start_at", e.target.value)} className={field} />
          </label>
          <label className="grid gap-1"><span className={label}>Ends at</span>
            <input type="datetime-local" value={form.end_at} onChange={(e) => set("end_at", e.target.value)} className={field} />
          </label>
          <label className="grid gap-1"><span className={label}>Registration closes</span>
            <input type="datetime-local" value={form.registration_closes_at} onChange={(e) => set("registration_closes_at", e.target.value)} className={field} />
          </label>
          <label className="grid gap-1"><span className={label}>Participation</span>
            <select value={form.participation_type} onChange={(e) => set("participation_type", e.target.value)} className={field}>
              {["both", "individual", "team"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1"><span className={label}>Team min</span>
              <input type="number" min={1} max={50} value={form.team_min} onChange={(e) => set("team_min", e.target.value)} className={field} />
            </label>
            <label className="grid gap-1"><span className={label}>Team max</span>
              <input type="number" min={1} max={50} value={form.team_max} onChange={(e) => set("team_max", e.target.value)} className={field} />
            </label>
          </div>
          <label className="grid gap-1 sm:col-span-2"><span className={label}>Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={field} placeholder="What is this event about?" />
          </label>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="ink-border-sm rounded-full bg-white px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest">Cancel</button>
            <button disabled={mutate.isPending} className="ink-border-sm rounded-full bg-orange px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream disabled:opacity-60">
              {mutate.isPending ? "Creating…" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
