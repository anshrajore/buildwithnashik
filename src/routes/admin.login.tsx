import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin · Build With Nashik" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // If already signed in, jump straight to admin
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin/login" },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream text-ink grid place-items-center px-4 paper">
      <Toaster position="top-center" theme="light" />
      <div className="ink-border-lg w-full max-w-md rounded-2xl bg-cream p-8">
        <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ← Back to site
        </Link>
        <div className="mt-2 font-chunk text-4xl uppercase tracking-tight">Admin</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Dashboard for Team Nest organizers only.
        </p>

        <div className="mt-6 inline-flex ink-border-sm rounded-full bg-cream p-1">
          {(["signin", "signup"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setMode(k)}
              className={`rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest ${
                mode === k ? "bg-ink text-cream" : "text-ink/60"
              }`}
            >
              {k === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <label className="grid gap-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
            />
          </label>
          <button
            disabled={busy}
            className="ink-border-sm mt-2 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60"
          >
            {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          First-time setup: create an account, confirm your email, then sign in — the first signed-in admin will be granted access automatically.
        </p>
      </div>
    </div>
  );
}
