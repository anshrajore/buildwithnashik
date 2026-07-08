import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listTeams } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/teams")({
  component: TeamsPage,
});

function TeamsPage() {
  const fn = useServerFn(listTeams);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "teams"],
    queryFn: () => fn(),
  });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((r: any) =>
      !s || [r.team_name, r.lead_email, r.lead_name].some((v: any) => (v ?? "").toLowerCase().includes(s)),
    );
  }, [data, q]);

  return (
    <div>
      <PageHeader title="Teams" subtitle={`${data?.length ?? 0} registered`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search team name, lead name/email…"
          className="ink-border-sm w-full max-w-md rounded-full bg-cream px-4 py-2 font-sans"
        />
      </div>
      <div className="ink-border-sm overflow-hidden rounded-2xl bg-cream">
        <div className="grid grid-cols-[1fr,1fr,80px,120px,90px] gap-2 border-b-2 border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream">
          <div>Team</div>
          <div>Lead</div>
          <div>Size</div>
          <div>Created</div>
          <div>Changed</div>
        </div>
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No teams yet.</div>
        ) : (
          rows.map((r: any) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="grid w-full grid-cols-[1fr,1fr,80px,120px,90px] items-center gap-2 border-b border-ink/10 px-4 py-3 text-left text-sm hover:bg-yellow/40"
            >
              <div className="truncate font-bold">{r.team_name}</div>
              <div className="truncate">
                <div>{r.lead_name}</div>
                <div className="text-xs text-muted-foreground">{r.lead_email}</div>
              </div>
              <div>{r.member_count}</div>
              <div className="text-xs">{new Date(r.created_at).toLocaleDateString()}</div>
              <div className="text-xs">{r.members_changed_at ? "Yes" : "—"}</div>
            </button>
          ))
        )}
      </div>

      {selected && <Drawer team={selected} onClose={() => setSelected(null)} />}
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
