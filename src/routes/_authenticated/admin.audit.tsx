import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listAuditLog, type AuditRow } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

const PAGE_SIZE = 25;

const ACTION_META: Record<string, { label: string; tone: string }> = {
  admin_access_granted: { label: "Admin granted", tone: "bg-cobalt text-cream" },
  admin_access_revoked: { label: "Admin revoked", tone: "bg-rose text-ink" },
  first_admin_claimed: { label: "First admin claimed", tone: "bg-orange text-cream" },
  event_created: { label: "Event created", tone: "bg-yellow text-ink" },
  event_published: { label: "Event published", tone: "bg-cobalt text-cream" },
  event_status_changed: { label: "Event status", tone: "bg-yellow text-ink" },
  registration_status_changed: { label: "Registration status", tone: "bg-yellow text-ink" },
  submission_reviewed: { label: "Submission reviewed", tone: "bg-cobalt text-cream" },
  data_exported: { label: "Data exported", tone: "bg-cream text-ink" },
  emails_sent: { label: "Emails sent", tone: "bg-cream text-ink" },
};

const FILTERS = [
  { key: "admin", label: "Admin access", match: (a: string) => a.startsWith("admin_access") || a === "first_admin_claimed" },
  { key: "granted", label: "Granted", match: (a: string) => a === "admin_access_granted" || a === "first_admin_claimed" },
  { key: "revoked", label: "Revoked", match: (a: string) => a === "admin_access_revoked" },
  { key: "all", label: "All activity", match: () => true },
] as const;

function fmtDateTime(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function AuditPage() {
  const fn = useServerFn(listAuditLog);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("admin");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "audit", page],
    queryFn: () => fn({ data: { page } }) as Promise<{ rows: AuditRow[]; total: number }>,
  });

  const rows = data?.rows ?? [];
  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!activeFilter.match(r.action)) return false;
      if (!q) return true;
      const targetEmail = String((r.metadata as any)?.target_email ?? "").toLowerCase();
      const targetName = String((r.metadata as any)?.target_name ?? "").toLowerCase();
      return (
        (r.actor_email ?? "").toLowerCase().includes(q) ||
        targetEmail.includes(q) ||
        targetName.includes(q) ||
        r.action.toLowerCase().includes(q)
      );
    });
  }, [rows, search, activeFilter]);

  // Server paginates; client filter may hide entries — offer next page whenever a full page exists.
  const hasMore = filtered.length === PAGE_SIZE;
  const total = data?.total ?? 0;

  function renderWho(r: AuditRow) {
    const targetEmail = String((r.metadata as any)?.target_email ?? "") || "—";
    const targetName = String((r.metadata as any)?.target_name ?? "") || "";
    return (
      <div>
        <div className="font-medium">{targetName || targetEmail}</div>
        <div className="text-xs text-muted-foreground">{targetName ? targetEmail : "account"}</div>
      </div>
    );
  }

  function renderDetail(r: AuditRow) {
    const role = String((r.new_value as any)?.role ?? "admin");
    if (r.action === "admin_access_granted") return `Granted the ${role} role`;
    if (r.action === "admin_access_revoked") return `Removed the ${role} role`;
    if (r.action === "first_admin_claimed") return "Claimed the first admin role";
    return r.entity_type ? `${r.entity_type.replace(/_/g, " ")}` : "—";
  }

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Trail</div>
        <h1 className="font-chunk text-4xl uppercase tracking-tight">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who changed admin access, for whom, and when. Entries cannot be edited or deleted.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(0);
            }}
            className={`ink-border-sm rounded-full px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
              filter === f.key ? "bg-ink text-cream" : "bg-white text-ink/70 hover:bg-ink/5"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search who or whom…"
          className="ink-border-sm ml-auto w-full max-w-xs rounded-full bg-white px-4 py-2 text-sm outline-none placeholder:text-ink/40"
        />
      </div>

      {isLoading ? (
        <div className="ink-border-sm rounded-2xl bg-white p-10 text-center font-mono text-xs uppercase tracking-widest">Loading trail…</div>
      ) : error ? (
        <div className="ink-border-sm rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground">
          {(error as Error).message ?? "Could not load the audit log."}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ink-border-sm rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground">No entries yet.</div>
      ) : (
        <div className="ink-border-sm overflow-hidden rounded-2xl bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-cream text-left font-mono text-[10px] uppercase tracking-widest">
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Performed by</th>
                <th className="px-4 py-3">On</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const meta = ACTION_META[r.action] ?? { label: r.action.replace(/_/g, " "), tone: "bg-cream text-ink" };
                return (
                  <tr key={r.id} className="border-b border-ink/10 last:border-b-0">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.actor_email || "—"}</div>
                      {r.actor_role ? <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{r.actor_role}</div> : null}
                    </td>
                    <td className="px-4 py-3">{renderWho(r)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{renderDetail(r)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">{fmtDateTime(r.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(page > 0 || hasMore) && (
        <div className="mt-4 flex items-center justify-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="ink-border-sm rounded-full bg-white px-4 py-2 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            {total} entr{total === 1 ? "y" : "ies"}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
            className="ink-border-sm rounded-full bg-white px-4 py-2 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
