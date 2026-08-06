import { Link } from "@tanstack/react-router";
import { useState } from "react";
import nestLogo from "@/assets/nest-logo.png";

const LINKS = [
  { to: "/nest", label: "Nest", key: "nest" },
  { to: "/events", label: "Events", key: "events" },
  { to: "/terms", label: "Brand & Terms", key: "terms" },
] as const;

export function NestHeader({ active }: { active: "nest" | "events" | "terms" }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <Link to="/nest" className="flex items-center gap-3" aria-label="Team Nest home">
          <img src={nestLogo} alt="NEST — Nashik Ecosystem for Startups & Technology" className="h-9 w-auto sm:h-11" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.key}
              to={l.to}
              className={`font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-orange ${
                active === l.key ? "text-orange" : "text-ink/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/"
            className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5"
          >
            BWN 2026 →
          </Link>
        </nav>

        <button
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="ink-border-sm grid h-10 w-10 place-items-center rounded-lg bg-cream font-mono text-sm font-bold md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="border-t-2 border-ink bg-cream px-5 pb-4 pt-3 md:hidden">
          <div className="grid gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`ink-border-sm rounded-xl px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest ${
                  active === l.key ? "bg-ink text-cream" : "bg-white text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="ink-border-sm rounded-xl bg-orange px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-cream"
            >
              Build With Nashik 2026 →
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
