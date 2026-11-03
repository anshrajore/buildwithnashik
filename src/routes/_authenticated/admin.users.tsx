import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listUserAccounts, setUserAdmin, type UserAccountRow } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

const PAGE_SIZE = 15;

const ROLE_TONES: Record<string, string> = {
  admin: "bg-orange text-cream",
  organizer: "bg-cobalt text-cream",
  mentor: "bg-yellow text-ink",
  builder: "bg-yellow text-ink",
  campus_lead: "bg-yellow text-ink",
  volunteer: "bg-rose text-ink",
  founder: "bg-cobalt text-cream",
  team_member: "bg-cream text-ink",
  participant: "bg-cream text-ink",
  moderator: "bg-cobalt text-cream",
  user: "bg-cream text-ink",
};

function fmtDay(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function UsersPage() {
  const fn = useServerFn(listUserAccounts);
  const setAdmin = useServerFn(setUserAdmin);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fn() as Promise<{ rows: UserAccountRow[]; userId: string }>,
  });

  const rows = data?.rows ?? [];
  const me = data?.userId ?? null;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.email.toLowerCase().includes(q) || (r.full_name ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const mutation = useMutation({
    mutationFn: (v: { user_id: string; grant: boolean }) => setAdmin({ data: v }),
    onSuccess: (res: any, v) => {
      if (res?.ok) {
        toast.success(v.grant ? "Admin access granted" : "Admin access revoked");
        qc.invalidateQueries({ queryKey: ["admin", "users"] });
      } else {
        toast.error(res?.message ?? "Could not update admin access");
      }
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
    onSettled: () => setBusyId(null),
  });

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Accounts</div>
        <h1 className="font-chunk text-4xl uppercase tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every account with access to the site, and who holds admin.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search name or email…"
          className="ink-border-sm w-full max-w-xs rounded-full bg-white px-4 py-2 text-sm outline-none placeholder:text-ink/40"
        />
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
          {filtered.length} account{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <div className="ink-border-sm rounded-2xl bg-white p-10 text-center font-mono text-xs uppercase tracking-widest">Loading accounts…</div>
      ) : error ? (
        <div className="ink-border-sm rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground">
          {(error as Error).message ?? "Could not load accounts."}
        </div>
      ) : paged.length === 0 ? (
        <div className="ink-border-sm rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground">No accounts match.</div>
      ) : (
        <div className="ink-border-sm overflow-hidden rounded-2xl bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-cream text-left font-mono text-[10px] uppercase tracking-widest">
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last signed in</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3 text-right">Admin access</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.id} className="border-b border-ink/10 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{fmtDay(r.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{fmtDay(r.last_sign_in_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.roles.length === 0 ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">—</span>
                      ) : (
                        r.roles.map((role) => (
                          <span
                            key={role}
                            className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                              ROLE_TONES[role] ?? "bg-cream text-ink"
                            }`}
                          >
                            {role}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.roles.includes("admin") ? (
                      <button
                        onClick={() => {
                          setBusyId(r.id);
                          mutation.mutate({ user_id: r.id, grant: false });
                        }}
                        disabled={busyId === r.id}
                        className="ink-border-sm rounded-full bg-rose px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                      >
                        Revoke admin
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBusyId(r.id);
                          mutation.mutate({ user_id: r.id, grant: true });
                        }}
                        disabled={busyId === r.id}
                        className="ink-border-sm rounded-full bg-cobalt px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream disabled:opacity-50"
                      >
                        Grant admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest">
          <button
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="ink-border-sm rounded-full bg-white px-4 py-2 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
            disabled={safePage >= pageCount - 1}
            className="ink-border-sm rounded-full bg-white px-4 py-2 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
