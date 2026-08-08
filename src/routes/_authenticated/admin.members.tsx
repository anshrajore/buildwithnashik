import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  listMembershipApplications,
  listNestMembers,
  reviewMembershipApplication,
  createMemberLogin,
  setMemberStatus,
} from "@/lib/nest-members.functions";

export const Route = createFileRoute("/_authenticated/admin/members")({
  component: AdminMembersPage,
});

const TRACKS = ["builder", "campus_lead", "volunteer", "mentor"] as const;

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function AdminMembersPage() {
  const qc = useQueryClient();
  const fetchApps = useServerFn(listMembershipApplications);
  const fetchMembers = useServerFn(listNestMembers);
  const review = useServerFn(reviewMembershipApplication);
  const createLogin = useServerFn(createMemberLogin);
  const setStatus = useServerFn(setMemberStatus);

  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);

  const apps = useQuery({ queryKey: ["admin", "nestApps"], queryFn: () => fetchApps(), retry: false });
  const members = useQuery({ queryKey: ["admin", "nestMembers"], queryFn: () => fetchMembers(), retry: false });

  const rows = useMemo(() => {
    const all = (apps.data?.rows ?? []) as any[];
    return all.filter(
      (r) => (trackFilter === "all" || r.track === trackFilter) && (statusFilter === "all" || r.status === statusFilter),
    );
  }, [apps.data, trackFilter, statusFilter]);

  async function doReview(id: string, status: "approved" | "rejected") {
    const note = status === "rejected" ? window.prompt("Reason (optional, shown to applicant):") ?? "" : "";
    setBusy(id);
    try {
      await review({ data: { id, status, review_note: note || null } });
      toast.success(status === "approved" ? "Approved" : "Rejected");
      await qc.invalidateQueries({ queryKey: ["admin", "nestApps"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function issueLogin(row: any) {
    const password = randomPassword();
    setBusy(row.id);
    try {
      const res: any = await createLogin({
        data: {
          email: row.email,
          full_name: row.full_name,
          track: row.track,
          title: row.organisation ?? null,
          temp_password: password,
          application_id: row.id,
        },
      });
      if (!res?.ok) {
        toast.error(res?.message ?? "Could not create login");
        return;
      }
      setIssued({ email: row.email, password });
      toast.success("Login created and role assigned");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "nestApps"] }),
        qc.invalidateQueries({ queryKey: ["admin", "nestMembers"] }),
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function manualLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = randomPassword();
    const email = String(fd.get("email") ?? "");
    setBusy("manual");
    try {
      const res: any = await createLogin({
        data: {
          email,
          full_name: String(fd.get("full_name") ?? ""),
          track: String(fd.get("track") ?? "volunteer") as any,
          title: String(fd.get("title") ?? "") || null,
          temp_password: password,
        },
      });
      if (!res?.ok) {
        toast.error(res?.message ?? "Could not create login");
        return;
      }
      setIssued({ email, password });
      toast.success("Login created");
      e.currentTarget.reset();
      await qc.invalidateQueries({ queryKey: ["admin", "nestMembers"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  }

  const chip = "ink-border-sm rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest";
  const field = "ink-border-sm w-full rounded-lg bg-white px-3 py-2 font-sans text-sm";

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-chunk text-3xl uppercase tracking-tight">Nest members</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review join applications, assign roles, and issue crew logins for role-specific dashboards.
        </p>
      </div>

      {issued && (
        <div className="ink-border-lg rounded-2xl bg-yellow p-5">
          <div className="font-chunk text-xl uppercase tracking-tight">Share these credentials once</div>
          <p className="mt-1 font-mono text-xs">
            {issued.email} · <strong>{issued.password}</strong>
          </p>
          <p className="mt-1 text-xs text-ink/70">
            The member should change this password from their dashboard. This is the only time it's shown.
          </p>
          <button onClick={() => setIssued(null)} className={`${chip} mt-3 bg-ink text-cream`}>
            Done
          </button>
        </div>
      )}

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Track</span>
          {["all", ...TRACKS].map((t) => (
            <button
              key={t}
              onClick={() => setTrackFilter(t)}
              className={`${chip} ${trackFilter === t ? "bg-ink text-cream" : "bg-cream"}`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
          <span className="ml-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</span>
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`${chip} ${statusFilter === s ? "bg-ink text-cream" : "bg-cream"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {apps.isLoading ? (
          <div className="font-mono text-xs uppercase tracking-widest">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="ink-border-sm rounded-xl bg-cream p-6 text-sm text-muted-foreground">No applications.</div>
        ) : (
          <div className="grid gap-3">
            {rows.map((r) => (
              <article key={r.id} className="ink-border-sm rounded-xl bg-cream p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-chunk text-xl uppercase tracking-tight">{r.full_name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {r.email} · {r.phone} {r.city ? `· ${r.city}` : ""} {r.organisation ? `· ${r.organisation}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`${chip} bg-white`}>{String(r.track).replace("_", " ")}</span>
                    <span className={`${chip} ${r.status === "approved" ? "bg-yellow" : r.status === "rejected" ? "bg-rose" : "bg-white"}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
                {r.skills && <p className="mt-2 text-sm">{r.skills}</p>}
                <p className="mt-2 text-sm text-ink/75">{r.motivation}</p>
                {r.portfolio_url && (
                  <a href={r.portfolio_url} target="_blank" rel="noreferrer" className="mt-2 inline-block font-mono text-[11px] underline">
                    {r.portfolio_url}
                  </a>
                )}
                {r.review_note && <p className="mt-2 font-mono text-[11px] text-muted-foreground">Note: {r.review_note}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled={busy === r.id} onClick={() => doReview(r.id, "approved")} className={`${chip} bg-cream disabled:opacity-50`}>
                    Approve
                  </button>
                  <button disabled={busy === r.id} onClick={() => doReview(r.id, "rejected")} className={`${chip} bg-cream disabled:opacity-50`}>
                    Reject
                  </button>
                  <button disabled={busy === r.id} onClick={() => issueLogin(r)} className={`${chip} bg-orange text-cream disabled:opacity-50`}>
                    {busy === r.id ? "…" : "Approve + issue login"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="ink-border-lg rounded-2xl bg-cream p-6">
        <div className="font-chunk text-2xl uppercase tracking-tight">Create a member login</div>
        <p className="mt-1 text-sm text-muted-foreground">
          For volunteer crew and staff who don't apply publicly. A temporary password is generated and shown once.
        </p>
        <form onSubmit={manualLogin} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="full_name" required placeholder="Full name" className={field} />
          <input name="email" type="email" required placeholder="Email" className={field} />
          <select name="track" className={field} defaultValue="volunteer">
            {TRACKS.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
          <input name="title" placeholder="Title / team (optional)" className={field} />
          <button disabled={busy === "manual"} className={`${chip} bg-ink text-cream sm:col-span-2 disabled:opacity-50`}>
            {busy === "manual" ? "Creating…" : "Create login + assign role"}
          </button>
        </form>
      </section>

      <section className="grid gap-3">
        <div className="font-chunk text-2xl uppercase tracking-tight">Active members</div>
        {members.isLoading ? (
          <div className="font-mono text-xs uppercase tracking-widest">Loading…</div>
        ) : (members.data?.rows ?? []).length === 0 ? (
          <div className="ink-border-sm rounded-xl bg-cream p-6 text-sm text-muted-foreground">No members yet.</div>
        ) : (
          <div className="grid gap-2">
            {((members.data?.rows ?? []) as any[]).map((m) => (
              <div key={m.id} className="ink-border-sm flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3">
                <div>
                  <div className="font-chunk text-lg uppercase tracking-tight">{m.full_name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {m.email} · {String(m.track).replace("_", " ")} · {m.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  {(["active", "paused", "removed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={async () => {
                        try {
                          await setStatus({ data: { user_id: m.user_id, status: s } });
                          toast.success(`Marked ${s}`);
                          await qc.invalidateQueries({ queryKey: ["admin", "nestMembers"] });
                        } catch (e: any) {
                          toast.error(e?.message ?? "Failed");
                        }
                      }}
                      className={`${chip} ${m.status === s ? "bg-ink text-cream" : "bg-white"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
