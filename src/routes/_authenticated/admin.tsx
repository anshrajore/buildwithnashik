import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin, claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard · Build With Nashik" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const check = useServerFn(isCurrentUserAdmin);
  const claim = useServerFn(claimFirstAdmin);
  const [claiming, setClaiming] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "isAdmin"],
    queryFn: () => check(),
    retry: false,
  });

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  async function handleClaim() {
    setClaiming(true);
    try {
      const res: any = await claim();
      if (res?.ok) {
        toast.success("Admin access granted");
        await refetch();
      } else {
        toast.error(res?.code === "admin_exists" ? "An admin already exists. Ask them to grant you access." : "Could not claim admin");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setClaiming(false);
    }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/admin/login", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-cream paper font-mono text-xs uppercase tracking-widest">Loading…</div>;
  }

  if (!data?.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream paper px-4">
        <div className="ink-border-lg max-w-md w-full rounded-2xl bg-cream p-8 text-center">
          <div className="font-chunk text-3xl uppercase tracking-tight">Not an admin</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but has no admin role. If you're setting up the dashboard for the first time, claim it below.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60"
            >
              {claiming ? "…" : "Claim admin (first user only)"}
            </button>
            <button
              onClick={handleSignOut}
              className="ink-border-sm rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Overview", exact: true },
    { to: "/admin/teams", label: "Teams" },
    { to: "/admin/applications", label: "Mentors & Judges" },
    { to: "/admin/events", label: "Events" },
    { to: "/admin/sponsors", label: "Sponsors" },
    { to: "/admin/volunteers", label: "Volunteers" },
    { to: "/admin/members", label: "Nest Members" },

  ] as const;

  function isActive(to: string, exact?: boolean) {
    return exact ? pathname === to : pathname.startsWith(to);
  }

  return (
    <div className="min-h-screen bg-cream paper text-ink">
      <Toaster position="top-center" theme="light" />
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-chunk text-xl uppercase tracking-tight">BWN · Admin</Link>
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dashboard</span>
          </div>
          <button
            onClick={handleSignOut}
            className="ink-border-sm rounded-full bg-ink px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
          >
            Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to as any}
              className={`shrink-0 rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
                isActive(t.to, (t as any).exact) ? "bg-ink text-cream" : "text-ink/70 hover:bg-ink/5"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
