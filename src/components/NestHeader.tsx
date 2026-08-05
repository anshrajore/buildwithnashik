import { Link } from "@tanstack/react-router";

export function NestHeader({ active }: { active: "nest" | "events" }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/nest" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink font-display text-xl text-cream">N</span>
          <span className="font-chunk text-xl uppercase tracking-tight">Team Nest</span>
          <span className="tag-yellow ml-1 hidden px-1.5 py-0 font-mono text-[10px] sm:inline">Nashik</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/nest"
            className={`font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-orange ${active === "nest" ? "text-orange" : "text-ink/70"}`}
          >
            Nest
          </Link>
          <Link
            to="/events"
            className={`font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-orange ${active === "events" ? "text-orange" : "text-ink/70"}`}
          >
            Events
          </Link>
          <Link
            to="/"
            className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5"
          >
            BWN 2026 →
          </Link>
        </nav>
      </div>
    </header>
  );
}
