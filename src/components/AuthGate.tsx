import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/hooks/use-auth-user";

/**
 * Sign-in wall shown before any action that must be attributed to a person
 * (registering for an event, submitting a round, saving swag, applying).
 */
export function AuthGate({
  open,
  onClose,
  reason = "Sign in to continue",
  onSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  reason?: string;
  onSignedIn?: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function google() {
    setBusy(true);
    const res = await signInWithGoogle();
    setBusy(false);
    if (res.error) return toast.error(res.error);
    if (res.redirected) return;
    onSignedIn?.();
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + window.location.pathname },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Account created — confirm your email, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      toast.success("You're signed in");
      onSignedIn?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg w-full max-w-md overflow-hidden rounded-2xl bg-cream">
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink bg-ink px-6 py-4 text-cream">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">Team Nest account</div>
            <div className="font-chunk text-2xl uppercase tracking-tight">{reason}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full border-2 border-cream font-bold">
            ✕
          </button>
        </div>

        <div className="p-6">
          <button
            onClick={google}
            disabled={busy}
            className="ink-border-sm flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-ink/40">
            <span className="h-px flex-1 bg-ink/20" /> or email <span className="h-px flex-1 bg-ink/20" />
          </div>

          <form onSubmit={submit} className="grid gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
            />
            <button
              disabled={busy}
              className="ink-border-sm rounded-full bg-orange px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60"
            >
              {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60 underline underline-offset-4"
          >
            {mode === "signin" ? "New here? Create an account" : "← I already have an account"}
          </button>
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink/50">
            We store your name and email so organisers can contact you about the events you join.
          </p>
        </div>
      </div>
    </div>
  );
}
