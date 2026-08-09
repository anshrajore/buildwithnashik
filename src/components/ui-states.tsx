import type { ReactNode } from "react";
import { humanStatus, statusTone, type Tone } from "@/lib/event-utils";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success text-cream",
  warning: "bg-warning text-ink",
  info: "bg-info text-cream",
  danger: "bg-danger text-cream",
  neutral: "bg-neutral text-ink",
};

export function StatusBadge({ status, label }: { status: string | null | undefined; label?: string }) {
  const tone = statusTone(status);
  return (
    <span
      className={`ink-border-sm inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${TONE_CLASS[tone]}`}
    >
      {label ?? humanStatus(status)}
    </span>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`ink-border-sm inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon = "◇",
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="ink-border-sm rounded-2xl bg-white p-10 text-center">
      <div className="font-chunk text-4xl text-ink/20">{icon}</div>
      <h3 className="mt-3 font-chunk text-2xl uppercase tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-md font-mono text-xs text-ink/60">{body}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 3, height = "h-20" }: { rows?: number; height?: string }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`ink-border-sm ${height} animate-pulse rounded-2xl bg-white/60`} />
      ))}
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="ink-border-sm rounded-2xl bg-white p-6">
      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-danger">Couldn't load this</div>
      <p className="mt-2 font-sans text-sm text-ink/75">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ink-border-sm mt-4 rounded-full bg-ink px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Stat({ label, value, tone = "neutral" }: { label: string; value: ReactNode; tone?: Tone }) {
  return (
    <div className="ink-border-sm rounded-2xl bg-white p-4">
      <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink/50">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-chunk text-3xl leading-none tracking-tight">{value}</div>
        <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_CLASS[tone].split(" ")[0]}`} />
      </div>
    </div>
  );
}

export function SectionTitle({ index, title, sub }: { index?: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
        {index && <span className="tag-orange text-cream">{index}</span>}
        {sub}
      </div>
      <h2 className="mt-2 font-chunk text-3xl uppercase leading-none tracking-tight md:text-4xl">{title}</h2>
    </div>
  );
}
