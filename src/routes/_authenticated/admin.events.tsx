import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listCommunityEvents, reviewCommunityEvent } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/events")({
  head: () => ({
    meta: [
      { title: "Event moderation · BWN Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEventsPage,
});

type Row = Record<string, any>;
const PER_PAGE = 10;
const STATUSES = ["all", "pending", "approved", "rejected"] as const;

function AdminEventsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listCommunityEvents);
  const review = useServerFn(reviewCommunityEvent);

  const [status, setStatus] = useState<(typeof STATUSES)[number]>("pending");
  const [mode, setMode] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "communityEvents"],
    queryFn: () => list() as Promise<Row[]>,
  });

  const mutate = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "approved" | "rejected"; review_note?: string }) =>
      review({ data: v }),
    onSuccess: async (_r, v) => {
      toast.success(
        v.status === "approved" ? "Event approved and published" : v.status === "rejected" ? "Event rejected" : "Moved back to pending",
      );
      setNote("");
      await qc.invalidateQueries({ queryKey: ["admin", "communityEvents"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const needle = q.trim().toLowerCase();
    return all.filter((e) => {
      const okStatus = status === "all" || e.status === status;
      const okMode = mode === "all" || e.mode === mode;
      const okQ =
        !needle ||
        [e.event_name, e.organiser_name, e.organiser_email, e.organisation, e.city, e.category].some((v: any) =>
          (v ?? "").toString().toLowerCase().includes(needle),
        );
      return okStatus && okMode && okQ;
    });
  }, [data, status, mode, q]);

  const pageRows = rows.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const counts = useMemo(() => {
    const all = data ?? [];
    return {
      pending: all.filter((e) => e.status === "pending").length,
      approved: all.filter((e) => e.status === "approved").length,
      rejected: all.filter((e) => e.status === "rejected").length,
    };
  }, [data]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-chunk text-3xl uppercase tracking-tight">Event moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review community submissions. Approving publishes the event on the public board immediately.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {([["Pending", counts.pending], ["Approved", counts.approved], ["Rejected", counts.rejected]] as const).map(
          ([label, n]) => (
            <div key={label} className="ink-border-sm rounded-xl bg-white p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">{label}</div>
              <div className="font-chunk text-3xl">{n}</div>
            </div>
          ),
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(0); }}
              className={`ink-border-sm rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                status === s ? "bg-ink text-cream" : "bg-cream text-ink"
              }`}
            >
              {s}
            </button>
          ))}
          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value); setPage(0); }}
            className="ink-border-sm rounded-full bg-cream px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest"
          >
            {["all", "offline", "online", "hybrid"].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Search event, organiser, city…"
          className="ink-border-sm w-full rounded-full bg-cream px-4 py-2 font-sans text-sm md:w-72"
        />
      </div>

      {isLoading ? (
        <div className="ink-border-sm rounded-xl bg-white p-8 text-center font-mono text-xs uppercase tracking-widest">Loading…</div>
      ) : pageRows.length === 0 ? (
        <div className="ink-border-sm rounded-xl bg-white p-8 text-center text-sm text-muted-foreground">
          No events match these filters.
        </div>
      ) : (
        <div className="grid gap-4">
          {pageRows.map((e) => {
            const open = openId === e.id;
            return (
              <article key={e.id} className="ink-border-sm overflow-hidden rounded-2xl bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`ink-border-sm rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                          e.status === "approved" ? "bg-yellow text-ink" : e.status === "rejected" ? "bg-rose text-ink" : "bg-cobalt text-cream"
                        }`}
                      >
                        {e.status}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                        {e.category} · {e.mode} · {new Date(e.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <h2 className="mt-2 truncate font-chunk text-2xl uppercase leading-tight">{e.event_name}</h2>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink/60">
                      {[e.organisation || e.organiser_name, e.city].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => { setOpenId(open ? null : e.id); setNote(e.review_note ?? ""); }}
                    className="ink-border-sm shrink-0 rounded-full bg-cream px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest"
                  >
                    {open ? "Close" : "Review"}
                  </button>
                </div>

                {open && (
                  <div className="grid gap-5 border-t-2 border-ink p-5 md:grid-cols-[240px,1fr]">
                    <div className="ink-border-sm overflow-hidden rounded-xl bg-cream">
                      {e.banner_url ? (
                        <img src={e.banner_url} alt={`${e.event_name} banner`} className="aspect-[16/9] w-full object-cover" />
                      ) : (
                        <div className="grid aspect-[16/9] place-items-center font-mono text-[10px] uppercase tracking-widest text-ink/50">
                          No banner
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <p className="text-sm leading-relaxed text-ink/80">{e.description}</p>
                      <dl className="grid gap-2 font-mono text-[11px] uppercase tracking-widest text-ink/70 sm:grid-cols-2">
                        <div>Dates · {[e.start_date, e.end_date].filter(Boolean).join(" → ") || "—"}</div>
                        <div>Team · {e.team_min}–{e.team_max}</div>
                        <div>Venue · {e.venue || "—"}</div>
                        <div>Organiser · {e.organiser_name}</div>
                        <div className="break-all normal-case tracking-normal">✉ {e.organiser_email}</div>
                        <div>☎ {e.organiser_phone}</div>
                      </dl>
                      <div className="flex flex-wrap gap-2">
                        {[["Register", e.register_url], ["Website", e.website_url], ["Maps", e.maps_url]]
                          .filter(([, u]) => Boolean(u))
                          .map(([label, u]) => (
                            <a
                              key={label as string}
                              href={u as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ink-border-sm rounded-full bg-cream px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                            >
                              {label} ↗
                            </a>
                          ))}
                      </div>

                      <label className="grid gap-1">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                          Note to organiser (sent with the decision)
                        </span>
                        <textarea
                          rows={3}
                          maxLength={600}
                          value={note}
                          onChange={(ev) => setNote(ev.target.value)}
                          placeholder="Optional — reason for rejection or a welcome note."
                          className="ink-border-sm rounded-lg bg-cream px-3 py-2 font-sans text-sm"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={mutate.isPending}
                          onClick={() => mutate.mutate({ id: e.id, status: "approved", review_note: note || undefined })}
                          className="ink-border-sm rounded-full bg-orange px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream disabled:opacity-60"
                        >
                          ✓ Approve & publish
                        </button>
                        <button
                          disabled={mutate.isPending}
                          onClick={() => mutate.mutate({ id: e.id, status: "rejected", review_note: note || undefined })}
                          className="ink-border-sm rounded-full bg-rose px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink disabled:opacity-60"
                        >
                          ✕ Reject
                        </button>
                        {e.status !== "pending" && (
                          <button
                            disabled={mutate.isPending}
                            onClick={() => mutate.mutate({ id: e.id, status: "pending", review_note: note || undefined })}
                            className="ink-border-sm rounded-full bg-cream px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
                          >
                            ↺ Back to pending
                          </button>
                        )}
                        <a
                          href={`mailto:${e.organiser_email}?subject=${encodeURIComponent(`Your event submission: ${e.event_name}`)}`}
                          className="ink-border-sm rounded-full bg-white px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                        >
                          ✉ Email organiser
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-widest">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="ink-border-sm rounded-full bg-cream px-4 py-2 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>Page {page + 1} / {pages} · {rows.length} events</span>
          <button
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1}
            className="ink-border-sm rounded-full bg-cream px-4 py-2 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
