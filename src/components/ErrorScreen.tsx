import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export type ErrorKind = 400 | 401 | 403 | 404 | 429 | 500 | "network" | "database";

const COPY: Record<string, { title: string; body: string; status: string }> = {
  "401": {
    status: "401 — Unauthorized",
    title: "You need to sign in",
    body: "This page is only visible to signed-in members. Sign in and we'll bring you right back.",
  },
  "403": {
    status: "403 — Forbidden",
    title: "You don't have access to this",
    body: "Your account doesn't have permission for this dashboard. Ask the event owner or a Nest founder to grant access.",
  },
  "404": {
    status: "404 — Not found",
    title: "This page doesn't exist",
    body: "The link may be broken, or the event may have been unpublished or removed.",
  },
  "429": {
    status: "429 — Too many requests",
    title: "Slow down for a moment",
    body: "You've made a lot of requests in a short time. Wait a minute and try again.",
  },
  "500": {
    status: "500 — Something went wrong",
    title: "Something went wrong while loading this page",
    body: "The error has been logged with the ID below. Retry, or head back to your dashboard.",
  },
  network: {
    status: "Network error",
    title: "We couldn't reach the server",
    body: "Check your internet connection and try again — nothing you submitted has been lost.",
  },
  database: {
    status: "Database error",
    title: "We couldn't read your data",
    body: "Our database didn't respond in time. Retry in a moment; if it keeps happening, contact Team Nest.",
  },
};

function makeCorrelationId(seed?: string) {
  const base = `${seed ?? ""}${Date.now()}${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) | 0;
  return `REQ-${Math.abs(hash).toString(16).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

export function ErrorScreen({
  kind = 500,
  error,
  route,
  onRetry,
  correlationId,
}: {
  kind?: ErrorKind;
  error?: unknown;
  route?: string;
  onRetry?: () => void;
  correlationId?: string;
}) {
  const copy = COPY[String(kind)] ?? COPY["500"]!;
  const id = useMemo(
    () => correlationId ?? makeCorrelationId(error instanceof Error ? error.message : undefined),
    [correlationId, error],
  );
  const at = useMemo(
    () => new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    [],
  );

  useEffect(() => {
    if (error) {
      // Full technical detail stays in the logs, keyed by the correlation ID.
      console.error(`[${id}] ${route ?? ""}`, error);
      reportLovableError(error instanceof Error ? error : new Error(String(error)), {
        boundary: "nest_error_screen",
        correlationId: id,
        route: route ?? "",
      });
    }
  }, [error, id, route]);

  return (
    <div className="paper grid min-h-screen place-items-center px-5 py-16 text-ink">
      <div className="ink-border-lg w-full max-w-xl rounded-3xl bg-white p-8 sm:p-10">
        <div className="chip">
          <span className="h-2 w-2 rounded-full bg-danger" /> {copy.status}
        </div>
        <h1 className="mt-5 font-chunk text-3xl uppercase leading-none tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 font-sans text-sm text-ink/70">{copy.body}</p>

        <dl className="mt-6 grid gap-2 rounded-2xl border-2 border-dashed border-ink/25 p-4 font-mono text-[10px] uppercase tracking-widest text-ink/60">
          {route && (
            <div className="flex flex-wrap justify-between gap-2">
              <dt>Route</dt>
              <dd className="text-ink">{route}</dd>
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-2">
            <dt>Error ID</dt>
            <dd className="text-ink">{id}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt>Timestamp</dt>
            <dd className="text-ink">{at}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="ink-border-sm rounded-full bg-orange px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5"
            >
              Retry
            </button>
          )}
          <Link
            to="/dashboard"
            className="ink-border-sm rounded-full bg-ink px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
          >
            Back to dashboard
          </Link>
          <Link
            to="/nest"
            className="ink-border-sm rounded-full bg-cream px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink"
          >
            Go to NEST
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Route-level error boundary body. */
export function RouteErrorScreen({ error, reset }: { error: Error; reset?: () => void }) {
  const router = useRouter();
  const route = typeof window !== "undefined" ? window.location.pathname : undefined;
  const kind: ErrorKind = /unauthor/i.test(error.message)
    ? 401
    : /forbidden|permission/i.test(error.message)
      ? 403
      : /not found/i.test(error.message)
        ? 404
        : /fetch|network/i.test(error.message)
          ? "network"
          : 500;
  return (
    <ErrorScreen
      kind={kind}
      error={error}
      route={route}
      onRetry={() => {
        router.invalidate();
        reset?.();
      }}
    />
  );
}
