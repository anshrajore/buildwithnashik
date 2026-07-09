import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { listTeams } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/teams")({
  component: TeamsPage,
});

const PAGE_SIZE = 20;

function TeamsPage() {
  const fn = useServerFn(listTeams);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "teams"],
    queryFn: () => fn(),
  });
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [submission, setSubmission] = useState<"all" | "with" | "without">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const tracks = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((r: any) => r.track && set.add(r.track));
    return Array.from(set).sort();
  }, [data]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((r: any) => r.status && set.add(r.status));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((r: any) => {
      if (s && ![r.team_name, r.lead_email, r.lead_name].some((v: any) => (v ?? "").toLowerCase().includes(s))) return false;
      if (track !== "all" && r.track !== track) return false;
      if (status !== "all" && r.status !== status) return false;
      if (submission === "with" && !r.ppt_url) return false;
      if (submission === "without" && r.ppt_url) return false;
      return true;
    });
  }, [data, q, track, status, submission]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // reset to page 1 when filters change
  useMemo(() => setPage(1), [q, track, status, submission]);

  return (
    <div>
      <PageHeader title="Teams" subtitle={`${filtered.length} of ${data?.length ?? 0}`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search team, lead name/email…"
          className="ink-border-sm min-w-[220px] flex-1 rounded-full bg-cream px-4 py-2 font-sans"
        />
        <Select label="Track" value={track} onChange={setTrack} options={["all", ...tracks]} />
        <Select label="Status" value={status} onChange={setStatus} options={["all", ...statuses]} />
        <Select label="PPT" value={submission} onChange={(v) => setSubmission(v as any)} options={["all", "with", "without"]} />
      </div>
      <div className="ink-border-sm overflow-hidden rounded-2xl bg-cream">
        <div className="grid grid-cols-[1fr,1fr,90px,80px,110px,80px] gap-2 border-b-2 border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream">
          <div>Team</div>
          <div>Lead</div>
          <div>Track</div>
          <div>Size</div>
          <div>Created</div>
          <div>PPT</div>
        </div>
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No teams match.</div>
        ) : (
          rows.map((r: any) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="grid w-full grid-cols-[1fr,1fr,90px,80px,110px,80px] items-center gap-2 border-b border-ink/10 px-4 py-3 text-left text-sm hover:bg-yellow/40"
            >
              <div className="truncate font-bold">{r.team_name}</div>
              <div className="truncate">
                <div>{r.lead_name}</div>
                <div className="text-xs text-muted-foreground">{r.lead_email}</div>
              </div>
              <div className="truncate text-xs">{r.track ?? "—"}</div>
              <div>{r.member_count}</div>
              <div className="text-xs">{new Date(r.created_at).toLocaleDateString()}</div>
              <div className="text-xs">{r.ppt_url ? "✓" : "—"}</div>
            </button>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
      )}

      {selected && <Drawer team={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest">
      <span className="text-ink/60">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent focus:outline-none">
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function Pagination({ page, totalPages, onChange, total, pageSize }: { page: number; totalPages: number; onChange: (p: number) => void; total: number; pageSize: number }) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {from}–{to} of {total}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="ink-border-sm rounded-full bg-cream px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="font-mono text-[10px] uppercase tracking-widest">Page {page} / {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="ink-border-sm rounded-full bg-cream px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}


function Drawer({ team, onClose }: { team: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cream p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Team</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">{team.team_name}</div>
          </div>
          <button onClick={onClose} className="ink-border-sm h-9 w-9 rounded-full">✕</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
          <Field label="Lead">{team.lead_name}</Field>
          <Field label="Email">{team.lead_email}</Field>
          <Field label="Phone">{team.lead_phone}</Field>
          <Field label="College">{team.college ?? "—"}</Field>
          <Field label="Track">{team.track ?? "—"}</Field>
          <Field label="Size">{team.member_count}</Field>
          <Field label="Created">{new Date(team.created_at).toLocaleString()}</Field>
          <Field label="Members changed">{team.members_changed_at ? new Date(team.members_changed_at).toLocaleString() : "—"}</Field>
        </div>
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Members</div>
          <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-ink/5 p-3 text-xs">{JSON.stringify(team.members, null, 2)}</pre>
        </div>
        {(team.ppt_url || team.submission_notes) && (
          <div className="mt-4 grid gap-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Submission</div>
            {team.ppt_url && (
              <a href={team.ppt_url} target="_blank" rel="noreferrer" className="text-sm underline text-cobalt break-all">
                {team.ppt_url}
              </a>
            )}
            {team.submission_notes && <p className="text-sm">{team.submission_notes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</div>
      <h1 className="font-chunk text-4xl uppercase tracking-tight">{title}</h1>
    </div>
  );
}
