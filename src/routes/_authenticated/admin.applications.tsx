import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listApplications, updateApplicationStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  component: ApplicationsPage,
});

type Row = any;

function ApplicationsPage() {
  const list = useServerFn(listApplications);
  const update = useServerFn(updateApplicationStatus);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: () => list(),
  });

  const mut = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" | "pending" }) =>
      update({ data: v }),
    onSuccess: (_d, v) => {
      toast.success(`Marked ${v.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const [type, setType] = useState<"all" | "mentor" | "judge">("all");
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selected, setSelected] = useState<Row | null>(null);

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (r: Row) =>
          (type === "all" || r.application_type === type) &&
          (status === "all" || r.status === status),
      ),
    [data, type, status],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {data?.length ?? 0} total
          </div>
          <h1 className="font-chunk text-4xl uppercase tracking-tight">Mentors & Judges</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Segmented value={type} onChange={setType as any} options={["all", "mentor", "judge"]} />
          <Segmented value={status} onChange={setStatus as any} options={["all", "pending", "approved", "rejected"]} />
        </div>
      </div>

      <div className="ink-border-sm overflow-hidden rounded-2xl bg-cream">
        <div className="grid grid-cols-[80px,1fr,1fr,110px,110px] gap-2 border-b-2 border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream">
          <div>Type</div>
          <div>Name</div>
          <div>Org / Title</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No applications match.</div>
        ) : (
          rows.map((r: Row) => (
            <div
              key={r.id}
              className="grid grid-cols-[80px,1fr,1fr,110px,110px] items-center gap-2 border-b border-ink/10 px-4 py-3 text-sm hover:bg-yellow/30"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest">{r.application_type}</div>
              <button className="truncate text-left" onClick={() => setSelected(r)}>
                <div className="font-bold">{r.full_name}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </button>
              <div className="truncate">
                <div>{r.current_title}</div>
                <div className="text-xs text-muted-foreground">{r.organization}</div>
              </div>
              <StatusPill status={r.status} />
              <div className="flex gap-1">
                <button
                  disabled={mut.isPending}
                  onClick={() => mut.mutate({ id: r.id, status: "approved" })}
                  className="ink-border-sm rounded-full bg-cobalt px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
                >
                  ✓
                </button>
                <button
                  disabled={mut.isPending}
                  onClick={() => mut.mutate({ id: r.id, status: "rejected" })}
                  className="ink-border-sm rounded-full bg-rose px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && <Detail row={selected} onClose={() => setSelected(null)} onAction={(s) => mut.mutate({ id: selected.id, status: s })} />}
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: T[] }) {
  return (
    <div className="inline-flex ink-border-sm rounded-full bg-cream p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
            value === o ? "bg-ink text-cream" : "text-ink/60"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow text-ink",
    approved: "bg-cobalt text-cream",
    rejected: "bg-rose text-ink",
  };
  return <span className={`inline-block rounded-full px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${map[status] ?? "bg-ink/10"}`}>{status}</span>;
}

function Detail({ row, onClose, onAction }: { row: any; onClose: () => void; onAction: (s: "approved" | "rejected" | "pending") => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cream p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{row.application_type}</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">{row.full_name}</div>
            <div className="text-sm text-muted-foreground">{row.current_title} · {row.organization}</div>
          </div>
          <button onClick={onClose} className="ink-border-sm h-9 w-9 rounded-full">✕</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
          <Field label="Email">{row.email}</Field>
          <Field label="Phone">{row.phone}</Field>
          <Field label="City">{row.city ?? "—"}</Field>
          <Field label="Experience">{row.experience_years} years</Field>
          <Field label="LinkedIn">{row.linkedin_url ? <a className="text-cobalt underline break-all" href={row.linkedin_url} target="_blank" rel="noreferrer">{row.linkedin_url}</a> : "—"}</Field>
          <Field label="Availability">{row.availability ?? "—"}</Field>
        </div>
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Expertise</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {(row.expertise ?? "").split(",").map((t: string) => t.trim()).filter(Boolean).map((t: string) => (
              <span key={t} className="ink-border-sm rounded-full bg-cream px-2 py-1 font-mono text-[10px] uppercase tracking-widest">{t}</span>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bio</div>
          <p className="text-sm whitespace-pre-wrap">{row.bio}</p>
        </div>
        {row.motivation && (
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Motivation</div>
            <p className="text-sm whitespace-pre-wrap">{row.motivation}</p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => onAction("approved")} className="ink-border-sm rounded-full bg-cobalt px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">Approve</button>
          <button onClick={() => onAction("rejected")} className="ink-border-sm rounded-full bg-rose px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">Reject</button>
          <button onClick={() => onAction("pending")} className="ink-border-sm rounded-full bg-yellow px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">Mark pending</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
