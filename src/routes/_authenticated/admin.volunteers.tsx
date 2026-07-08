import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listVolunteers } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/volunteers")({
  component: VolunteersPage,
});

function VolunteersPage() {
  const fn = useServerFn(listVolunteers);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "volunteers"], queryFn: () => fn() });
  const [sel, setSel] = useState<any>(null);

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{data?.length ?? 0} signups</div>
        <h1 className="font-chunk text-4xl uppercase tracking-tight">Volunteers</h1>
      </div>
      <div className="ink-border-sm overflow-hidden rounded-2xl bg-cream">
        <div className="grid grid-cols-[1fr,1fr,140px,120px] gap-2 border-b-2 border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream">
          <div>Name</div>
          <div>Contact</div>
          <div>Interest</div>
          <div>Received</div>
        </div>
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No signups yet.</div>
        ) : (
          data!.map((r: any) => (
            <button key={r.id} onClick={() => setSel(r)} className="grid w-full grid-cols-[1fr,1fr,140px,120px] gap-2 border-b border-ink/10 px-4 py-3 text-left text-sm hover:bg-yellow/30">
              <div className="truncate font-bold">{r.full_name}</div>
              <div className="truncate">
                <div>{r.email}</div>
                <div className="text-xs text-muted-foreground">{r.phone}</div>
              </div>
              <div className="truncate text-xs">{r.interest ?? "—"}</div>
              <div className="text-xs">{new Date(r.created_at).toLocaleDateString()}</div>
            </button>
          ))
        )}
      </div>
      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 backdrop-blur-sm p-4" onClick={() => setSel(null)}>
          <div onClick={(e) => e.stopPropagation()} className="ink-border-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cream p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Volunteer</div>
                <div className="font-chunk text-3xl uppercase tracking-tight">{sel.full_name}</div>
              </div>
              <button onClick={() => setSel(null)} className="ink-border-sm h-9 w-9 rounded-full">✕</button>
            </div>
            <pre className="mt-4 max-h-[60vh] overflow-auto rounded-lg bg-ink/5 p-3 text-xs">{JSON.stringify(sel, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
