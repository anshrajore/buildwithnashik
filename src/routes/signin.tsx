import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/hooks/use-auth-user";
import { getMyWorkspace } from "@/lib/organizer.functions";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/signin")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in · Team Nest" },
      { name: "description", content: "Sign in to register for Nest events, submit rounds and manage your dashboard." },
      { property: "og:title", content: "Sign in · Team Nest" },
      { property: "og:description", content: "One account for Build With Nashik, Nest events and your participant dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignInPage,
});

function safePath(p: string | undefined) {
  if (!p || !p.startsWith("/") || p.startsWith("//")) return "/dashboard";
  return p;
}

function SignInPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const dest = safePath(redirect);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: dest, replace: true });
    });
  }, [dest, navigate]);

  async function google() {
    setBusy(true);
    try {
      sessionStorage.setItem("nest_after_signin", dest);
    } catch {
      /* ignore */
    }
    const res = await signInWithGoogle();
    setBusy(false);
    if (res.error) return toast.error(res.error);
    if (res.redirected) return;
    navigate({ to: dest, replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Reset link sent. Check your inbox.");
        setMode("signin");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/signin" },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Account created — confirm your email, then sign in.");
          setMode("signin");
          return;
        }
        navigate({ to: dest, replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: dest, replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="paper grid min-h-screen place-items-center bg-cream px-4 text-ink">
      <Toaster position="top-center" theme="light" />
      <div className="ink-border-lg w-full max-w-md rounded-2xl bg-cream p-8">
        <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
          ← Back to site
        </Link>
        <h1 className="mt-2 font-chunk text-4xl uppercase tracking-tight">
          {mode === "signup" ? "Join Nest" : mode === "forgot" ? "Reset password" : "Sign in"}
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink/50">
          One account for events, rounds and dashboards
        </p>

        {mode !== "forgot" && (
          <>
            <button
              onClick={google}
              disabled={busy}
              className="ink-border-sm mt-6 w-full rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest disabled:opacity-60"
            >
              Continue with Google
            </button>
            <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-ink/40">
              <span className="h-px flex-1 bg-ink/20" /> or email <span className="h-px flex-1 bg-ink/20" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="grid gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
          />
          {mode !== "forgot" && (
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
            />
          )}
          <button
            disabled={busy}
            className="ink-border-sm rounded-full bg-orange px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60"
          >
            {busy ? "…" : mode === "forgot" ? "Send reset link" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="underline underline-offset-4">
            {mode === "signup" ? "Have an account?" : "Create account"}
          </button>
          <button onClick={() => setMode(mode === "forgot" ? "signin" : "forgot")} className="underline underline-offset-4">
            {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
          </button>
        </div>
      </div>
    </div>
  );
}
