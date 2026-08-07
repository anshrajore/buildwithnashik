import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password · Build With Nashik" },
      { name: "description", content: "Set a new password for your Build With Nashik organiser account." },
      { property: "og:title", content: "Reset password · Build With Nashik" },
      { property: "og:description", content: "Set a new password for your Build With Nashik organiser account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setReady(true);
        setProblem(null);
      }
    });

    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams((window.location.hash ?? "").replace(/^#/, ""));

      const errDesc = url.searchParams.get("error_description") ?? hash.get("error_description");
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");

      try {
        if (errDesc) {
          setProblem(errDesc);
        } else if (code) {
          // PKCE-style recovery link
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash) {
          // Newer email links: ?token_hash=...&type=recovery
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          if (error) throw error;
        }
      } catch (e: any) {
        if (alive) setProblem(e?.message ?? "This reset link is invalid or has expired.");
      }

      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      if (data.session) {
        setReady(true);
        setProblem(null);
      }
    })();

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated — you're signed in.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-screen bg-cream paper text-ink grid place-items-center px-4">
      <Toaster position="top-center" theme="light" />
      <div className="ink-border-lg w-full max-w-md rounded-2xl bg-cream p-8">
        <Link to="/admin/login" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ← Back to sign in
        </Link>
        <h1 className="mt-2 font-chunk text-4xl uppercase tracking-tight">New password</h1>

        {!ready ? (
          <div className="mt-4 grid gap-3">
            <p className="text-sm text-muted-foreground">
              {problem
                ? problem
                : "Checking your reset link… open this page from the link in your inbox."}
            </p>
            <Link
              to="/admin/login"
              className="ink-border-sm justify-self-start rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-cream"
            >
              Request a new link
            </Link>
          </div>
        ) : (

          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <label className="grid gap-1">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest">New password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
              />
            </label>
            <label className="grid gap-1">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Confirm password</span>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="ink-border-sm rounded-lg bg-cream px-4 py-3 font-sans"
              />
            </label>
            <button
              disabled={busy}
              className="ink-border-sm mt-2 rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60"
            >
              {busy ? "…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
